#[starknet::interface]
pub trait IGameActions<T> {
    fn create_game(ref self: T, jackpot_id: Option<u32>) -> (u32, u16);
    fn set_slot(ref self: T, game_id: u32, target_idx: u8) -> u16;
    fn king_me(ref self: T, game_id: u32);
    fn set_active(ref self: T, active: bool);
    fn set_max_games(ref self: T, max_games: u32);
}

#[dojo::contract]
pub mod game_actions {
    use achievement::components::achievable::AchievableComponent;
    use core::array::ArrayTrait;
    use nums_common::models::jackpot::{Jackpot, JackpotMode};
    use nums_common::models::config::{Config, SlotRewardTrait};
    use nums_common::random::{Random, RandomImpl};
    use nums_common::WORLD_RESOURCE;
    use nums_appchain::models::game::{Game, GameTrait};
    use nums_appchain::models::totals::{Totals, GlobalTotals};
    use nums_appchain::models::slot::Slot;
    use nums_appchain::elements::achievements::index::{
        Achievement, AchievementTrait, ACHIEVEMENT_COUNT,
    };
    use nums_appchain::elements::tasks::index::{Task, TaskTrait};

    use dojo::model::ModelStorage;
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
            let config: Config = world.read_model(WORLD_RESOURCE);
            let game_config = config.game.expect('Game config not set');
            assert!(game_config.active, "Game is not active");

            if let Option::Some(expiration) = game_config.expiration {
                assert!(starknet::get_block_timestamp() < expiration, "Game expired");
            }

            let mut global_totals: GlobalTotals = world.read_model(WORLD_RESOURCE);
            global_totals.games_played += 1;

            if let Option::Some(max_games) = game_config.max_games {
                assert!(global_totals.games_played < max_games, "Max games reached");
            }

            let player = get_caller_address();
            let mut totals: Totals = world.read_model(player);
            totals.games_played += 1;

            world.write_model(@global_totals);
            world.write_model(@totals);

            let game_id = world.dispatcher.uuid();
            let mut rand = RandomImpl::new_vrf();
            let next_number = rand.between::<u16>(game_config.min_number, game_config.max_number);

            world
                .write_model(
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

            world
                .emit_event(
                    @GameCreated {
                        player,
                        game_id,
                    },
                );

            // Update achievement progression for the player
            let player_id: felt252 = player.into();
            let task_id: felt252 = Task::Grinder.identifier();
            self.achievable.progress(world, player_id, task_id, 1);

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
            let mut game: Game = world.read_model((game_id, player));

            assert!(game.player == player, "Unauthorized player");
            assert!(target_idx < game.max_slots, "Invalid slot");

            // Build up nums array and insert target
            let mut streak = 1;
            let mut prev_num = 0;
            let mut nums = ArrayTrait::<u16>::new();
            let mut idx = 0_u8;
            loop {
                let slot: Slot = world.read_model((game_id, player, idx));
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
            let mut rand = RandomImpl::new_vrf();
            let next_number = next_random(rand, @nums, game.min_number, game.max_number);

            game.next_number = next_number;
            game.remaining_slots -= 1;

            let mut totals: Totals = world.read_model(player);
            totals.slots_filled += 1;

            let config: Config = world.read_model(WORLD_RESOURCE);
            // Slot reward
            if let Option::Some(reward_config) = config.reward {
                let (_, amount) = reward_config.compute(game.level());
                game.reward += amount;
                totals.rewards_earned += amount.into();
            }

            world.write_model(@game);
            world.write_model(@totals);
            world.write_model(@Slot { game_id, player, index: target_idx, number: target_number });

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
                let task_id: felt252 = Task::FillerOne.identifier();
                self.achievable.progress(world, player_id, task_id, 1);
            } else if filled_slots == 15 {
                let task_id: felt252 = Task::FillerTwo.identifier();
                self.achievable.progress(world, player_id, task_id, 1);
            } else if filled_slots == 17 {
                let task_id: felt252 = Task::FillerThree.identifier();
                self.achievable.progress(world, player_id, task_id, 1);
            } else if filled_slots == 19 {
                let task_id: felt252 = Task::FillerFour.identifier();
                self.achievable.progress(world, player_id, task_id, 1);
            } else if filled_slots == 20 {
                let task_id: felt252 = Task::FillerFive.identifier();
                self.achievable.progress(world, player_id, task_id, 1);
            }

            // Update achievement progression for the player - Reference tasks
            if target_number == 21 {
                let task_id: felt252 = Task::ReferenceOne.identifier();
                self.achievable.progress(world, player_id, task_id, 1);
            } else if target_number == 42 {
                let task_id: felt252 = Task::ReferenceTwo.identifier();
                self.achievable.progress(world, player_id, task_id, 1);
            } else if target_number == 404 {
                let task_id: felt252 = Task::ReferenceThree.identifier();
                self.achievable.progress(world, player_id, task_id, 1);
            } else if target_number == 777 {
                let task_id: felt252 = Task::ReferenceFour.identifier();
                self.achievable.progress(world, player_id, task_id, 1);
            } else if target_number == 911 {
                let task_id: felt252 = Task::ReferenceFive.identifier();
                self.achievable.progress(world, player_id, task_id, 1);
            } else if target_number == 420 {
                let task_id: felt252 = Task::ReferenceSix.identifier();
                self.achievable.progress(world, player_id, task_id, 1);
            } else if target_number == 69 {
                let task_id: felt252 = Task::ReferenceSeven.identifier();
                self.achievable.progress(world, player_id, task_id, 1);
            }

            // Update achievement progression for the player - Streak tasks
            if streak == 2 {
                let task_id: felt252 = Task::StreakerOne.identifier();
                self.achievable.progress(world, player_id, task_id, 1);
            } else if streak == 3 {
                let task_id: felt252 = Task::StreakerTwo.identifier();
                self.achievable.progress(world, player_id, task_id, 1);
            } else if streak == 4 {
                let task_id: felt252 = Task::StreakerThree.identifier();
                self.achievable.progress(world, player_id, task_id, 1);
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
            let player = get_caller_address();
            let game: Game = world.read_model((game_id, player));
            let jackpot_id = game.jackpot_id.expect('Jackpot not defined');
            let mut jackpot: Jackpot = world.read_model(jackpot_id);

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
            world.write_model(@jackpot);
            world.emit_event(@KingCrowned { game_id, jackpot_id, player });

            // Update achievement progression for the player
            let player_id: felt252 = player.into();
            let task_id: felt252 = Task::King.identifier();
            self.achievable.progress(world, player_id, task_id, 1);
        }

        fn set_active(ref self: ContractState, active: bool) {
            let owner = starknet::get_caller_address();
            let mut world = self.world(@"nums");
            assert!(world.dispatcher.is_owner(WORLD_RESOURCE, owner), "Unauthorized owner");
            let mut config: Config = world.read_model(WORLD_RESOURCE);

            if let Option::Some(mut game_config) = config.game {
                game_config.active = active;
                config.game = Option::Some(game_config);
                world.write_model(@config);
            } else {
                assert!(false, "Game config not set");
            }
        }

        fn set_max_games(ref self: ContractState, max_games: u32) {
            let owner = starknet::get_caller_address();
            let mut world = self.world(@"nums");
            assert!(world.dispatcher.is_owner(WORLD_RESOURCE, owner), "Unauthorized owner");
            let mut config: Config = world.read_model(WORLD_RESOURCE);

            if let Option::Some(mut game_config) = config.game {
                game_config.max_games = Option::Some(max_games);
                config.game = Option::Some(game_config);
                world.write_model(@config);
            } else {
                assert!(false, "Game config not set");
            }
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

