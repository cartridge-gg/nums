use starknet::ContractAddress;

#[inline]
pub fn NAME() -> ByteArray {
    "Play"
}

#[starknet::interface]
pub trait IPlay<T> {
    fn mint(ref self: T, player: ContractAddress, quantity: u32);
    fn create(
        ref self: T,
        player: ContractAddress,
        multiplier: u128,
        supply: u256,
        price: u256,
        quantity: u32,
    );
    fn set(ref self: T, game_id: u64, index: u8);
    fn select(ref self: T, game_id: u64, index: u8);
    fn apply(ref self: T, game_id: u64, index: u8);
}

const CREATOR_ROLE: felt252 = selector!("CREATOR_ROLE");

#[dojo::contract]
pub mod Play {
    use achievement::component::Component as AchievementComponent;
    use achievement::component::Component::AchievementTrait;
    use dojo::world::WorldStorageTrait;
    use leaderboard::components::rankable::RankableComponent;
    use openzeppelin::access::accesscontrol::{AccessControlComponent, DEFAULT_ADMIN_ROLE};
    use openzeppelin::interfaces::token::erc20::{IERC20MixinDispatcher, IERC20MixinDispatcherTrait};
    use openzeppelin::introspection::src5::SRC5Component;
    use quest::component::Component as QuestComponent;
    use quest::component::Component::QuestTrait;
    use starknet::ContractAddress;
    use crate::components::playable::PlayableComponent;
    use crate::constants::{MULTIPLIER_PRECISION, NAMESPACE};
    use crate::elements::quests::finisher;
    use crate::elements::quests::index::{IQuest, QuestType};
    use crate::systems::collection::{
        ICollectionDispatcher, ICollectionDispatcherTrait, NAME as COLLECTION,
    };
    use crate::systems::setup::NAME as SETUP;
    use crate::systems::token::NAME as TOKEN;
    use crate::systems::treasury::NAME as TREASURY;
    use super::*;

    // Components

    component!(path: AccessControlComponent, storage: accesscontrol, event: AccessControlEvent);
    #[abi(embed_v0)]
    impl AccessControlImpl =
        AccessControlComponent::AccessControlImpl<ContractState>;
    impl AccessControlInternalImpl = AccessControlComponent::InternalImpl<ContractState>;
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: AchievementComponent, storage: achievement, event: AchievementEvent);
    impl AchievementInternalImpl = AchievementComponent::InternalImpl<ContractState>;
    component!(path: QuestComponent, storage: quest, event: QuestEvent);
    impl QuestInternalImpl = QuestComponent::InternalImpl<ContractState>;
    component!(path: RankableComponent, storage: rankable, event: RankableEvent);
    impl RankableInternalImpl = RankableComponent::InternalImpl<ContractState>;
    component!(path: PlayableComponent, storage: playable, event: PlayableEvent);
    impl PlayableInternalImpl = PlayableComponent::InternalImpl<ContractState>;

    // Storage

    #[storage]
    struct Storage {
        #[substorage(v0)]
        accesscontrol: AccessControlComponent::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        achievement: AchievementComponent::Storage,
        #[substorage(v0)]
        quest: QuestComponent::Storage,
        #[substorage(v0)]
        rankable: RankableComponent::Storage,
        #[substorage(v0)]
        playable: PlayableComponent::Storage,
    }

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        AccessControlEvent: AccessControlComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
        #[flat]
        AchievementEvent: AchievementComponent::Event,
        #[flat]
        QuestEvent: QuestComponent::Event,
        #[flat]
        RankableEvent: RankableComponent::Event,
        #[flat]
        PlayableEvent: PlayableComponent::Event,
    }

    // Constructor

    fn dojo_init(ref self: ContractState) {
        // [Effect] Initialize components
        let world = self.world(@NAMESPACE());
        self.playable.initialize(world);
        self.accesscontrol.initializer();
        // [Effect] Setup rights
        let treasury_address = world.dns_address(@TREASURY()).expect('Treasury not found!');
        self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, treasury_address);
        let setup_address = world.dns_address(@SETUP()).expect('Setup contract not found!');
        self.accesscontrol._grant_role(CREATOR_ROLE, setup_address);
        let this = starknet::get_contract_address();
        self.accesscontrol._grant_role(CREATOR_ROLE, this);
    }

    impl AchievementImpl of AchievementTrait<ContractState> {
        fn on_completion(
            ref self: AchievementComponent::ComponentState<ContractState>,
            player_id: felt252,
            achievement_id: felt252,
        ) {}
        fn on_claim(
            ref self: AchievementComponent::ComponentState<ContractState>,
            player_id: felt252,
            achievement_id: felt252,
        ) {}
    }

    impl QuestImpl of QuestTrait<ContractState> {
        fn on_quest_unlock(
            ref self: QuestComponent::ComponentState<ContractState>,
            player_id: felt252,
            quest_id: felt252,
            interval_id: u64,
        ) {}
        fn on_quest_complete(
            ref self: QuestComponent::ComponentState<ContractState>,
            player_id: felt252,
            quest_id: felt252,
            interval_id: u64,
        ) {
            // [Effect] Update daily quest completions
            let mut contract_state = self.get_contract_mut();
            let world = contract_state.world(@NAMESPACE());
            contract_state
                .quest
                .progress(world, player_id, finisher::DailyFinisher::identifier(), 1, true);

            // [Effect] Autoclaim quest if reward is enabled
            let quest: QuestType = quest_id.into();
            if !quest.reward() {
                return;
            }
            contract_state.quest.claim(world, player_id, quest_id, interval_id);
        }
        fn on_quest_claim(
            ref self: QuestComponent::ComponentState<ContractState>,
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
            let mut contract_state = self.get_contract_mut();
            contract_state.mint(player_id.try_into().unwrap(), 1)
        }
    }

    #[abi(embed_v0)]
    impl PlayImpl of IPlay<ContractState> {
        fn mint(ref self: ContractState, player: ContractAddress, mut quantity: u32) {
            // [Check] Caller is allowed
            self.accesscontrol.assert_only_role(CREATOR_ROLE);
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Check] Caller is allowed
            let (collection_address, _) = world.dns(@COLLECTION()).expect('Collection not found!');
            let collection = ICollectionDispatcher { contract_address: collection_address };
            // [Effect] Create games
            let world = self.world(@NAMESPACE());
            let (token_address, _) = world.dns(@TOKEN()).expect('Token not found!');
            let asset = IERC20MixinDispatcher { contract_address: token_address };
            let supply = asset.total_supply();
            let multiplier = MULTIPLIER_PRECISION;
            while quantity > 0 {
                // [Interaction] Mint a game
                let game_id = collection.mint(player, true);
                // [Effect] Create game
                self.playable.create(world, player, game_id, multiplier, supply, 0);
                quantity -= 1;
            }
        }

        fn create(
            ref self: ContractState,
            player: ContractAddress,
            multiplier: u128,
            supply: u256,
            price: u256,
            mut quantity: u32,
        ) {
            // [Check] Caller is allowed
            self.accesscontrol.assert_only_role(CREATOR_ROLE);
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Check] Caller is allowed
            let (collection_address, _) = world.dns(@COLLECTION()).expect('Collection not found!');
            let collection = ICollectionDispatcher { contract_address: collection_address };
            // [Effect] Create games
            let world = self.world(@NAMESPACE());
            while quantity > 0 {
                // [Interaction] Mint a game
                let game_id = collection.mint(player, true);
                // [Effect] Create game
                self.playable.create(world, player, game_id, multiplier, supply, price);
                quantity -= 1;
            }
        }

        fn set(ref self: ContractState, game_id: u64, index: u8) {
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Check] Caller is allowed
            let (collection_address, _) = world.dns(@COLLECTION()).expect('Collection not found!');
            let collection = ICollectionDispatcher { contract_address: collection_address };
            collection.assert_is_owner(starknet::get_caller_address(), game_id.into());
            // [Effect] Set slot
            self.playable.set(world, game_id, index);
            // [Interaction] Update token metadata
            collection.update(game_id.into());
        }

        fn select(ref self: ContractState, game_id: u64, index: u8) {
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Check] Caller is allowed
            let (collection_address, _) = world.dns(@COLLECTION()).expect('Collection not found!');
            let collection = ICollectionDispatcher { contract_address: collection_address };
            collection.assert_is_owner(starknet::get_caller_address(), game_id.into());
            // [Effect] Select power
            self.playable.select(world, game_id, index);
            // [Interaction] Update token metadata
            collection.update(game_id.into());
        }

        fn apply(ref self: ContractState, game_id: u64, index: u8) {
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Check] Caller is allowed
            let (collection_address, _) = world.dns(@COLLECTION()).expect('Collection not found!');
            let collection = ICollectionDispatcher { contract_address: collection_address };
            collection.assert_is_owner(starknet::get_caller_address(), game_id.into());
            // [Effect] Apply power
            self.playable.apply(world, game_id, index);
            // [Interaction] Update token metadata
            collection.update(game_id.into());
        }
    }
}

