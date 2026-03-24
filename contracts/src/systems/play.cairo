use starknet::ContractAddress;

#[inline]
pub fn NAME() -> ByteArray {
    "Play"
}

#[starknet::interface]
pub trait IPlay<T> {
    fn create(
        ref self: T,
        player: ContractAddress,
        multiplier: u128,
        supply: u256,
        price: u256,
        quantity: u32,
    );
    fn set(ref self: T, game_id: u64, index: u8) -> u16;
    fn select(ref self: T, game_id: u64, index: u8);
    fn apply(ref self: T, game_id: u64, index: u8) -> u16;
    fn claim(ref self: T, game_id: u64);
}

const ADMIN_ROLE: felt252 = selector!("ADMIN_ROLE");
const CREATOR_ROLE: felt252 = selector!("CREATOR_ROLE");

#[dojo::contract]
pub mod Play {
    use achievement::component::Component as AchievementComponent;
    use achievement::component::Component::AchievementTrait;
    use dojo::world::WorldStorageTrait;
    use leaderboard::components::rankable::RankableComponent;
    use openzeppelin::access::accesscontrol::{AccessControlComponent, DEFAULT_ADMIN_ROLE};
    use openzeppelin::introspection::src5::SRC5Component;
    use quest::component::Component as QuestComponent;
    use quest::component::Component::QuestTrait;
    use starknet::ContractAddress;
    use crate::components::playable::PlayableComponent;
    use crate::constants::NAMESPACE;
    use crate::systems::setup::NAME as SETUP;
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
    impl PlayableQuestRewarderImpl = PlayableComponent::QuestRewarderImpl<ContractState>;

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
        self.accesscontrol._grant_role(ADMIN_ROLE, treasury_address);
        let setup_address = world.dns_address(@SETUP()).expect('Setup contract not found!');
        self.accesscontrol._grant_role(CREATOR_ROLE, setup_address);
        // [Effect] FIXME: Extra rights for test purpose
        let deployer_account = starknet::get_tx_info().unbox().account_contract_address;
        self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, deployer_account);
        self.accesscontrol._grant_role(ADMIN_ROLE, deployer_account);
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
            let mut contract_state = self.get_contract_mut();
            let world = contract_state.world(@NAMESPACE());
            contract_state.playable.on_quest_complete(world, player_id, quest_id, interval_id)
        }
        fn on_quest_claim(
            ref self: QuestComponent::ComponentState<ContractState>,
            player_id: felt252,
            quest_id: felt252,
            interval_id: u64,
        ) {
            let mut contract_state = self.get_contract_mut();
            let world = contract_state.world(@NAMESPACE());
            contract_state.playable.on_quest_claim(world, player_id, quest_id, interval_id)
        }
    }

    #[abi(embed_v0)]
    impl PlayImpl of IPlay<ContractState> {
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
            // [Effect] Create games
            let world = self.world(@NAMESPACE());
            while quantity > 0 {
                self.playable.create(world, player, multiplier, supply, price);
                quantity -= 1;
            }
        }

        fn set(ref self: ContractState, game_id: u64, index: u8) -> u16 {
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Effect] Set slot
            self.playable.set(world, game_id, index)
        }

        fn select(ref self: ContractState, game_id: u64, index: u8) {
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Effect] Select power
            self.playable.select(world, game_id, index)
        }

        fn apply(ref self: ContractState, game_id: u64, index: u8) -> u16 {
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Effect] Apply power
            self.playable.apply(world, game_id, index)
        }

        fn claim(ref self: ContractState, game_id: u64) {
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Effect] Claim game
            self.playable.claim(world, game_id)
        }
    }
}

