#[starknet::component]
pub mod PlayableComponent {
    // Imports

    use achievement::components::achievable::AchievableComponent;
    use achievement::components::achievable::AchievableComponent::InternalImpl as AchievableInternalImpl;
    use dojo::world::{WorldStorage, WorldStorageTrait};
    use ekubo::components::clear::IClearDispatcherTrait;
    use ekubo::interfaces::erc20::{IERC20Dispatcher, IERC20DispatcherTrait};
    use ekubo::interfaces::router::{IRouterDispatcherTrait, RouteNode, TokenAmount};
    use ekubo::types::i129::i129;
    use ekubo::types::keys::PoolKey;
    use quest::components::questable::QuestableComponent;
    use quest::components::questable::QuestableComponent::InternalImpl as QuestableInternalImpl;
    use starknet::ContractAddress;
    use crate::components::starterpack::StarterpackComponent;
    use crate::components::starterpack::StarterpackComponent::InternalImpl as StarterpackInternalImpl;
    use crate::elements::quests::finisher;
    use crate::elements::quests::index::{IQuest, QuestType};
    use crate::elements::tasks::index::{Task, TaskTrait};
    use crate::interfaces::nums::INumsTokenDispatcherTrait;
    use crate::models::game::{AssertTrait, GameAssert, GameTrait};
    use crate::random::RandomImpl;
    use crate::systems::collection::{
        ICollectionDispatcher, ICollectionDispatcherTrait, NAME as COLLECTION,
    };
    use crate::{StoreImpl, StoreTrait};

    // Storage

    #[storage]
    pub struct Storage {}

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {}

    #[generate_trait]
    pub impl StarterpackImpl<
        TContractState,
        +HasComponent<TContractState>,
        impl Starterpack: StarterpackComponent::HasComponent<TContractState>,
        impl Achievable: AchievableComponent::HasComponent<TContractState>,
        impl Quest: QuestableComponent::HasComponent<TContractState>,
    > of StarterpackTrait<TContractState> {
        fn on_issue(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            recipient: ContractAddress,
            starterpack_id: u32,
            quantity: u32,
        ) {
            // [Setup] Store
            let store = StoreImpl::new(world);

            // [Check] Caller is allowed
            let starterpack = get_dep_component!(@self, Starterpack);
            starterpack.assert_is_allowed(world);

            // [Check] Starterpack is valid
            starterpack.assert_is_valid(world, starterpack_id);

            // [Effect] Quest progression
            let questable = get_dep_component!(@self, Quest);
            let task = QuestType::StarterOne;
            let player = recipient.into();
            if !questable.is_completed(world, player, task.identifier(), 0) {
                questable.progress(world, player, task.identifier(), 1, true);
            }

            // [Interaction] Mint games
            let config = store.config();
            let nums_supply = store.nums_disp().total_supply();
            let collection = self.get_collection(world);
            let mut count = quantity;
            while count > 0 {
                // [Interaction] Mint a game
                let game_id = collection.mint(recipient, true);

                // [Effect] Create game
                let mut game = GameTrait::new(
                    id: game_id,
                    slot_count: config.slot_count,
                    slot_min: config.slot_min,
                    slot_max: config.slot_max,
                    supply: nums_supply,
                );
                // [Effect] Create and setup game
                // let mut rand = RandomImpl::new_vrf(store.vrf_disp());
                let mut rand = RandomImpl::new_with_salt(game_id);
                let number = rand.between::<u16>(game.slot_min, game.slot_max);
                let next = rand.between::<u16>(game.slot_min, game.slot_max);
                // [Effect] Start game
                game.start(number, next);
                store.set_game(@game);
                // [Interaction] Update token metadata
                collection.update(game_id.into());
                // [Compute] Update count
                count -= 1;
            }

            // [Effect] Update quest progression for the player - Contender tasks
            let questable = get_dep_component!(@self, Quest);
            let task = Task::Grinder;
            questable.progress(world, player, task.identifier(), quantity.into(), true);

            // [Effect] Update quest progression for the player - StarterTwo
            let task = QuestType::StarterTwo;
            if !questable.is_completed(world, player, task.identifier(), 0) {
                questable.progress(world, player, task.identifier(), quantity.into(), true);
            }

            // [Effect] Update achievement progression for the player - Grinder task
            let achievable = get_dep_component!(@self, Achievable);
            achievable.progress(world, player, task.identifier(), quantity.into(), true);

            // [Interaction] Transfer quote token to Ekubo
            let pack = store.starterpack(starterpack_id);
            let quote = IERC20Dispatcher { contract_address: pack.payment_token };
            let quote_address = quote.contract_address;
            let nums = store.nums_disp();
            let nums_address = nums.contract_address;
            let this = starknet::get_contract_address();
            let amount = quote.balanceOf(this);
            let router = store.ekubo_router();
            quote.transfer(router.contract_address, amount);

            // [Interaction] Swap Quote token for Nums
            let pool_key = PoolKey {
                token0: quote.contract_address,
                token1: nums_address,
                fee: 0x0, // 0x28f5c28f5c28f5c28f5c28f5c28f5c2
                tick_spacing: 0x56a4c,
                // Mainnet: 0x43e4f09c32d13d43a880e85f69f7de93ceda62d6cf2581a582c6db635548fdc
                // Sepolia: 0x73ec792c33b52d5f96940c2860d512b3884f2127d25e023eb9d44a678e4b971
                extension: 0x73ec792c33b52d5f96940c2860d512b3884f2127d25e023eb9d44a678e4b971
                    .try_into()
                    .unwrap(),
            };
            let route_node = RouteNode {
                pool_key: pool_key, sqrt_ratio_limit: 0x1000003f7f1380b75, skip_ahead: 0,
            };
            let token_amount = TokenAmount {
                token: quote_address, amount: i129 { mag: amount.low, sign: false },
            };
            router.swap(route_node, token_amount);

            // [Interaction] Clear minimum
            let clearer = store.ekubo_clearer();
            clearer.clear_minimum(IERC20Dispatcher { contract_address: nums_address }, 0);
            clearer.clear(IERC20Dispatcher { contract_address: quote_address });

            // [Interaction] Burn the entry price
            let amount = nums.balance_of(this);
            nums.burn(amount);
        }
    }

    #[generate_trait]
    pub impl QuestRewarderImpl<
        TContractState,
        +HasComponent<TContractState>,
        impl Achievable: AchievableComponent::HasComponent<TContractState>,
        impl Quest: QuestableComponent::HasComponent<TContractState>,
    > of QuestRewarderTrait<TContractState> {
        fn on_quest_complete(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            recipient: ContractAddress,
            quest_id: felt252,
            interval_id: u64,
        ) {
            // [Effect] Update daily quest completions
            let questable = get_dep_component!(@self, Quest);
            let player = recipient.into();
            if quest_id == QuestType::DailyContenderOne.identifier()
                || quest_id == QuestType::DailyContenderTwo.identifier()
                || quest_id == QuestType::DailyContenderThree.identifier()
                || quest_id == QuestType::DailyEarnerOne.identifier()
                || quest_id == QuestType::DailyEarnerTwo.identifier()
                || quest_id == QuestType::DailyEarnerThree.identifier()
                || quest_id == QuestType::DailyPlacerOne.identifier()
                || quest_id == QuestType::DailyPlacerTwo.identifier()
                || quest_id == QuestType::DailyPlacerThree.identifier() {
                questable.progress(world, player, finisher::DailyFinisher::identifier(), 1, true);
            }
        }

        fn on_quest_claim(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            recipient: ContractAddress,
            quest_id: felt252,
            interval_id: u64,
        ) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Interaction] Reward player with Nums
            let quest: QuestType = quest_id.into();
            let (amount, task) = quest.reward();
            if amount != 0 {
                store.nums_disp().reward(recipient, amount);
            }

            // [Effect] Update achievement progression for daily quest completions
            if (task == Task::None) {
                return;
            }
            let achievable = get_dep_component!(@self, Achievable);
            let player: felt252 = recipient.into();
            achievable.progress(world, player, task.identifier(), 1, true);
        }
    }

    #[generate_trait]
    pub impl InternalImpl<
        TContractState,
        +HasComponent<TContractState>,
        +Drop<TContractState>,
        impl Achievable: AchievableComponent::HasComponent<TContractState>,
        impl Quest: QuestableComponent::HasComponent<TContractState>,
    > of InternalTrait<TContractState> {
        /// Sets a number in the specified slot for a game. It ensures the slot is valid and not
        fn set(
            ref self: ComponentState<TContractState>, world: WorldStorage, game_id: u64, index: u8,
        ) -> u16 {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Check] Token ownership
            let collection = self.get_collection(world);
            collection.assert_is_owner(starknet::get_caller_address(), game_id.into());

            // [Check] Game exists
            let mut game = store.game(game_id);
            game.assert_does_exist();

            // [Check] Game has started and is not over
            game.assert_has_started();
            game.assert_not_over();

            // [Effect] Place number
            let target_number = game.number;
            game.place(index);
            game.assert_is_valid();

            // [Effect] Update game
            let mut rand = RandomImpl::new_vrf(store.vrf_disp());
            let reward = game.update(ref rand, store.config().target_supply);
            store.set_game(@game);

            // [Interaction] Pay user reward
            let player = starknet::get_caller_address();
            store.nums_disp().reward(player, reward);

            // [Event] Emit reward event
            store.reward(game_id, reward);

            // [Effect] Update quest progression for the player - Contender tasks
            let questable = get_dep_component!(@self, Quest);
            let task = Task::Claimer;
            questable.progress(world, player.into(), task.identifier(), reward.into(), true);

            // [Effect] Update quest progression for the player - StarterThree
            let task = QuestType::StarterThree;
            if !questable.is_completed(world, player.into(), task.identifier(), 0) {
                questable.progress(world, player.into(), task.identifier(), 1, true);
            }

            // [Effect] Update quest progression for the player - StarterFour
            let task = QuestType::StarterFour;
            if !questable.is_completed(world, player.into(), task.identifier(), 0) {
                questable.progress(world, player.into(), task.identifier(), 1, true);
            }

            // [Effect] Update quest progression for the player - StarterFive
            let task = QuestType::StarterFive;
            if game.over && !questable.is_completed(world, player.into(), task.identifier(), 0) {
                questable.progress(world, player.into(), task.identifier(), 1, true);
            }

            // [Effect] Update achievement progression for the player - Claimer tasks
            let achievable = get_dep_component!(@self, Achievable);
            let task = Task::Claimer;
            achievable.progress(world, player.into(), task.identifier(), reward.into(), true);

            // [Effect] Update achievement progression for the player - Filler tasks
            let filled_slots = game.level;
            if filled_slots == 10 {
                achievable.progress(world, player.into(), Task::FillerOne.identifier(), 1, true);
                questable.progress(world, player.into(), Task::FillerTen.identifier(), 1, true);
            } else if filled_slots == 13 {
                achievable
                    .progress(world, player.into(), Task::FillerThirteen.identifier(), 1, true);
                questable
                    .progress(world, player.into(), Task::FillerThirteen.identifier(), 1, true);
            } else if filled_slots == 15 {
                achievable.progress(world, player.into(), Task::FillerTwo.identifier(), 1, true);
            } else if filled_slots == 16 {
                questable.progress(world, player.into(), Task::FillerSixteen.identifier(), 1, true);
            } else if filled_slots == 17 {
                achievable.progress(world, player.into(), Task::FillerThree.identifier(), 1, true);
                questable
                    .progress(world, player.into(), Task::FillerSeventeen.identifier(), 1, true);
            } else if filled_slots == 18 {
                questable
                    .progress(world, player.into(), Task::FillerEighteen.identifier(), 1, true);
            } else if filled_slots == 19 {
                achievable.progress(world, player.into(), Task::FillerFour.identifier(), 1, true);
                questable
                    .progress(world, player.into(), Task::FillerNineteen.identifier(), 1, true);
            } else if filled_slots == 20 {
                achievable.progress(world, player.into(), Task::FillerFive.identifier(), 1, true);
            }

            // [Effect] Update achievement progression for the player - Reference tasks
            if target_number == 21 {
                achievable.progress(world, player.into(), Task::ReferenceOne.identifier(), 1, true);
            } else if target_number == 42 {
                achievable.progress(world, player.into(), Task::ReferenceTwo.identifier(), 1, true);
            } else if target_number == 404 {
                achievable
                    .progress(world, player.into(), Task::ReferenceThree.identifier(), 1, true);
            } else if target_number == 777 {
                achievable
                    .progress(world, player.into(), Task::ReferenceFour.identifier(), 1, true);
            } else if target_number == 911 {
                achievable
                    .progress(world, player.into(), Task::ReferenceFive.identifier(), 1, true);
            } else if target_number == 420 {
                achievable.progress(world, player.into(), Task::ReferenceSix.identifier(), 1, true);
            } else if target_number == 69 {
                achievable
                    .progress(world, player.into(), Task::ReferenceSeven.identifier(), 1, true);
            }

            // [Interaction] Update token metadata
            collection.update(game_id.into());

            // [Return] Next number
            game.number
        }

        /// Selects a power for a game. It ensures the power is valid and not already selected.
        fn select(
            ref self: ComponentState<TContractState>, world: WorldStorage, game_id: u64, index: u8,
        ) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Check] Token ownership
            let collection = self.get_collection(world);
            collection.assert_is_owner(starknet::get_caller_address(), game_id.into());

            // [Check] Game state
            let mut game = store.game(game_id);
            game.assert_does_exist();
            game.assert_has_started();
            game.assert_not_over();

            // [Effect] Select power
            game.select(index);

            // [Effect] Update game
            store.set_game(@game);

            // [Interaction] Update token metadata
            collection.update(game_id.into());
        }

        /// Sets a number in the specified slot for a game. It ensures the slot is valid and not
        fn apply(
            ref self: ComponentState<TContractState>, world: WorldStorage, game_id: u64, index: u8,
        ) -> u16 {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Check] Token ownership
            let collection = self.get_collection(world);
            collection.assert_is_owner(starknet::get_caller_address(), game_id.into());

            // [Check] Game state
            let mut game = store.game(game_id);
            game.assert_does_exist();
            game.assert_has_started();
            game.assert_not_over();

            // [Effect] Apply power
            let mut rand = RandomImpl::new_vrf(store.vrf_disp());
            game.apply(index, ref rand);

            // [Effect] Update game
            store.set_game(@game);

            // [Interaction] Update token metadata
            collection.update(game_id.into());

            // [Return] Next number
            game.number
        }
    }

    #[generate_trait]
    pub impl PrivateImpl<
        TContractState, +HasComponent<TContractState>,
    > of PrivateTrait<TContractState> {
        fn get_collection(
            ref self: ComponentState<TContractState>, world: WorldStorage,
        ) -> ICollectionDispatcher {
            let (collection_address, _) = world.dns(@COLLECTION()).expect('Collection not found!');
            ICollectionDispatcher { contract_address: collection_address }
        }
    }
}
