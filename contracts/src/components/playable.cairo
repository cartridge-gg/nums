#[starknet::component]
pub mod PlayableComponent {
    // Imports
    use achievement::component::Component as AchievementComponent;
    use achievement::component::Component::InternalImpl as AchievementInternalImpl;
    use constants::TEN_POW_18;
    use dojo::world::{WorldStorage, WorldStorageTrait};
    use leaderboard::components::rankable::RankableComponent;
    use leaderboard::components::rankable::RankableComponent::InternalImpl as RankableInternalImpl;
    use openzeppelin::interfaces::token::erc20::{IERC20MixinDispatcher, IERC20MixinDispatcherTrait};
    use openzeppelin::interfaces::token::erc721::{IERC721Dispatcher, IERC721DispatcherTrait};
    use quest::component::Component as QuestableComponent;
    use quest::component::Component::InternalImpl as QuestableInternalImpl;
    use starknet::ContractAddress;
    use crate::elements::achievements::index::{ACHIEVEMENT_COUNT, AchievementType, IAchievement};
    use crate::elements::quests::finisher;
    use crate::elements::quests::index::{IQuest, QUEST_COUNT, QuestProps, QuestType};
    use crate::elements::tasks::index::{Task, TaskTrait};
    use crate::helpers::random::RandomImpl;
    use crate::helpers::rewarder::Rewarder;
    use crate::models::config::ConfigTrait;
    use crate::models::game::{AssertTrait, GameAssert, GameTrait};
    use crate::systems::collection::{
        ICollectionDispatcher, ICollectionDispatcherTrait, NAME as COLLECTION,
    };
    use crate::systems::token::{ITokenDispatcher, ITokenDispatcherTrait, NAME as TOKEN};
    use crate::systems::vault::{IVaultDispatcher, NAME as VAULT};
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
    pub impl QuestRewarderImpl<
        TContractState,
        +HasComponent<TContractState>,
        +Drop<TContractState>,
        impl Achievement: AchievementComponent::HasComponent<TContractState>,
        impl AchievementImpl: AchievementComponent::AchievementTrait<TContractState>,
        impl Quest: QuestableComponent::HasComponent<TContractState>,
        impl QuestImpl: QuestableComponent::QuestTrait<TContractState>,
        impl Rankable: RankableComponent::HasComponent<TContractState>,
    > of QuestRewarderTrait<TContractState> {
        fn on_quest_complete(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            player_id: felt252,
            quest_id: felt252,
            interval_id: u64,
        ) {
            // [Effect] Update daily quest completions
            let mut questable = get_dep_component_mut!(ref self, Quest);
            questable.progress(world, player_id, finisher::DailyFinisher::identifier(), 1, true);

            // [Effect] Autoclaim quest if reward is enabled
            let quest: QuestType = quest_id.into();
            if !quest.reward() {
                return;
            }
            questable.claim(world, player_id, quest_id, interval_id);
        }

        fn on_quest_claim(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            player_id: felt252,
            quest_id: felt252,
            interval_id: u64,
        ) {
            // [Interaction] Reward player with Games
            let quest: QuestType = quest_id.into();
            if !quest.reward() {
                return;
            }
            // [Effect] Create game
            self.free(world, player_id.try_into().unwrap());
        }
    }

    #[generate_trait]
    pub impl InternalImpl<
        TContractState,
        +HasComponent<TContractState>,
        +Drop<TContractState>,
        impl Achievement: AchievementComponent::HasComponent<TContractState>,
        impl AchievementImpl: AchievementComponent::AchievementTrait<TContractState>,
        impl Quest: QuestableComponent::HasComponent<TContractState>,
        impl QuestImpl: QuestableComponent::QuestTrait<TContractState>,
        impl Rankable: RankableComponent::HasComponent<TContractState>,
    > of InternalTrait<TContractState> {
        /// Initializes the components.
        fn initialize(ref self: ComponentState<TContractState>, mut world: WorldStorage) {
            // [Event] Initialize all Achievements
            let mut achievement_id: u8 = ACHIEVEMENT_COUNT;
            let mut achievement = get_dep_component_mut!(ref self, Achievement);
            while achievement_id > 0 {
                let achievement_type: AchievementType = achievement_id.into();
                let props = achievement_type.props();
                achievement
                    .create(
                        world,
                        id: props.id,
                        start: 0,
                        end: 0,
                        tasks: props.tasks,
                        metadata: props.metadata,
                        to_store: true,
                    );
                achievement_id -= 1;
            }
            // [Event] Initialize all Quests
            let mut quest_id: u8 = QUEST_COUNT;
            let mut quest = get_dep_component_mut!(ref self, Quest);
            let registry = starknet::get_contract_address();
            while quest_id > 0 {
                let quest_type: QuestType = quest_id.into();
                let props: QuestProps = quest_type.props(registry);
                quest
                    .create(
                        world: world,
                        id: props.id,
                        start: props.start,
                        end: props.end,
                        duration: props.duration,
                        interval: props.interval,
                        tasks: props.tasks.span(),
                        conditions: props.conditions.span(),
                        metadata: props.metadata,
                        to_store: true,
                    );
                quest_id -= 1;
            };
        }

        /// Create a default game.
        fn free(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            recipient: ContractAddress,
        ) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);
            // [Effect] Create a game with default settings
            let nums_address = store.nums_disp().contract_address;
            let asset = IERC20MixinDispatcher { contract_address: nums_address };
            let nums_supply = asset.total_supply();
            let multiplier = constants::MULTIPLIER_PRECISION;
            self.create(world, recipient, multiplier, nums_supply, 0);
        }

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
            let game_id = collection.mint(player, true);

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
            let mut quest = get_dep_component_mut!(ref self, Quest);
            quest.progress(world, player.into(), Task::Filler.identifier(), 1, true);
            quest
                .progress(
                    world, player.into(), Task::Trigger.identifier(), traps.len().into(), true,
                );

            // [Effect] Update achievement progression for the player
            let mut achievement = get_dep_component_mut!(ref self, Achievement);
            if target_number == 21 {
                achievement
                    .progress(world, player.into(), Task::ReferenceOne.identifier(), 1, true);
            } else if target_number == 42 {
                achievement
                    .progress(world, player.into(), Task::ReferenceTwo.identifier(), 1, true);
            } else if target_number == 404 {
                achievement
                    .progress(world, player.into(), Task::ReferenceThree.identifier(), 1, true);
            } else if target_number == 777 {
                achievement
                    .progress(world, player.into(), Task::ReferenceFour.identifier(), 1, true);
            } else if target_number == 911 {
                achievement
                    .progress(world, player.into(), Task::ReferenceFive.identifier(), 1, true);
            } else if target_number == 420 {
                achievement
                    .progress(world, player.into(), Task::ReferenceSix.identifier(), 1, true);
            } else if target_number == 69 {
                achievement
                    .progress(world, player.into(), Task::ReferenceSeven.identifier(), 1, true);
            }

            // [Effect] Update achievement progression - Placer (cumulative)
            achievement.progress(world, player.into(), Task::Filler.identifier(), 1, true);

            // [Effect] Update achievement progression - Trapper (cumulative)
            achievement
                .progress(
                    world, player.into(), Task::Trigger.identifier(), traps.len().into(), true,
                );

            // [Effect] Update achievement progression - Chainer (single turn)
            let trap_count: u32 = traps.len();
            if trap_count >= 3 {
                achievement.progress(world, player.into(), Task::ChainerOne.identifier(), 1, true);
            }
            if trap_count >= 4 {
                achievement.progress(world, player.into(), Task::ChainerTwo.identifier(), 1, true);
            }
            if trap_count >= 5 {
                achievement
                    .progress(world, player.into(), Task::ChainerThree.identifier(), 1, true);
            }

            // [Effect] Update achievement progression - Streak
            let mut slots = game.slots();
            let streak = GameTrait::streak(ref slots);
            if streak >= 2 {
                achievement.progress(world, player.into(), Task::StreakerOne.identifier(), 1, true);
            }
            if streak >= 3 {
                achievement.progress(world, player.into(), Task::StreakerTwo.identifier(), 1, true);
            }
            if streak >= 4 {
                achievement
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
                achievement.progress(world, player.into(), task.identifier(), 1, true);
            } else if game.level == 16 {
                achievement
                    .progress(world, player.into(), Task::FillerSixteen.identifier(), 1, true);
            } else if game.level == 17 {
                achievement
                    .progress(world, player.into(), Task::FillerSeventeen.identifier(), 1, true);
            } else if game.level == 18 {
                achievement
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
            let mut quest = get_dep_component_mut!(ref self, Quest);
            quest.progress(world, player.into(), Task::Power.identifier(), 1, true);

            // [Effect] Update achievement progression - Power (cumulative)
            let mut achievement = get_dep_component_mut!(ref self, Achievement);
            achievement.progress(world, player.into(), Task::Power.identifier(), 1, true);

            // [Effect] Update achievement progression - Game over (Streak, Filler)
            if game.over != 0 {
                let mut slots = game.slots();
                let streak = GameTrait::streak(ref slots);
                if streak >= 2 {
                    achievement
                        .progress(world, player.into(), Task::StreakerOne.identifier(), 1, true);
                }
                if streak >= 3 {
                    achievement
                        .progress(world, player.into(), Task::StreakerTwo.identifier(), 1, true);
                }
                if streak >= 4 {
                    achievement
                        .progress(world, player.into(), Task::StreakerThree.identifier(), 1, true);
                }
                if game.level >= 16 {
                    achievement
                        .progress(world, player.into(), Task::FillerSixteen.identifier(), 1, true);
                }
                if game.level >= 17 {
                    achievement
                        .progress(
                            world, player.into(), Task::FillerSeventeen.identifier(), 1, true,
                        );
                }
                if game.level >= 18 {
                    achievement
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
            let mut achievement = get_dep_component_mut!(ref self, Achievement);
            let task = Task::Claimer;
            achievement.progress(world, player.into(), task.identifier(), base_reward, true);

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
