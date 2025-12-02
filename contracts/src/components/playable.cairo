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
    use quest::components::questable::QuestableComponent;
    use quest::components::questable::QuestableComponent::InternalImpl as QuestableInternalImpl;
    use starknet::ContractAddress;
    use crate::components::starterpack::StarterpackComponent;
    use crate::components::starterpack::StarterpackComponent::InternalImpl as StarterpackInternalImpl;
    use crate::components::tournament::TournamentComponent;
    use crate::components::tournament::TournamentComponent::InternalImpl as TournamentInternalImpl;
    use crate::constants::{CLIENT_URL, DEFAULT_SETTINGS_ID};
    use crate::elements::achievements::index::{ACHIEVEMENT_COUNT, Achievement, AchievementTrait};
    use crate::elements::quests::finisher;
    use crate::elements::quests::index::{IQuest, QUEST_COUNT, QuestProps, QuestType};
    use crate::elements::tasks::index::{Task, TaskTrait};
    use crate::interfaces::nums::INumsTokenDispatcherTrait;
    use crate::models::claim::{ClaimAssert, ClaimTrait};
    use crate::models::game::{AssertTrait, GameAssert, GameTrait};
    use crate::models::leaderboard::LeaderboardTrait;
    use crate::models::starterpack::StarterpackTrait as PackTrait;
    use crate::models::tournament::TournamentAssert;
    use crate::models::usage::{UsageAssert, UsageTrait};
    use crate::random::RandomImpl;
    use crate::systems::minigame::NAME as MINIGAME;
    use crate::systems::renderer::NAME as RENDERER;
    use crate::systems::settings::{ISettingsDispatcher, ISettingsDispatcherTrait, NAME as SETTINGS};
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
    > of StarterpackTrait<TContractState> {
        fn on_issue(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            recipient: ContractAddress,
            starterpack_id: u32,
            mut quantity: u32,
        ) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Check] Caller is allowed
            let starterpack = get_dep_component!(@self, Starterpack);
            starterpack.assert_is_allowed(world);

            // [Check] Starterpack is valid
            starterpack.assert_is_valid(world, starterpack_id);

            // [Check] Free game
            let pack = store.starterpack(starterpack_id);
            if !pack.reissuable {
                // [Check] Free game not already claimed
                let player = recipient.into();
                let mut claim = store.claim(player, starterpack_id);
                claim.assert_not_claimed();
                // [Effect] Claim free game
                claim.claim();
                store.set_claim(@claim);
            }

            // [Interaction] Burn the entry price
            let pack = store.starterpack(starterpack_id);
            let amount = pack.amount(quantity);
            store.nums_disp().burn(amount);

            // [Interaction] Mint games
            let settings = store.setting(DEFAULT_SETTINGS_ID);
            while quantity > 0 {
                // [Interaction] Mint a game
                let game_id = self.mint_game(world, Option::None, recipient, true);

                // [Effect] Create game
                let game = GameTrait::new(
                    game_id, settings.slot_count, settings.slot_min, settings.slot_max,
                );
                store.set_game(@game);
                quantity -= 1;
            }
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
            // [Effect] Update daily and weekly quest completions
            let questable = get_dep_component!(@self, Quest);
            let player = recipient.into();
            if quest_id == QuestType::DailyContenderThree.identifier()
                || quest_id == QuestType::DailyEarnerThree.identifier()
                || quest_id == QuestType::DailyPlacerThree.identifier() {
                questable.progress(world, player, finisher::DailyFinisher::identifier(), 1, true);
            } else if quest_id == QuestType::WeeklyContenderThree.identifier()
                || quest_id == QuestType::WeeklyEarnerThree.identifier()
                || quest_id == QuestType::WeeklyPlacerThree.identifier() {
                questable.progress(world, player, finisher::WeeklyFinisher::identifier(), 1, true);
            }

            // [Effect] Claim quest reward automatically
            questable.claim(world, recipient.into(), quest_id, interval_id);
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
            store.nums_disp().reward(recipient, amount);

            // [Effect] Update achievement progression for the player if available, otherwise return
            if task == Task::None {
                return;
            }
            let achievable = get_dep_component!(@self, Achievable);
            achievable.progress(world, recipient.into(), task.identifier(), 1, true);
        }
    }

    #[generate_trait]
    pub impl InternalImpl<
        TContractState,
        +HasComponent<TContractState>,
        +Drop<TContractState>,
        impl Tournament: TournamentComponent::HasComponent<TContractState>,
        impl Achievable: AchievableComponent::HasComponent<TContractState>,
        impl Quest: QuestableComponent::HasComponent<TContractState>,
    > of InternalTrait<TContractState> {
        fn initialize(ref self: ComponentState<TContractState>, world: WorldStorage) {
            // [Event] Initialize all Achievements
            let contract_address = starknet::get_contract_address();
            let mut achievement_id: u8 = ACHIEVEMENT_COUNT;
            while achievement_id > 0 {
                let achievement: Achievement = achievement_id.into();
                let achievable = get_dep_component!(@self, Achievable);
                achievable
                    .create(
                        world,
                        id: achievement.identifier(),
                        rewarder: 0.try_into().unwrap(),
                        start: 0,
                        end: 0,
                        tasks: achievement.tasks(),
                        metadata: achievement.metadata(),
                        to_store: true,
                    );
                achievement_id -= 1;
            }
            // [Event] Initialize all Quests
            let mut quest_id: u8 = QUEST_COUNT;
            while quest_id > 0 {
                let quest_type: QuestType = quest_id.into();
                let props: QuestProps = quest_type.props();
                let questable = get_dep_component!(@self, Quest);
                questable
                    .create(
                        world: world,
                        id: props.id,
                        rewarder: contract_address,
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

        fn start(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            game_id: u64,
            powers: u16,
        ) -> (u64, u16) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Check] Token ownership
            let token_address = self.get_minigame(world).token_address();
            assert_token_ownership(token_address, game_id);

            // [Check] Perform pre actions
            pre_action(token_address, game_id);

            // [Check] Game not started yet
            let game = store.game(game_id);
            game.assert_not_started();

            // [Effect] Create and setup game
            let settings = self.get_settings(world).game_setting(game_id);
            let mut rand = RandomImpl::new_vrf(store.vrf_disp());
            let number = rand.between::<u16>(settings.slot_min, settings.slot_max);
            let mut game = GameTrait::new(
                game_id, settings.slot_count, settings.slot_min, settings.slot_max,
            );

            // [Check] Powers are valid
            let usage = UsageTrait::from(0);
            usage.assert_valid_powers(powers);
            // [Check] Handle default and specific games separately
            if !self.is_default_game(world, game_id) {
                // [Check] Powers are valid
                let usage = UsageTrait::from(0);
                usage.assert_valid_powers(powers);
                // [Effect] Start specific game
                game.start(0, number, powers);
            } else {
                // [Effect] Enter tournament
                let mut tournament_component = get_dep_component_mut!(ref self, Tournament);
                let tournament = tournament_component.enter(world);
                // [Check] Powers are valid
                let usage = UsageTrait::from(tournament.usage);
                usage.assert_valid_powers(powers);
                // [Effect] Start tournament game
                game.start(tournament.id, number, powers);
                // [Effect] Update quest progression for the player - Contender tasks
                let questable = get_dep_component!(@self, Quest);
                let player = starknet::get_caller_address();
                let task = Task::Grinder;
                questable.progress(world, player.into(), task.identifier(), 1, true);
                // [Effect] Update achievement progression for the player - Grinder task
                let achievable = get_dep_component!(@self, Achievable);
                achievable.progress(world, player.into(), task.identifier(), 1, true);
                // [Effect] Update usage
                let mut usage = store.usage();
                usage.insert(powers);
                store.set_usage(@usage);
            }
            store.set_game(@game);

            // [Interaction] Perform post actions
            post_action(token_address, game_id);

            (game_id, number)
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
            let reward = game
                .update(ref rand, store.nums_disp().total_supply(), store.config().target_supply);
            store.set_game(@game);

            // [Check] Handle specific games and return prematurely
            if !self.is_default_game(world, game_id) {
                // [Interaction] Perform post actions
                post_action(token_address, game_id);

                // [Return] Game number
                return game.number;
            }

            // [Check] Tournament is not over
            let tournament = store.tournament(game.tournament_id);
            tournament.assert_not_over();

            // [Interaction] Pay user reward
            let player = starknet::get_caller_address();
            store.nums_disp().reward(player, reward);

            // [Event] Emit reward event
            store.game_reward(game_id, reward);

            // [Effect] Update quest progression for the player - Contender tasks
            let questable = get_dep_component!(@self, Quest);
            let task = Task::Claimer;
            questable.progress(world, player.into(), task.identifier(), reward.into(), true);

            // [Effect] Update achievement progression for the player - Claimer tasks
            let achievable = get_dep_component!(@self, Achievable);
            achievable.progress(world, player.into(), task.identifier(), reward.into(), true);

            // [Effect] Update leaderboard if the game has been inserted
            let mut leaderboard = store.leaderboard(game.tournament_id);
            let inserted = leaderboard.insert(game, ref store);
            if inserted {
                store.set_leaderboard(@leaderboard);
            }

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

            // [Interaction] Perform post actions
            post_action(token_address, game_id);

            // [Return] Next number
            game.number
        }

        /// Sets a number in the specified slot for a game. It ensures the slot is valid and not
        fn apply(
            ref self: ComponentState<TContractState>, world: WorldStorage, game_id: u64, power: u8,
        ) -> u16 {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Check] Token ownership
            let token_address = self.get_minigame(world).token_address();
            assert_token_ownership(token_address, game_id);

            // [Interaction] Perform pre actions
            pre_action(token_address, game_id);

            // [Check] Game exists
            let mut game = store.game(game_id);
            game.assert_does_exist();

            // [Check] Game has started and is not over
            game.assert_has_started();
            game.assert_not_over();

            // [Check] Handle default and specific games separately
            if self.is_default_game(world, game_id) {
                let tournament = store.tournament(game.tournament_id);
                tournament.assert_not_over();
            }

            // [Effect] Apply power
            let mut rand = RandomImpl::new_vrf(store.vrf_disp());
            game.apply(power, ref rand);

            // [Effect] Update game
            store.set_game(@game);

            // [Interaction] Perform post actions
            post_action(token_address, game_id);

            // [Return] Next number
            game.number
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
                settings_id: Option::Some(DEFAULT_SETTINGS_ID),
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
            let (game_address, _) = world.dns(@MINIGAME()).expect('Minigame not found!');
            IMinigameDispatcher { contract_address: game_address }
        }

        #[inline]
        fn get_renderer_address(
            self: @ComponentState<TContractState>, world: WorldStorage,
        ) -> ContractAddress {
            let (renderer_address, _) = world.dns(@RENDERER()).expect('Renderer not found!');
            renderer_address
        }

        #[inline]
        fn get_settings(
            self: @ComponentState<TContractState>, world: WorldStorage,
        ) -> ISettingsDispatcher {
            let (settings_address, _) = world.dns(@SETTINGS()).expect('Settings not found!');
            ISettingsDispatcher { contract_address: settings_address }
        }

        #[inline]
        fn is_default_game(
            self: @ComponentState<TContractState>, world: WorldStorage, game_id: u64,
        ) -> bool {
            let (game_address, _) = world.dns(@MINIGAME()).expect('Minigame not found!');
            let minigame = IMinigameDispatcher { contract_address: game_address };
            let token_address = minigame.token_address();
            let token = IMinigameTokenDispatcher { contract_address: token_address };
            let token_metadata = token.token_metadata(game_id);
            let minter = IMinigameTokenMinterDispatcher { contract_address: token_address };
            let minted_by_address = minter.get_minter_address(token_metadata.minted_by);
            minted_by_address == starknet::get_contract_address()
        }
    }
}
