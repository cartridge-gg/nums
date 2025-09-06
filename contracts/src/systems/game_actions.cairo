#[starknet::interface]
pub trait IGameActions<T> {
    fn create_game(ref self: T, factory_id: u32) -> (u32, u16);
    fn set_slot(ref self: T, game_id: u32, target_idx: u8) -> u16;
    // fn king_me(ref self: T, game_id: u32);
}

#[dojo::contract]
pub mod game_actions {
    use achievement::components::achievable::AchievableComponent;
    use core::array::ArrayTrait;
    use core::num::traits::Pow;
    use dojo::event::EventStorage;
    use dojo::world::{IWorldDispatcherTrait, WorldStorageTrait};
    use nums::elements::achievements::index::{ACHIEVEMENT_COUNT, Achievement, AchievementTrait};
    use nums::elements::tasks::index::{Task, TaskTrait};
    use nums::interfaces::nums::INumsTokenDispatcherTrait;
    use nums::models::config::{ConfigImpl, ConfigTrait};
    use nums::models::game::{Game, GameTrait};
    use nums::models::jackpot::{JackpotImpl, JackpotTrait};
    use nums::models::slot::Slot;
    use nums::random::{Random, RandomImpl};
    use nums::{StoreImpl, StoreTrait};
    use starknet::{ContractAddress, get_caller_address, get_contract_address};
    use crate::models::JackpotFactoryTrait;
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

    // #[derive(Drop, Serde)]
    // #[dojo::event]
    // pub struct Inserted {
    //     #[key]
    //     game_id: u32,
    //     #[key]
    //     player: ContractAddress,
    //     index: u8,
    //     number: u16,
    //     next_number: u16,
    //     remaining_slots: u8,
    //     game_rewards: u32,
    // }

    #[derive(Drop, Serde)]
    #[dojo::event]
    pub struct GameCreated {
        #[key]
        player: ContractAddress,
        #[key]
        jackpot_id: u32,
        game_id: u32,
    }

    #[derive(Drop, Serde)]
    #[dojo::event]
    pub struct NewWinner {
        #[key]
        player: ContractAddress,
        #[key]
        jackpot_id: u32,
        game_id: u32,
        score: u8,
        is_equal: bool,
        has_ended: bool,
    }

    // #[derive(Drop, Serde)]
    // #[dojo::event]
    // pub struct KingCrowned {
    //     #[key]
    //     game_id: u32,
    //     #[key]
    //     jackpot_id: u32,
    //     player: ContractAddress,
    // }

    const DECIMALS: u256 = 10_u256.pow(18);


    fn dojo_init(self: @ContractState) {
        // [Event] Emit all Achievement events
        let mut world = self.world(@"nums");
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
        fn create_game(ref self: ContractState, factory_id: u32) -> (u32, u16) {
            let mut world = self.world(@"nums");
            let mut store = StoreImpl::new(world);
            let player = get_caller_address();

            let game_config = store.game_config();
            let mut factory = store.jackpot_factory(factory_id);

            let mut jackpot = if let Option::Some(current_jackpot_id) = factory.current_jackpot_id {
                let jackpot = store.jackpot(current_jackpot_id);
                if !jackpot.has_ended(ref store) {
                    jackpot
                } else if factory.can_create_jackpot(ref store) {
                    factory.create_jackpot(ref world, ref store)
                } else {
                    panic!("not jackpot left");
                }
            } else if factory.can_create_jackpot(ref store) {
                factory.create_jackpot(ref world, ref store)
            } else {
                panic!("not jackpot left");
            };


            // transfer entry_cost token from player to this contract
            // player must approve this contract to spend entry_cost nums
            let nums_disp = store.nums_disp();
            let entry_cost = DECIMALS * game_config.entry_cost.into();

            // split / burn / transfer
            let burn_pct = 50; // TODO: config or auto adjust

            let to_burn = entry_cost * burn_pct / 100;
            let to_jackpot = entry_cost - to_burn;

            println!("to_jackpot: {}", to_jackpot);
            println!("to_burn: {}", to_burn);

            // transfer to this contract
            nums_disp.transfer_from(player, get_contract_address(), entry_cost);

            // transfer to jackpot_actions & burn
            let jackpot_actions_addr = world
                .dns_address(@"jackpot_actions")
                .expect('jackpot_actions not found');

            nums_disp.transfer(jackpot_actions_addr, to_jackpot);
            nums_disp.burn(to_burn);

            // keep track of jackpot balance
            jackpot.nums_balance += to_jackpot;
            store.set_jackpot(@jackpot);

            let game_id = world.dispatcher.uuid();
            let mut rand = RandomImpl::new_vrf(store.vrf_disp());
            let next_number = rand.between::<u16>(game_config.min_number, game_config.max_number);

            let now = starknet::get_block_timestamp();
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
                        jackpot_id: jackpot.id,
                        expires_at: now + game_config.game_duration,
                        game_over: false,
                    },
                );

            world.emit_event(@GameCreated { player, game_id, jackpot_id: jackpot.id });

            // Update achievement progression for the player
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
            let mut jackpot = store.jackpot(game.jackpot_id);
            let mut factory = store.jackpot_factory(jackpot.factory_id);
            let config = store.config();

            assert!(!game.has_expired(), "Game has expired");
            assert!(!jackpot.has_ended(ref store), "Jackpot has ended");
            assert!(game.player == player, "Unauthorized player");
            assert!(target_idx < game.max_slots, "Invalid slot");

            // Build up nums array and insert target
            let mut streak = 1;
            let mut prev_num = 0;
            let mut nums = array![];
            let mut idx = 0_u8;
            while idx < game.max_slots {
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
                    }
                    prev_num = slot.number;
                }

                if target_idx == idx {
                    nums.append(game.next_number);

                    // Update streak
                    if prev_num != 0 && game.next_number == prev_num + 1 {
                        streak += 1;
                    } else {
                        streak = 1;
                    }
                    prev_num = game.next_number;
                }

                idx += 1_u8;
            }

            // Check ordering of new nums array
            assert!(game.is_valid(@nums), "Invalid game state");

            // Update game state
            let target_number = game.next_number;
            let mut rand = RandomImpl::new_vrf(store.vrf_disp());
            let next_number = next_random(rand, @nums, game.min_number, game.max_number);

            game.next_number = next_number;
            game.reward += config.get_reward(game.level());
            game.remaining_slots -= 1;

            store.set_game(@game);
            store.set_slot(@Slot { game_id, player, index: target_idx, number: target_number });

            // Handle game over, jackpot winners
            let is_game_over = game.is_game_over(ref store);
            let score = game.level();
            let has_min_score = score >= factory.min_slots;
            let is_equal = score == jackpot.best_score;
            let is_better = score > jackpot.best_score;

            println!("is_game_over : {}", is_game_over);
            println!("score : {}", score);
            println!("has_min_score : {}", has_min_score);
            println!("is_equal : {}", is_equal);
            println!("is_better : {}", is_better);

            if score > jackpot.best_score {
                jackpot.best_score = score;
            }

            if is_game_over && has_min_score && (is_equal || is_better) {
                if is_equal {
                    jackpot.total_winners += 1;
                }
                if is_better {
                    jackpot.total_winners = 1;
                }

                let mut jackpot_winner = store
                    .jackpot_winner(jackpot.id, jackpot.total_winners - 1);
                jackpot_winner.player = player;

                if jackpot.end_at + factory.extension_duration > jackpot.end_at {
                    jackpot.end_at += factory.extension_duration;
                }

                // todo: check not already in the list ?
                store.set_jackpot_winner(@jackpot_winner);

                let has_ended = jackpot.has_ended(ref store);

                world
                    .emit_event(
                        @NewWinner {
                            jackpot_id: jackpot.id, player, game_id, score, is_equal, has_ended,
                        },
                    );
                // self.achievable.progress(world, player.into(), Task::King.identifier(), 1);
            }

            store.set_jackpot(@jackpot);

            if is_game_over {
                // mint nums rewards
                store.nums_disp().reward(player, game.reward.into());

                game.game_over = true;
                store.set_game(@game);

                // check if should init next jackpot
                if factory.can_create_jackpot(ref store) {
                    factory.create_jackpot(ref world, ref store);
                }
            }

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

        while idx < nums.len() {
            if *nums.at(idx) == random {
                reroll = true;
                break;
            }

            idx += 1;
        }

        match reroll {
            true => next_random(rand, nums, min, max),
            false => random,
        }
    }
}

