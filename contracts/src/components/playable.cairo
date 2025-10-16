#[starknet::component]
pub mod PlayableComponent {
    // Imports

    use achievement::components::achievable::AchievableComponent;
    use achievement::components::achievable::AchievableComponent::InternalImpl as AchievableInternalImpl;
    use dojo::world::{WorldStorage, WorldStorageTrait};
    use game_components::minigame::interface::{IMinigameDispatcher, IMinigameDispatcherTrait};
    use game_components::minigame::libs::{assert_token_ownership, post_action, pre_action};
    use starknet::ContractAddress;
    use crate::components::tournament::TournamentComponent;
    use crate::components::tournament::TournamentComponent::InternalImpl as TournamentInternalImpl;
    use crate::elements::achievements::index::{ACHIEVEMENT_COUNT, Achievement, AchievementTrait};
    use crate::elements::tasks::index::{Task, TaskTrait};
    use crate::interfaces::nums::INumsTokenDispatcherTrait;
    use crate::models::game::{AssertTrait, GameAssert, GameTrait};
    use crate::models::leaderboard::LeaderboardTrait;
    use crate::models::slot::SlotTrait;
    use crate::random::RandomImpl;
    use crate::systems::minigame::NAME as GAME_NAME;
    use crate::types::game_config::DefaultGameConfig;
    use crate::{StoreImpl, StoreTrait};

    // Storage

    #[storage]
    pub struct Storage {}

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {}

    #[generate_trait]
    pub impl InternalImpl<
        TContractState,
        +HasComponent<TContractState>,
        impl Tournament: TournamentComponent::HasComponent<TContractState>,
        impl Achievable: AchievableComponent::HasComponent<TContractState>,
    > of InternalTrait<TContractState> {
        fn initialize(ref self: ComponentState<TContractState>, world: WorldStorage) {
            // [Event] Initialize all Achievements
            let mut achievement_id: u8 = ACHIEVEMENT_COUNT;
            while achievement_id > 0 {
                let achievement: Achievement = achievement_id.into();
                let achievable = get_dep_component!(@self, Achievable);
                achievable
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

        fn start(
            ref self: ComponentState<TContractState>, world: WorldStorage, game_id: u64,
        ) -> (u64, u16) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Check] Token ownership
            let token_address = self.get_token_address(world);
            assert_token_ownership(token_address, game_id);

            // [Interaction] Perform pre actions
            pre_action(token_address, game_id);

            // [Check] Game does not exist
            let game = store.game(game_id);
            game.assert_not_exist();

            // [Effect] Create leaderboard if it doesn't exist
            let tournament = get_dep_component!(@self, Tournament);
            let tournament_id = tournament.get_tournament_id(world, game_id);
            let mut leaderboard = store.leaderboard(tournament_id);
            if !leaderboard.exists() {
                let tournament_config = tournament.get_game_config(world);
                let leaderboard = LeaderboardTrait::new(
                    tournament_id, tournament_config.prize_spots.into(),
                );
                store.set_leaderboard(@leaderboard);
            }

            // [Effect] Create and setup game
            let config = DefaultGameConfig::default();
            let mut rand = RandomImpl::new_vrf(store.vrf_disp());
            let next_number = rand.between::<u16>(config.min_number, config.max_number);
            let now = starknet::get_block_timestamp();
            let game = GameTrait::new(game_id, now, next_number, config);
            store.set_game(@game);

            // [Effect] Update achievement progression for the player - Grinder task
            let player = starknet::get_caller_address();
            let achievable = get_dep_component!(@self, Achievable);
            achievable.progress(world, player.into(), Task::Grinder.identifier(), 1);

            // [Interaction] Perform post actions
            post_action(token_address, game_id);

            (game_id, next_number)
        }

        /// Sets a number in the specified slot for a game. It ensures the slot is valid and not
        fn set(
            ref self: ComponentState<TContractState>, world: WorldStorage, game_id: u64, index: u8,
        ) -> u16 {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Check] Token ownership
            let token_address = self.get_token_address(world);
            assert_token_ownership(token_address, game_id);

            // [Interaction] Perform pre actions
            pre_action(token_address, game_id);

            // [Check] Game exists
            let mut game = store.game(game_id);
            game.assert_does_exist();

            // [Check] Game has not expired
            game.assert_not_expired();

            // [Check] Game index is valid
            let config = DefaultGameConfig::default();
            game.assert_valid_index(config, index);

            // [Check] Ordering is valid
            let mut streak = 1;
            let mut prev_num = 0;
            let mut nums = array![];
            let mut idx: u8 = 0;
            while idx < config.max_slots {
                let slot = store.slot(game_id, idx);
                if slot.number != 0 {
                    // Check if we're trying to insert into a filled slot
                    assert!(index != idx, "Slot already filled");
                    nums.append(slot.number);

                    // Update streak
                    if prev_num != 0 && slot.number == prev_num + 1 {
                        streak += 1;
                    } else {
                        streak = 1;
                    }
                    prev_num = slot.number;
                }

                if index == idx {
                    nums.append(game.next_number);

                    // Update streak
                    if prev_num != 0 && game.next_number == prev_num + 1 {
                        streak += 1;
                    } else {
                        streak = 1;
                    }
                    prev_num = game.next_number;
                }

                idx += 1;
            }
            game.assert_is_valid(@nums);

            // [Effect] Create slot
            let target_number = game.next_number;
            let slot = SlotTrait::new(game_id, index, target_number);
            store.set_slot(@slot);

            // [Effect] Update game
            let mut rand = RandomImpl::new_vrf(store.vrf_disp());
            game.update(ref rand, @nums, config);
            game.over = game.is_over(config, @nums);
            store.set_game(@game);

            // [Check] Game is over
            let achievable = get_dep_component!(@self, Achievable);
            let player = starknet::get_caller_address();
            if game.over {
                // [Effect] Update leaderboard
                let tournament = get_dep_component!(@self, Tournament);
                let tournament_id = tournament.get_tournament_id(world, game_id);
                let mut leaderboard = store.leaderboard(tournament_id);
                let is_first = leaderboard.insert(game, ref store);
                store.set_leaderboard(@leaderboard);

                // [Effect] Update King achievement if first place
                if is_first {
                    achievable.progress(world, player.into(), Task::King.identifier(), 1);
                }

                // [Interaction] Send rewards if game is over
                store.nums_disp().reward(player, game.reward.into());

                // [Effect] Update achievement progression for the player - Claimer tasks
                achievable
                    .progress(world, player.into(), Task::Claimer.identifier(), game.reward.into());
            }

            // [Effect] Update achievement progression for the player - Filler tasks
            let filled_slots = nums.len();
            if filled_slots == 10 {
                achievable.progress(world, player.into(), Task::FillerOne.identifier(), 1);
            } else if filled_slots == 15 {
                achievable.progress(world, player.into(), Task::FillerTwo.identifier(), 1);
            } else if filled_slots == 17 {
                achievable.progress(world, player.into(), Task::FillerThree.identifier(), 1);
            } else if filled_slots == 19 {
                achievable.progress(world, player.into(), Task::FillerFour.identifier(), 1);
            } else if filled_slots == 20 {
                achievable.progress(world, player.into(), Task::FillerFive.identifier(), 1);
            }

            // [Effect] Update achievement progression for the player - Reference tasks
            if target_number == 21 {
                achievable.progress(world, player.into(), Task::ReferenceOne.identifier(), 1);
            } else if target_number == 42 {
                achievable.progress(world, player.into(), Task::ReferenceTwo.identifier(), 1);
            } else if target_number == 404 {
                achievable.progress(world, player.into(), Task::ReferenceThree.identifier(), 1);
            } else if target_number == 777 {
                achievable.progress(world, player.into(), Task::ReferenceFour.identifier(), 1);
            } else if target_number == 911 {
                achievable.progress(world, player.into(), Task::ReferenceFive.identifier(), 1);
            } else if target_number == 420 {
                achievable.progress(world, player.into(), Task::ReferenceSix.identifier(), 1);
            } else if target_number == 69 {
                achievable.progress(world, player.into(), Task::ReferenceSeven.identifier(), 1);
            }

            // [Effect] Update achievement progression for the player - Streak tasks
            if streak == 2 {
                achievable.progress(world, player.into(), Task::StreakerOne.identifier(), 1);
            } else if streak == 3 {
                achievable.progress(world, player.into(), Task::StreakerTwo.identifier(), 1);
            } else if streak == 4 {
                achievable.progress(world, player.into(), Task::StreakerThree.identifier(), 1);
            }

            // [Interaction] Perform post actions
            post_action(token_address, game_id);

            // [Return] Next number
            game.next_number
        }
    }

    #[generate_trait]
    pub impl PrivateImpl<
        TContractState, +HasComponent<TContractState>,
    > of PrivateTrait<TContractState> {
        fn get_token_address(
            self: @ComponentState<TContractState>, world: WorldStorage,
        ) -> ContractAddress {
            let (game_address, _) = world.dns(@GAME_NAME()).unwrap();
            let minigame = IMinigameDispatcher { contract_address: game_address };
            minigame.token_address()
        }
    }
}
