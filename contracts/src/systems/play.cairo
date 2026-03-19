#[inline]
pub fn NAME() -> ByteArray {
    "Play"
}

#[starknet::interface]
pub trait IPlay<T> {
    fn set(ref self: T, game_id: u64, index: u8) -> u16;
    fn select(ref self: T, game_id: u64, index: u8);
    fn apply(ref self: T, game_id: u64, index: u8) -> u16;
    fn claim(ref self: T, game_id: u64);
}

#[starknet::interface]
pub trait IMerkledrop<T> {
    fn merkledrop_register(ref self: T, data: Span<Span<felt252>>, expiration: u64) -> felt252;
    fn merkledrop_claim(
        ref self: T,
        tree_id: felt252,
        proofs: Span<felt252>,
        data: Span<felt252>,
        receiver: starknet::ContractAddress,
    );
}

const ADMIN_ROLE: felt252 = selector!("ADMIN_ROLE");

#[dojo::contract]
pub mod Play {
    use achievement::components::achievable::AchievableComponent;
    use dojo::world::WorldStorageTrait;
    use leaderboard::components::rankable::RankableComponent;
    use merkledrop::components::merkledrop::MerkledropComponent;
    use merkledrop::components::merkledrop::MerkledropComponent::IMerkledropImplementation;
    use openzeppelin::access::accesscontrol::{AccessControlComponent, DEFAULT_ADMIN_ROLE};
    use openzeppelin::introspection::src5::SRC5Component;
    use quest::components::questable::QuestableComponent;
    use quest::interfaces::IQuestRewarder;
    use starknet::ContractAddress;
    use starterpack::interface::IStarterpackImplementation as IStarterpack;
    use crate::components::playable::PlayableComponent;
    use crate::constants::NAMESPACE;
    use crate::models::starterpack::StarterpackAssert;
    use crate::systems::treasury::NAME as TREASURY;
    use crate::types::drop::MerkleDrop;
    use super::*;

    // Components

    component!(path: AccessControlComponent, storage: accesscontrol, event: AccessControlEvent);
    #[abi(embed_v0)]
    impl AccessControlImpl =
        AccessControlComponent::AccessControlImpl<ContractState>;
    impl AccessControlInternalImpl = AccessControlComponent::InternalImpl<ContractState>;
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: AchievableComponent, storage: achievable, event: AchievableEvent);
    impl AchievableInternalImpl = AchievableComponent::InternalImpl<ContractState>;
    component!(path: QuestableComponent, storage: questable, event: QuestableEvent);
    impl QuestableInternalImpl = QuestableComponent::InternalImpl<ContractState>;
    component!(path: RankableComponent, storage: rankable, event: RankableEvent);
    impl RankableInternalImpl = RankableComponent::InternalImpl<ContractState>;
    component!(path: MerkledropComponent, storage: merkledrop, event: MerkledropEvent);
    impl MerkledropInternalImpl = MerkledropComponent::InternalImpl<ContractState>;
    component!(path: PlayableComponent, storage: playable, event: PlayableEvent);
    impl PlayableInternalImpl = PlayableComponent::InternalImpl<ContractState>;
    impl PlayableQuestRewarderImpl = PlayableComponent::QuestRewarderImpl<ContractState>;
    impl PlayableStarterpackImpl = PlayableComponent::StarterpackImpl<ContractState>;

    // Storage

    #[storage]
    struct Storage {
        #[substorage(v0)]
        accesscontrol: AccessControlComponent::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        achievable: AchievableComponent::Storage,
        #[substorage(v0)]
        questable: QuestableComponent::Storage,
        #[substorage(v0)]
        rankable: RankableComponent::Storage,
        #[substorage(v0)]
        merkledrop: MerkledropComponent::Storage,
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
        AchievableEvent: AchievableComponent::Event,
        #[flat]
        QuestableEvent: QuestableComponent::Event,
        #[flat]
        RankableEvent: RankableComponent::Event,
        #[flat]
        MerkledropEvent: MerkledropComponent::Event,
        #[flat]
        PlayableEvent: PlayableComponent::Event,
    }

    fn dojo_init(ref self: ContractState) {
        // [Effect] Initialize rights
        self.accesscontrol.initializer();
        let world = self.world(@NAMESPACE());
        let treasury_address = world.dns_address(@TREASURY()).expect('Treasury not found!');
        self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, treasury_address);
        self.accesscontrol._grant_role(ADMIN_ROLE, treasury_address);
        // [Effect] FIXME: Extra rights for test purpose
        let deployer_account = starknet::get_tx_info().unbox().account_contract_address;
        self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, deployer_account);
        self.accesscontrol._grant_role(ADMIN_ROLE, deployer_account);
    }

    impl MerkledropImplInternal of IMerkledropImplementation<ContractState> {
        fn get_recipient(
            self: @MerkledropComponent::ComponentState<ContractState>, mut data: Span<felt252>,
        ) -> ContractAddress {
            // [Return] Return recipient, first item in the data array
            let drop: MerkleDrop = Serde::<MerkleDrop>::deserialize(ref data).unwrap();
            drop.recipient
        }

        fn on_merkledrop_claim(
            ref self: MerkledropComponent::ComponentState<ContractState>,
            root: felt252,
            leaf: felt252,
            receiver: ContractAddress,
            mut data: Span<felt252>,
        ) {
            // [Effect] Claim free games
            let drop: MerkleDrop = Serde::<MerkleDrop>::deserialize(ref data).unwrap();
            let mut contract_state = self.get_contract_mut();
            let world = contract_state.world(@NAMESPACE());
            for _ in 0..drop.quantity {
                contract_state.playable.free(world, receiver);
            }
        }
    }

    #[abi(embed_v0)]
    impl MerkledropImpl of IMerkledrop<ContractState> {
        fn merkledrop_register(
            ref self: ContractState, data: Span<Span<felt252>>, expiration: u64,
        ) -> felt252 {
            // [Check] Only admin can register
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            // [Effect] Register merkledrop
            let world = self.world(@NAMESPACE());
            self.merkledrop.register(world, data, expiration)
        }

        fn merkledrop_claim(
            ref self: ContractState,
            tree_id: felt252,
            proofs: Span<felt252>,
            data: Span<felt252>,
            receiver: ContractAddress,
        ) {
            let world = self.world(@NAMESPACE());
            self.merkledrop.claim(world, tree_id, proofs, data, receiver)
        }
    }

    #[abi(embed_v0)]
    impl StarterpackImpl of IStarterpack<ContractState> {
        fn on_issue(
            ref self: ContractState, recipient: ContractAddress, starterpack_id: u32, quantity: u32,
        ) {
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Effect] Mint games
            self.playable.on_issue(world, recipient, starterpack_id, quantity)
        }

        fn supply(self: @ContractState, starterpack_id: u32) -> Option<u32> {
            Option::None
        }
    }

    impl QuestRewarderImpl of IQuestRewarder<ContractState> {
        fn on_quest_unlock(
            ref self: ContractState, player: ContractAddress, quest_id: felt252, interval_id: u64,
        ) {}

        fn on_quest_complete(
            ref self: ContractState, player: ContractAddress, quest_id: felt252, interval_id: u64,
        ) {
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Effect] Update quest progression for the player - Leader tasks
            self.playable.on_quest_complete(world, player, quest_id, interval_id)
        }

        fn on_quest_claim(
            ref self: ContractState, player: ContractAddress, quest_id: felt252, interval_id: u64,
        ) {
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Effect] Claim quest reward
            self.playable.on_quest_claim(world, player, quest_id, interval_id)
        }
    }

    #[abi(embed_v0)]
    impl PlayImpl of IPlay<ContractState> {
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

