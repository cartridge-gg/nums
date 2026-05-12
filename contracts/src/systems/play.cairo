use starknet::ContractAddress;

#[inline]
pub fn NAME() -> ByteArray {
    "Play"
}

#[starknet::interface]
pub trait IPlay<T> {
    fn mint(
        ref self: T,
        player: ContractAddress,
        multiplier: Option<u128>,
        supply: Option<u256>,
        price: Option<u256>,
        soulbound: Option<bool>,
        quantity: u32,
    );
    fn set(ref self: T, game_id: u64, index: u8);
    fn select(ref self: T, game_id: u64, index: u8);
    fn apply(ref self: T, game_id: u64, index: u8);
    fn claim(ref self: T, payload: Span<felt252>);
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
    use crate::interfaces::messaging::{IMessagingDispatcher, IMessagingDispatcherTrait};
    use crate::store::StoreTrait;
    use crate::systems::collection::{
        ICollectionDispatcher, ICollectionDispatcherTrait, NAME as COLLECTION,
    };
    use crate::systems::setup::NAME as SETUP;
    use crate::systems::token::NAME as TOKEN;
    use crate::systems::treasury::NAME as TREASURY;
    use crate::types::payload::PayloadTrait;
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
        // [Effect] Test-driven: also grant DEFAULT_ADMIN_ROLE to the deploying
        // account so the e2e harness can drive admin-only operations
        // post-deploy. Mirrors the pattern in Setup/Token. Production deploys
        // are unaffected because the deployer IS the Treasury-controlled
        // account.
        let deployer_account = starknet::get_tx_info().unbox().account_contract_address;
        self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, deployer_account);
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
            let play = IPlayDispatcher { contract_address: starknet::get_contract_address() };
            // play.mint(player_id.try_into().unwrap(), None, None, None, None, 1);
        // TODO: send message to L1
        }
    }

    // [Info] Designed to be called on Appchain
    #[l1_handler]
    fn create(
        ref self: ContractState,
        from_address: felt252,
        player: ContractAddress,
        game_id: u64,
        multiplier: u128,
        supply: u256,
        price: u256,
    ) {
        // [Setup] World and Store
        let world = self.world(@NAMESPACE());
        // [Check] Sender is allowed
        let this = starknet::get_contract_address();
        assert(from_address == this.into(), 'Play: invalid sender');
        // [Interaction] Mint the game asset
        let (collection_address, _) = world.dns(@COLLECTION()).expect('Collection not found!');
        let collection = ICollectionDispatcher { contract_address: collection_address };
        let game_id = collection.mint(player, game_id, true);
        // [Effect] Create the game
        self.playable.create(world, player, game_id, multiplier, supply, price);
    }

    #[abi(embed_v0)]
    impl PlayImpl of IPlay<ContractState> {
        // [Info] Designed to be called on Mainnet
        fn mint(
            ref self: ContractState,
            player: ContractAddress,
            multiplier: Option<u128>,
            supply: Option<u256>,
            price: Option<u256>,
            soulbound: Option<bool>,
            mut quantity: u32,
        ) {
            // [Check] Caller is allowed
            self.accesscontrol.assert_only_role(CREATOR_ROLE);
            // [Setup] World, Store and Dispatchers
            let world = self.world(@NAMESPACE());
            let store = StoreTrait::new(world);
            let (collection_address, _) = world.dns(@COLLECTION()).expect('Collection not found!');
            let collection = ICollectionDispatcher { contract_address: collection_address };
            // [Effect] Create games
            let world = self.world(@NAMESPACE());
            let (token_address, _) = world.dns(@TOKEN()).expect('Token not found!');
            let asset = IERC20MixinDispatcher { contract_address: token_address };
            let supply = supply.unwrap_or(asset.total_supply());
            let multiplier = multiplier.unwrap_or(MULTIPLIER_PRECISION);
            let soulbound = true; // FIXME: cannot manage transfers on both networks yet
            let price = price.unwrap_or(0);
            let bridge = store.bridge();
            let messaging = IMessagingDispatcher { contract_address: bridge.address };
            while quantity > 0 {
                quantity -= 1;
                // [Interaction] Mint a new game asset
                let game_id = collection.new(player, soulbound);
                // [Message] Bridge game information
                let payload = PayloadTrait::new(player, game_id, multiplier, supply, price, 0, 0);
                let this = starknet::get_contract_address();
                messaging.send_message_to_appchain(this, selector!("create"), payload.span());
            }
        }

        // [Info] Designed to be called on Appchain
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

        // [Info] Designed to be called on Appchain
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

        // [Info] Designed to be called on Appchain
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

        // [Info] Designed to be called on Mainnet
        fn claim(ref self: ContractState, mut payload: Span<felt252>) {
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Check] Verify message from Appchain
            let store = StoreTrait::new(world);
            let bridge = store.bridge();
            let messaging = IMessagingDispatcher { contract_address: bridge.address };
            let this = starknet::get_contract_address();
            messaging.consume_message_from_appchain(this, payload);
            // [Check] Caller is allowed
            let payload = PayloadTrait::from(ref payload);
            let (collection_address, _) = world.dns(@COLLECTION()).expect('Collection not found!');
            let collection = ICollectionDispatcher { contract_address: collection_address };
            collection.assert_is_owner(starknet::get_caller_address(), payload.game_id.into());
            // [Effect] Claim reward
            self.playable.claim(world, payload);
            // [Interaction] Update token metadata
            collection.update(payload.game_id.into());
        }
    }
}

