#[starknet::component]
pub mod PlayableComponent {
    // Imports

    use achievement::components::achievable::AchievableComponent;
    use achievement::components::achievable::AchievableComponent::InternalImpl as AchievableInternalImpl;
    use dojo::world::{WorldStorage, WorldStorageTrait};
    use game_components::minigame::interface::{IMinigameDispatcher, IMinigameDispatcherTrait};
    use game_components::minigame::libs;
    use game_components::minigame::libs::{assert_token_ownership, post_action, pre_action};
    use game_components::token::core::interface::{
        IMinigameTokenDispatcher, IMinigameTokenDispatcherTrait,
    };
    use game_components::token::extensions::minter::interface::{
        IMinigameTokenMinterDispatcher, IMinigameTokenMinterDispatcherTrait,
    };
    use starknet::ContractAddress;
    use crate::components::merkledrop::MerkledropComponent;
    use crate::components::merkledrop::MerkledropComponent::InternalImpl as MerkledropInternalImpl;
    use crate::components::starterpack::StarterpackComponent;
    use crate::components::starterpack::StarterpackComponent::InternalImpl as StarterpackInternalImpl;
    use crate::components::tournament::TournamentComponent;
    use crate::components::tournament::TournamentComponent::InternalImpl as TournamentInternalImpl;
    use crate::constants::{CLIENT_URL, TEN_POW_18};
    use crate::elements::achievements::index::{ACHIEVEMENT_COUNT, Achievement, AchievementTrait};
    use crate::elements::tasks::index::{Task, TaskTrait};
    use crate::interfaces::nums::INumsTokenDispatcherTrait;
    use crate::models::game::{AssertTrait, GameAssert, GameTrait};
    use crate::models::leaderboard::LeaderboardTrait;
    use crate::models::slot::SlotTrait;
    use crate::models::tournament::TournamentTrait;
    use crate::random::RandomImpl;
    use crate::systems::minigame::NAME as GAME_NAME;
    use crate::systems::renderer::NAME as RENDERER_NAME;
    use crate::systems::settings::SETTINGS_ID;
    use crate::types::game_config::DefaultGameConfig;
    use crate::{StoreImpl, StoreTrait};

    // Constants

    pub const ENTRY_PRICE: u128 = 2000;

    // Storage

    #[storage]
    pub struct Storage {}

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {}

    // Types

    #[derive(Drop, Copy, Clone, Serde, PartialEq)]
    pub struct LeafData {
        pub player_name: felt252,
        pub quantity: u32,
    }

    #[generate_trait]
    pub impl MerkledropImpl<
        TContractState,
        +HasComponent<TContractState>,
        impl Merkledrop: MerkledropComponent::HasComponent<TContractState>,
    > of MerkledropTrait<TContractState> {
        fn on_claim(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            recipient: ContractAddress,
            leaf_data: Span<felt252>,
        ) {
            // [Check] Caller is allowed
            let merkledrop = get_dep_component!(@self, Merkledrop);
            merkledrop.assert_is_allowed(world);

            // [Check] Merkledrop is valid
            merkledrop.assert_is_valid(world);

            // [Interaction] Mint a game
            let mut leaf_data = leaf_data;
            let data = Serde::<LeafData>::deserialize(ref leaf_data).unwrap();
            let player_name = data.player_name;
            let mut quantity = data.quantity;
            while quantity > 0 {
                self.mint_game(world, Option::Some(player_name), recipient, false);
                quantity -= 1;
            }
        }
    }

    #[generate_trait]
    pub impl StarterpackImpl<
        TContractState,
        +HasComponent<TContractState>,
        impl Starterpack: StarterpackComponent::HasComponent<TContractState>,
    > of StarterpackTrait<TContractState> {
        fn on_issue(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            recipient: ContractAddress,
            starterpack_id: u32,
        ) {
            // [Check] Caller is allowed
            let starterpack = get_dep_component!(@self, Starterpack);
            starterpack.assert_is_allowed(world);

            // [Check] Starterpack is valid
            starterpack.assert_is_valid(world, starterpack_id);

            // [Interaction] Mint a game
            self.mint_game(world, Option::None, recipient, true);
        }
    }

    #[generate_trait]
    pub impl InternalImpl<
        TContractState,
        +HasComponent<TContractState>,
        +Drop<TContractState>,
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

        fn buy(
            ref self: ComponentState<TContractState>, world: WorldStorage, player_name: felt252,
        ) -> u64 {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Interaction] Pay
            let sender = starknet::get_caller_address();
            let recipient = starknet::get_contract_address();
            let amount: u256 = (ENTRY_PRICE * TEN_POW_18).into();
            store.nums_disp().transfer_from(sender, recipient, amount);

            // [Interaction] Burn the entry price
            store.nums_disp().burn(amount);

            // [Interaction] Mint a game
            self.mint_game(world, Option::Some(player_name), recipient, false)
        }

        fn start(
            ref self: ComponentState<TContractState>, world: WorldStorage, game_id: u64,
        ) -> (u64, u16) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Check] Token ownership
            let token_address = self.get_minigame(world).token_address();
            assert_token_ownership(token_address, game_id);

            // [Check] Perform pre actions
            pre_action(token_address, game_id);

            // [Check] Game is valid
            self.assert_valid_game(world, game_id);

            // [Check] Game does not exist
            let game = store.game(game_id);
            game.assert_not_exist();

            // [Effect] Create and setup game
            let config = DefaultGameConfig::default();
            let mut rand = RandomImpl::new_vrf(store.vrf_disp());
            let next_number = rand.between::<u16>(config.min_number, config.max_number);
            let now = starknet::get_block_timestamp();
            let mut game = GameTrait::new(game_id, now, next_number, config);
            let tournament_id = TournamentTrait::uuid();
            game.start(tournament_id);
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
            let token_address = self.get_minigame(world).token_address();
            assert_token_ownership(token_address, game_id);

            // [Interaction] Perform pre actions
            pre_action(token_address, game_id);

            // [Check] Game is valid
            self.assert_valid_game(world, game_id);

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
            store.set_game(@game);

            // [Interaction] Pay user reward
            let player = starknet::get_caller_address();
            let amount: u64 = (game.reward.into() * TEN_POW_18).try_into().unwrap();
            store.nums_disp().reward(player, amount);

            // [Effect] Update achievement progression for the player - Claimer tasks
            let achievable = get_dep_component!(@self, Achievable);
            achievable
                .progress(world, player.into(), Task::Claimer.identifier(), game.reward.into());

            // [Effect] Update leaderboard
            let mut leaderboard = store.leaderboard(game.tournament_id);
            let is_first = leaderboard.insert(game, ref store);
            store.set_leaderboard(@leaderboard);

            // [Effect] Update King achievement if first place
            if is_first {
                achievable.progress(world, player.into(), Task::King.identifier(), 1);
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
        #[inline]
        fn mint_game(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            player_name: Option<felt252>,
            to: ContractAddress,
            soulbound: bool,
        ) -> u64 {
            let minigame = self.get_minigame(world);
            let game_address = minigame.contract_address;
            let collection_address = minigame.token_address();
            let renderer_address = self.get_renderer_address(world);
            let token_id = libs::mint(
                minigame_token_address: collection_address,
                game_address: game_address,
                player_name: player_name,
                settings_id: Option::Some(SETTINGS_ID),
                start: Option::None,
                end: Option::None,
                objective_ids: Option::None,
                context: Option::None,
                client_url: Option::Some(CLIENT_URL()),
                renderer_address: Option::Some(renderer_address),
                to: to,
                soulbound: soulbound,
            );

            token_id
        }

        #[inline]
        fn get_minigame(
            self: @ComponentState<TContractState>, world: WorldStorage,
        ) -> IMinigameDispatcher {
            let (game_address, _) = world.dns(@GAME_NAME()).unwrap();
            IMinigameDispatcher { contract_address: game_address }
        }

        #[inline]
        fn get_renderer_address(
            self: @ComponentState<TContractState>, world: WorldStorage,
        ) -> ContractAddress {
            let (renderer_address, _) = world.dns(@RENDERER_NAME()).unwrap();
            renderer_address
        }

        #[inline]
        fn assert_valid_game(
            self: @ComponentState<TContractState>, world: WorldStorage, game_id: u64,
        ) {
            let (game_address, _) = world.dns(@GAME_NAME()).unwrap();
            let minigame = IMinigameDispatcher { contract_address: game_address };
            let token_address = minigame.token_address();
            let token = IMinigameTokenDispatcher { contract_address: token_address };
            let token_metadata = token.token_metadata(game_id);
            let minter = IMinigameTokenMinterDispatcher { contract_address: token_address };
            let minted_by_address = minter.get_minter_address(token_metadata.minted_by);
            assert(minted_by_address == starknet::get_contract_address(), 'Game is not valid');
        }
    }
}
