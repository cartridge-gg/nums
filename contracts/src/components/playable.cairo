#[starknet::component]
pub mod PlayableComponent {
    // Imports
    use achievement::components::achievable::AchievableComponent;
    use achievement::components::achievable::AchievableComponent::InternalImpl as AchievableInternalImpl;
    use constants::TEN_POW_18;
    use dojo::world::{WorldStorage, WorldStorageTrait};
    use ekubo::components::clear::IClearDispatcherTrait;
    use ekubo::interfaces::erc20::IERC20Dispatcher;
    use ekubo::interfaces::router::{IRouterDispatcherTrait, RouteNode, TokenAmount};
    use ekubo::types::i129::i129;
    use ekubo::types::keys::PoolKey;
    use leaderboard::components::rankable::RankableComponent;
    use leaderboard::components::rankable::RankableComponent::InternalImpl as RankableInternalImpl;
    use openzeppelin::interfaces::token::erc20::{IERC20MixinDispatcher, IERC20MixinDispatcherTrait};
    use openzeppelin::interfaces::token::erc721::{IERC721Dispatcher, IERC721DispatcherTrait};
    use quest::components::questable::QuestableComponent;
    use quest::components::questable::QuestableComponent::InternalImpl as QuestableInternalImpl;
    use starknet::ContractAddress;
    use crate::elements::quests::finisher;
    use crate::elements::quests::index::{IQuest, QuestType};
    use crate::elements::tasks::index::{Task, TaskTrait};
    use crate::helpers::random::RandomImpl;
    use crate::helpers::rewarder::Rewarder;
    use crate::models::config::{ConfigAssert, ConfigTrait};
    use crate::models::game::{AssertTrait, GameAssert, GameTrait};
    use crate::models::starterpack::StarterpackAssert;
    use crate::systems::collection::{
        ICollectionDispatcher, ICollectionDispatcherTrait, NAME as COLLECTION,
    };
    use crate::systems::team::NAME as TEAM;
    use crate::systems::token::{ITokenDispatcher, ITokenDispatcherTrait, NAME as TOKEN};
    use crate::systems::vault::{IVaultDispatcher, IVaultDispatcherTrait, NAME as VAULT};
    use crate::{StoreImpl, StoreTrait, constants};

    // Constants

    const LEADERBOARD_ID: felt252 = 1;

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
        +Drop<TContractState>,
        impl Achievable: AchievableComponent::HasComponent<TContractState>,
        impl Quest: QuestableComponent::HasComponent<TContractState>,
        impl Rankable: RankableComponent::HasComponent<TContractState>,
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
            let config = store.config();
            let caller = starknet::get_caller_address();
            config.assert_is_starterpack(caller);

            // [Check] Starterpack is valid
            let pack = store.starterpack(starterpack_id);
            pack.assert_does_exist();

            // [Interaction] Transfer the burn share to Ekubo
            let amount = quantity.into()
                * pack.multiplier.into()
                * config.base_price
                * config.burn_percentage.into()
                / 100_u256;
            let quote = IERC20MixinDispatcher { contract_address: pack.payment_token };
            let router = store.ekubo_router();
            quote.transfer(router.contract_address, amount);

            // [Interaction] Swap Quote token for Nums
            let nums_address = self.get_token(world).contract_address;
            let (token0, token1) = if quote.contract_address < nums_address {
                (quote.contract_address, nums_address)
            } else {
                (nums_address, quote.contract_address)
            };
            let pool_key = PoolKey {
                token0: token0,
                token1: token1,
                fee: config.pool_fee, // 0x28f5c28f5c28f5c28f5c28f5c28f5c2
                tick_spacing: config.pool_tick_spacing, // 0x56a4c,
                // Mainnet: 0x43e4f09c32d13d43a880e85f69f7de93ceda62d6cf2581a582c6db635548fdc
                // Sepolia: 0x73ec792c33b52d5f96940c2860d512b3884f2127d25e023eb9d44a678e4b971
                extension: config.pool_extension,
            };
            let route_node = RouteNode {
                pool_key: pool_key, sqrt_ratio_limit: config.pool_sqrt, skip_ahead: 0,
            };
            let quote_address = quote.contract_address;
            let token_amount = TokenAmount {
                token: quote_address, amount: i129 { mag: amount.low, sign: false },
            };
            router.swap(route_node, token_amount);

            // [Interaction] Clear minimum
            let clearer = store.ekubo_clearer();
            clearer.clear_minimum(IERC20Dispatcher { contract_address: nums_address }, 0);
            clearer.clear(IERC20Dispatcher { contract_address: quote_address });

            // [Interaction] Burn the corresponding amount of Nums
            let this = starknet::get_contract_address();
            let asset = IERC20MixinDispatcher { contract_address: nums_address };
            let nums_supply = asset.total_supply();
            let burn_amount = asset.balance_of(this);
            let asset = ITokenDispatcher { contract_address: nums_address };
            asset.burn(burn_amount);

            // [Interaction] Pay dividends to the vault
            let vault_address = self.get_vault(world).contract_address;
            let vault = IVaultDispatcher { contract_address: vault_address };
            let amount = quote.balanceOf(this);
            let vault_amount = amount * config.vault_percentage.into() / 100;
            quote.approve(spender: vault.contract_address, amount: vault_amount);
            vault.pay(recipient.into(), vault_amount);

            // [Interaction] Transfer the remaining amount to the team
            let team_address = world.dns_address(@TEAM()).expect('Team not found!');
            let team_amount = quote.balanceOf(this);
            quote.transfer(team_address, team_amount);

            // [Compute] Multiplier per game
            let burn_per_game = burn_amount / quantity.into();
            let supply_per_game = nums_supply - burn_per_game;
            let (avg_num, avg_den) = config.average_score();
            let multiplier = Rewarder::multiplier(
                supply_per_game,
                config.target_supply,
                burn_per_game,
                avg_num.into(),
                avg_den.into(),
                config.slot_count.into(),
            );

            // [Interaction] Mint games
            let pack = store.starterpack(starterpack_id);
            let mut count = quantity;
            while count > 0 {
                // [Effect] Create game
                self.create(world, recipient, multiplier, supply_per_game, pack.price);
                // [Compute] Update count
                count -= 1;
            }

            // [Event] Emit purchase event
            store.purchased(recipient.into(), starterpack_id, quantity, multiplier);
        }
    }

    #[generate_trait]
    pub impl QuestRewarderImpl<
        TContractState,
        +HasComponent<TContractState>,
        +Drop<TContractState>,
        impl Achievable: AchievableComponent::HasComponent<TContractState>,
        impl Quest: QuestableComponent::HasComponent<TContractState>,
        impl Rankable: RankableComponent::HasComponent<TContractState>,
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
            questable.progress(world, player, finisher::DailyFinisher::identifier(), 1, true);

            // [Effect] Autoclaim quest
            questable.claim(world, player, quest_id, interval_id);
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

            // [Interaction] Reward player with Games
            let quest: QuestType = quest_id.into();
            if !quest.reward() {
                return;
            }
            // [Effect] Create game
            let nums_address = store.nums_disp().contract_address;
            let asset = IERC20MixinDispatcher { contract_address: nums_address };
            let nums_supply = asset.total_supply();
            let multiplier = constants::MULTIPLIER_PRECISION;
            self.create(world, recipient, multiplier, nums_supply, 0);
        }
    }

    #[generate_trait]
    pub impl InternalImpl<
        TContractState,
        +HasComponent<TContractState>,
        +Drop<TContractState>,
        impl Achievable: AchievableComponent::HasComponent<TContractState>,
        impl Quest: QuestableComponent::HasComponent<TContractState>,
        impl Rankable: RankableComponent::HasComponent<TContractState>,
    > of InternalTrait<TContractState> {
        /// Create a new game. It ensures the game is valid and not already created.
        fn create(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            player: ContractAddress,
            multiplier: u128,
            supply: u256,
            price: u256,
        ) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Interaction] Mint a game
            let collection = self.get_collection(world);
            let game_id = collection.mint(player, false);

            // [Effect] Create game
            let config = store.config();
            let mut game = GameTrait::new(
                id: game_id,
                multiplier: multiplier,
                slot_count: config.slot_count,
                slot_min: config.slot_min,
                slot_max: config.slot_max,
                supply: supply,
                price: price,
            );
            // [Effect] Start game
            let mut rand = RandomImpl::new(game_id.into());
            game.start(ref rand);
            store.set_game(@game);
            // [Interaction] Update token metadata
            collection.update(game_id.into());
        }


        /// Sets a number in the specified slot for a game. It ensures the slot is valid and not
        fn set(
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
            game.assert_not_expired();

            // [Effect] Place number
            let mut rand = RandomImpl::new_vrf(store.vrf_disp());
            let target_number = game.number;
            let mut traps = array![];
            game.place(game.number, index, ref rand, ref traps);
            game.assert_is_valid();

            // [Effect] Update game
            game.update(ref rand, store.config().target_supply);
            store.set_game(@game);

            // [Event] Emit leaderboard score if game is over
            let player = self.owner(world, game_id);
            let time = starknet::get_block_timestamp();
            if game.over != 0 {
                // [Effect] Update average score
                let mut config = store.config();
                config.push(game.level.into(), constants::EMA_MIN_SCORE.into());
                store.set_config(config);

                // [Effect] Update leaderboard score
                let mut rankable = get_dep_component_mut!(ref self, Rankable);
                rankable
                    .submit(
                        world: world,
                        leaderboard_id: LEADERBOARD_ID,
                        game_id: game.id,
                        player_id: player.into(),
                        score: game.level.into(),
                        time: time,
                        to_store: true,
                    );

                // [Effect] Claim rewards
                self.claim(world, game_id);
            }

            // [Effect] Update quest progression for the player
            let questable = get_dep_component!(@self, Quest);
            questable.progress(world, player.into(), Task::Filler.identifier(), 1, true);
            questable
                .progress(
                    world, player.into(), Task::Trigger.identifier(), traps.len().into(), true,
                );

            // [Effect] Update achievement progression for the player
            let achievable = get_dep_component!(@self, Achievable);
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

            // [Effect] Update achievement progression - Placer (cumulative)
            achievable.progress(world, player.into(), Task::Filler.identifier(), 1, true);

            // [Effect] Update achievement progression - Trapper (cumulative)
            achievable
                .progress(
                    world, player.into(), Task::Trigger.identifier(), traps.len().into(), true,
                );

            // [Effect] Update achievement progression - Chainer (single turn)
            let trap_count: u32 = traps.len();
            if trap_count >= 3 {
                achievable.progress(world, player.into(), Task::ChainerOne.identifier(), 1, true);
            }
            if trap_count >= 4 {
                achievable.progress(world, player.into(), Task::ChainerTwo.identifier(), 1, true);
            }
            if trap_count >= 5 {
                achievable.progress(world, player.into(), Task::ChainerThree.identifier(), 1, true);
            }

            // [Effect] Update achievement progression - Streak
            let mut slots = game.slots();
            let streak = GameTrait::streak(ref slots);
            if streak >= 2 {
                achievable.progress(world, player.into(), Task::StreakerOne.identifier(), 1, true);
            }
            if streak >= 3 {
                achievable.progress(world, player.into(), Task::StreakerTwo.identifier(), 1, true);
            }
            if streak >= 4 {
                achievable
                    .progress(world, player.into(), Task::StreakerThree.identifier(), 1, true);
            }

            // [Interaction] Update token metadata
            collection.update(game_id.into());

            // [Event] Emit started event
            if game.level == 1 {
                // [Info] Only for the first action
                store.started(player.into(), game_id, game.multiplier);
                // [Effect] Update quest progression for the player - Grinder task
                let task = Task::Grinder;
                achievable.progress(world, player.into(), task.identifier(), 1, true);
            } else if game.level == 16 {
                achievable
                    .progress(world, player.into(), Task::FillerSixteen.identifier(), 1, true);
            } else if game.level == 17 {
                achievable
                    .progress(world, player.into(), Task::FillerSeventeen.identifier(), 1, true);
            } else if game.level == 18 {
                achievable
                    .progress(world, player.into(), Task::FillerEighteen.identifier(), 1, true);
            }

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
            game.assert_not_expired();

            // [Effect] Select power
            game.select(index);

            // [Effect] Update game
            store.set_game(@game);

            // [Event] Emit leaderboard score if game is over
            let player = self.owner(world, game_id);
            let time = starknet::get_block_timestamp();
            if game.over != 0 {
                // [Effect] Update average score
                let mut config = store.config();
                config.push(game.level.into(), constants::EMA_MIN_SCORE.into());
                store.set_config(config);

                // [Effect] Update leaderboard score
                let mut rankable = get_dep_component_mut!(ref self, Rankable);
                rankable
                    .submit(
                        world: world,
                        leaderboard_id: LEADERBOARD_ID,
                        game_id: game.id,
                        player_id: player.into(),
                        score: game.level.into(),
                        time: time,
                        to_store: true,
                    );

                // [Effect] Claim rewards
                self.claim(world, game_id);
            }

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
            game.assert_not_expired();

            // [Effect] Apply power
            let mut rand = RandomImpl::new_vrf(store.vrf_disp());
            game.apply(index, ref rand);

            // [Effect] Update game
            store.set_game(@game);

            // [Event] Emit leaderboard score if game is over
            let player = self.owner(world, game_id);
            let time = starknet::get_block_timestamp();
            if game.over != 0 {
                // [Effect] Update average score
                let mut config = store.config();
                config.push(game.level.into(), constants::EMA_MIN_SCORE.into());
                store.set_config(config);

                // [Effect] Update leaderboard score
                let mut rankable = get_dep_component_mut!(ref self, Rankable);
                rankable
                    .submit(
                        world: world,
                        leaderboard_id: LEADERBOARD_ID,
                        game_id: game.id,
                        player_id: player.into(),
                        score: game.level.into(),
                        time: time,
                        to_store: true,
                    );

                // [Effect] Claim rewards
                self.claim(world, game_id);
            }

            // [Effect] Update quest progression for the player
            let questable = get_dep_component!(@self, Quest);
            questable.progress(world, player.into(), Task::Power.identifier(), 1, true);

            // [Effect] Update achievement progression - Power (cumulative)
            let achievable = get_dep_component!(@self, Achievable);
            achievable.progress(world, player.into(), Task::Power.identifier(), 1, true);

            // [Effect] Update achievement progression - Game over (Streak, Filler)
            if game.over != 0 {
                let mut slots = game.slots();
                let streak = GameTrait::streak(ref slots);
                if streak >= 2 {
                    achievable
                        .progress(world, player.into(), Task::StreakerOne.identifier(), 1, true);
                }
                if streak >= 3 {
                    achievable
                        .progress(world, player.into(), Task::StreakerTwo.identifier(), 1, true);
                }
                if streak >= 4 {
                    achievable
                        .progress(world, player.into(), Task::StreakerThree.identifier(), 1, true);
                }
                if game.level >= 16 {
                    achievable
                        .progress(world, player.into(), Task::FillerSixteen.identifier(), 1, true);
                }
                if game.level >= 17 {
                    achievable
                        .progress(
                            world, player.into(), Task::FillerSeventeen.identifier(), 1, true,
                        );
                }
                if game.level >= 18 {
                    achievable
                        .progress(world, player.into(), Task::FillerEighteen.identifier(), 1, true);
                }
            }

            // [Interaction] Update token metadata
            collection.update(game_id.into());

            // [Return] Next number
            game.number
        }

        fn claim(ref self: ComponentState<TContractState>, world: WorldStorage, game_id: u64) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Check] Token ownership
            let collection = self.get_collection(world);
            collection.assert_is_owner(starknet::get_caller_address(), game_id.into());

            // [Check] Game state
            let mut game = store.game(game_id);
            game.assert_does_exist();
            game.assert_is_over();
            game.assert_not_expired();
            game.assert_not_claimed();

            // [Effect] Claim game
            let mut game = store.game(game_id);
            let reward: u128 = game.claim();
            let base_reward: u128 = reward / TEN_POW_18;

            // [Effect] Update game
            store.set_game(@game);

            // [Effect] Update achievement progression for the player - Claimer tasks
            let player = self.owner(world, game_id);
            let achievable = get_dep_component!(@self, Achievable);
            let task = Task::Claimer;
            achievable.progress(world, player.into(), task.identifier(), base_reward, true);

            // [Interaction] Pay user reward
            let player = self.owner(world, game_id);
            store.nums_disp().reward(player, reward.into());

            // [Event] Emit claimed event
            store.claimed(player.into(), game_id, base_reward);
        }
    }

    #[generate_trait]
    pub impl PrivateImpl<
        TContractState, +HasComponent<TContractState>,
    > of PrivateTrait<TContractState> {
        fn get_collection(
            self: @ComponentState<TContractState>, world: WorldStorage,
        ) -> ICollectionDispatcher {
            let (collection_address, _) = world.dns(@COLLECTION()).expect('Collection not found!');
            ICollectionDispatcher { contract_address: collection_address }
        }

        fn get_token(
            self: @ComponentState<TContractState>, world: WorldStorage,
        ) -> ITokenDispatcher {
            let token_address = world.dns_address(@TOKEN()).expect('Token not found!');
            ITokenDispatcher { contract_address: token_address }
        }

        fn get_vault(
            self: @ComponentState<TContractState>, world: WorldStorage,
        ) -> IVaultDispatcher {
            let vault_address = world.dns_address(@VAULT()).expect('Vault not found!');
            IVaultDispatcher { contract_address: vault_address }
        }

        fn owner(
            self: @ComponentState<TContractState>, world: WorldStorage, game_id: u64,
        ) -> ContractAddress {
            let (collection_address, _) = world.dns(@COLLECTION()).expect('Collection not found!');
            let collection = IERC721Dispatcher { contract_address: collection_address };
            collection.owner_of(game_id.into())
        }
    }
}
