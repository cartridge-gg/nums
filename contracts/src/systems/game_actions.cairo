#[starknet::interface]
pub trait IGameActions<T> {
    fn create_game(ref self: T, jackpot_id: Option<u32>) -> (u32, u16);
    fn set_slot(ref self: T, game_id: u32, target_idx: u8) -> u16;
    fn king_me(ref self: T, game_id: u32);
}

#[dojo::contract]
pub mod game_actions {
    use achievement::components::achievable::AchievableComponent;
    use core::array::ArrayTrait;
    use nums::models::jackpot::{JackpotMode};
    use nums::models::config::{SlotRewardTrait};
    use nums::random::{Random, RandomImpl};
    use nums::models::game::{Game, GameTrait};
    use nums::models::slot::Slot;
    use nums::elements::achievements::index::{Achievement, AchievementTrait, ACHIEVEMENT_COUNT};
    use nums::elements::tasks::index::{Task, TaskTrait};
    use nums::{StoreImpl, StoreTrait};

    use dojo::event::EventStorage;
    use dojo::world::{IWorldDispatcherTrait, WorldStorage};

    use starknet::{ContractAddress, get_caller_address};
    use super::IGameActions;

    // Components

    component!(path: AchievableComponent, storage: achievable, event: AchievableEvent);
    impl AchievableInternalImpl = AchievableComponent::InternalImpl<ContractState>;

    // Storage

    #[storage]
    struct Storage {
        #[substorage(v0)]
        achievable: AchievableComponent::Storage,
    }

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        AchievableEvent: AchievableComponent::Event,
    }

    #[derive(Drop, Serde)]
    #[dojo::event]
    pub struct Inserted {
        #[key]
        game_id: u32,
        #[key]
        player: ContractAddress,
        index: u8,
        number: u16,
        next_number: u16,
        remaining_slots: u8,
        game_rewards: u32,
    }

    #[derive(Drop, Serde)]
    #[dojo::event]
    pub struct GameCreated {
        #[key]
        player: ContractAddress,
        game_id: u32,
    }

    #[derive(Drop, Serde)]
    #[dojo::event]
    pub struct KingCrowned {
        #[key]
        game_id: u32,
        #[key]
        jackpot_id: u32,
        player: ContractAddress,
    }

    // Constuctor

    fn dojo_init(self: @ContractState) {
        // [Event] Emit all Achievement events
        let mut world: WorldStorage = self.world(@"nums");
        let mut achievement_id: u8 = ACHIEVEMENT_COUNT;
        while achievement_id > 0 {
            let achievement: Achievement = achievement_id.into();
            self
                .achievable
                .create(
                    world,
                    id: achievement.identifier(),
                    hidden: achievement.hidden(),
                    index: achievement.index(),
                    points: achievement.points(),
                    start: 0,
                    end: 0,
                    group: achievement.group(),
                    icon: achievement.icon(),
                    title: achievement.title(),
                    description: achievement.description(),
                    tasks: achievement.tasks(),
                    data: achievement.data(),
                );
            achievement_id -= 1;
        }
    }

    #[abi(embed_v0)]
    impl GameActionsImpl of IGameActions<ContractState> {
        /// Creates a new game instance, initializes its state, and emits a creation event.
        ///
        /// # Returns
        /// A tuple containing the game ID and the first random number for the game.
        fn create_game(ref self: ContractState, jackpot_id: Option<u32>) -> (u32, u16) {
            let mut world = self.world(@"nums");
            let mut store = StoreImpl::new(world);
            let player = get_caller_address();

            // let config = store.config();
            let game_config = store.game_config();

            let mut global_totals = store.global_totals();
            global_totals.games_played += 1;

            let mut totals = store.totals(player);
            totals.games_played += 1;

            store.set_global_totals(global_totals);
            store.set_totals(@totals);

            let game_id = world.dispatcher.uuid();
            let mut rand = RandomImpl::new_vrf(store.vrf_disp());
            let next_number = rand.between::<u16>(game_config.min_number, game_config.max_number);

            store
                .set_game(
                    @Game {
                        game_id,
                        player,
                        max_slots: game_config.max_slots,
                        remaining_slots: game_config.max_slots,
                        max_number: game_config.max_number,
                        min_number: game_config.min_number,
                        next_number,
                        reward: 0,
                        jackpot_id,
                    },
                );

            world.emit_event(@GameCreated { player, game_id });

            // Update achievement progression for the player
            // let player_id: felt252 = player.into();
            // let task_id: felt252 = Task::Grinder.identifier();
            self.achievable.progress(world, player.into(), Task::Grinder.identifier(), 1);

            (game_id, next_number)
        }

        /// Sets a number in the specified slot for a game. It ensures the slot is valid and not
        /// already filled, updates the game state, and emits an event indicating the slot has been
        /// filled.
        ///
        /// # Arguments
        /// * `game_id` - The identifier of the game.
        /// * `target_idx` - The index of the slot to be set.
        ///
        /// # Returns
        /// The next random number to be used in the game.
        fn set_slot(ref self: ContractState, game_id: u32, target_idx: u8) -> u16 {
            let player = get_caller_address();
            let mut world = self.world(@"nums");
            let mut store = StoreImpl::new(world);
            let mut game = store.game(game_id, player);

            assert!(game.player == player, "Unauthorized player");
            assert!(target_idx < game.max_slots, "Invalid slot");

            // Build up nums array and insert target
            let mut streak = 1;
            let mut prev_num = 0;
            let mut nums = ArrayTrait::<u16>::new();
            let mut idx = 0_u8;
            loop {
                let slot = store.slot(game_id, player, idx);
                if slot.number != 0 {
                    // Check if we're trying to insert into a filled slot
                    assert!(target_idx != idx, "Slot already filled");
                    nums.append(slot.number);

                    // Update streak
                    if prev_num != 0 && slot.number == prev_num + 1 {
                        streak += 1;
                    } else {
                        streak = 1;
                    };
                    prev_num = slot.number;
                }

                if target_idx == idx {
                    nums.append(game.next_number);

                    // Update streak
                    if prev_num != 0 && game.next_number == prev_num + 1 {
                        streak += 1;
                    } else {
                        streak = 1;
                    };
                    prev_num = game.next_number;
                }

                idx += 1_u8;
                if idx == game.max_slots {
                    break;
                }
            };

            // Check ordering of new nums array
            assert!(game.is_valid(@nums), "Invalid game state");

            // Update game state
            let target_number = game.next_number;
            let mut rand = RandomImpl::new_vrf(store.vrf_disp());
            let next_number = next_random(rand, @nums, game.min_number, game.max_number);

            game.next_number = next_number;
            game.remaining_slots -= 1;

            let mut totals = store.totals(player);
            totals.slots_filled += 1;

            let config = store.config();
            // Slot reward
            if let Option::Some(reward_config) = config.reward {
                let (_, amount) = reward_config.compute(game.level());
                game.reward += amount;
                totals.rewards_earned += amount.into();
            }

            store.set_game(@game);
            store.set_totals(@totals);
            store.set_slot(@Slot { game_id, player, index: target_idx, number: target_number });

            // world
            //     .emit_event(
            //         @Inserted {
            //             game_id,
            //             player,
            //             index: target_idx,
            //             number: target_number,
            //             next_number,
            //             remaining_slots: game.remaining_slots,
            //             game_rewards: game.reward,
            //         },
            //     );

            // Update achievement progression for the player - Filler tasks
            let player_id: felt252 = player.into();
            let filled_slots = nums.len();
            if filled_slots == 10 {
                self.achievable.progress(world, player_id, Task::FillerOne.identifier(), 1);
            } else if filled_slots == 15 {
                self.achievable.progress(world, player_id, Task::FillerTwo.identifier(), 1);
            } else if filled_slots == 17 {
                self.achievable.progress(world, player_id, Task::FillerThree.identifier(), 1);
            } else if filled_slots == 19 {
                self.achievable.progress(world, player_id, Task::FillerFour.identifier(), 1);
            } else if filled_slots == 20 {
                self.achievable.progress(world, player_id, Task::FillerFive.identifier(), 1);
            }

            // Update achievement progression for the player - Reference tasks
            if target_number == 21 {
                self.achievable.progress(world, player_id, Task::ReferenceOne.identifier(), 1);
            } else if target_number == 42 {
                self.achievable.progress(world, player_id, Task::ReferenceTwo.identifier(), 1);
            } else if target_number == 404 {
                self.achievable.progress(world, player_id, Task::ReferenceThree.identifier(), 1);
            } else if target_number == 777 {
                self.achievable.progress(world, player_id, Task::ReferenceFour.identifier(), 1);
            } else if target_number == 911 {
                self.achievable.progress(world, player_id, Task::ReferenceFive.identifier(), 1);
            } else if target_number == 420 {
                self.achievable.progress(world, player_id, Task::ReferenceSix.identifier(), 1);
            } else if target_number == 69 {
                self.achievable.progress(world, player_id, Task::ReferenceSeven.identifier(), 1);
            }

            // Update achievement progression for the player - Streak tasks
            if streak == 2 {
                self.achievable.progress(world, player_id, Task::StreakerOne.identifier(), 1);
            } else if streak == 3 {
                self.achievable.progress(world, player_id, Task::StreakerTwo.identifier(), 1);
            } else if streak == 4 {
                self.achievable.progress(world, player_id, Task::StreakerThree.identifier(), 1);
            }

            next_number
        }

        /// Attempts to crown the caller as the new king in a King of the Hill jackpot.
        ///
        /// This function allows a player to claim the position of "king" in a King of the Hill
        /// jackpot game. It verifies that the game is associated with a King of the Hill
        /// jackpot, updates the current king, and potentially extends the jackpot's expiration
        /// time.
        ///
        /// The remaining_slots mechanism ensures that each new king must have fewer or equal
        /// remaining slots compared to the previous king. This creates a progressively more
        /// challenging game as it continues.
        ///
        /// # Arguments
        /// * `game_id` - The identifier of the game associated with the jackpot.
        fn king_me(ref self: ContractState, game_id: u32) {
            let mut world = self.world(@"nums");
            let mut store = StoreImpl::new(world);
            let player = get_caller_address();
            let game = store.game(game_id, player);
            let jackpot_id = game.jackpot_id.expect('Jackpot not defined');
            let mut jackpot = store.jackpot(jackpot_id);

            let mut king_of_the_hill = match jackpot.mode {
                JackpotMode::KING_OF_THE_HILL(koth) => koth,
                _ => panic!("Not a King of the Hill jackpot"),
            };

            assert(jackpot.expiration > starknet::get_block_timestamp(), 'Jackpot already expired');
            assert(
                game.remaining_slots < king_of_the_hill.remaining_slots
                    || (game.remaining_slots == king_of_the_hill.remaining_slots
                        && player != king_of_the_hill.king),
                'No improvement or already king',
            );

            king_of_the_hill.king = player;
            king_of_the_hill.remaining_slots = game.remaining_slots;

            if king_of_the_hill.extension_time > 0 {
                let new_expiration = jackpot.expiration + king_of_the_hill.extension_time;
                if new_expiration > jackpot.expiration {
                    jackpot.expiration = new_expiration;
                }
            }

            // Update the jackpot with the new king
            jackpot.mode = JackpotMode::KING_OF_THE_HILL(king_of_the_hill);
            store.set_jackpot(@jackpot);
            world.emit_event(@KingCrowned { game_id, jackpot_id, player });

            // Update achievement progression for the player
            self.achievable.progress(world, player.into(), Task::King.identifier(), 1);
        }
    }

    /// Generates a random `u16` number between `min` and `max` that is not already present in the
    /// given array `nums`.
    /// If the generated number is found in the array, it recursively generates a new random number
    /// until a unique one is found.
    ///
    /// # Arguments
    /// * `rand` - A `Random` object used to generate random numbers.
    /// * `nums` - An array of `u16` numbers to check for duplicates.
    /// * `min` - The minimum value for the random number range.
    /// * `max` - The maximum value for the random number range.
    ///
    /// # Returns
    /// A unique random `u16` number between `min` and `max`.
    fn next_random(mut rand: Random, mut nums: @Array<u16>, min: u16, max: u16) -> u16 {
        let random = rand.between::<u16>(min, max);
        let mut reroll = false;
        let mut idx = 0_u32;
        loop {
            if idx == nums.len() {
                break;
            }

            if *nums.at(idx) == random {
                reroll = true;
                break;
            }

            idx += 1;
        };

        match reroll {
            true => next_random(rand, nums, min, max),
            false => random,
        }
    }
}

