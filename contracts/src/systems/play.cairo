use starknet::ContractAddress;

#[inline]
pub fn NAME() -> ByteArray {
    "Play"
}

#[starknet::interface]
pub trait IPlay<T> {
    fn buy(ref self: T, player_name: felt252) -> u64;
    fn start(ref self: T, game_id: u64) -> (u64, u16);
    fn set(ref self: T, game_id: u64, index: u8) -> u16;
}

#[starknet::interface]
pub trait IMerkledrop<TContractState> {
    fn on_claim(ref self: TContractState, recipient: ContractAddress, leaf_data: Span<felt252>);
}

#[dojo::contract]
pub mod Play {
    use achievement::components::achievable::AchievableComponent;
    use starterpack::interface::IStarterpackImplementation as IStarterpack;
    use crate::components::merkledrop::MerkledropComponent;
    use crate::components::playable::PlayableComponent;
    use crate::components::starterpack::StarterpackComponent;
    use crate::components::tournament::TournamentComponent;
    use crate::constants::NAMESPACE;
    use super::{IMerkledrop, IPlay};

    // Components

    component!(path: AchievableComponent, storage: achievable, event: AchievableEvent);
    impl AchievableInternalImpl = AchievableComponent::InternalImpl<ContractState>;
    component!(path: TournamentComponent, storage: tournament, event: TournamentEvent);
    impl TournamentInternalImpl = TournamentComponent::InternalImpl<ContractState>;
    component!(path: PlayableComponent, storage: playable, event: PlayableEvent);
    impl PlayableInternalImpl = PlayableComponent::InternalImpl<ContractState>;
    impl PlayableStarterpackImpl = PlayableComponent::StarterpackImpl<ContractState>;
    impl PlayableMerkledropImpl = PlayableComponent::MerkledropImpl<ContractState>;
    component!(path: StarterpackComponent, storage: starterpack, event: StarterpackEvent);
    impl StarterpackInternalImpl = StarterpackComponent::InternalImpl<ContractState>;
    component!(path: MerkledropComponent, storage: merkledrop, event: MerkledropEvent);
    impl MerkledropInternalImpl = MerkledropComponent::InternalImpl<ContractState>;

    // Storage

    #[storage]
    struct Storage {
        #[substorage(v0)]
        achievable: AchievableComponent::Storage,
        #[substorage(v0)]
        playable: PlayableComponent::Storage,
        #[substorage(v0)]
        tournament: TournamentComponent::Storage,
        #[substorage(v0)]
        starterpack: StarterpackComponent::Storage,
        #[substorage(v0)]
        merkledrop: MerkledropComponent::Storage,
    }

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        AchievableEvent: AchievableComponent::Event,
        #[flat]
        PlayableEvent: PlayableComponent::Event,
        #[flat]
        TournamentEvent: TournamentComponent::Event,
        #[flat]
        StarterpackEvent: StarterpackComponent::Event,
        #[flat]
        MerkledropEvent: MerkledropComponent::Event,
    }

    fn dojo_init(ref self: ContractState, merkledrop_end: u64) {
        // [Setup] World
        let world = self.world(@NAMESPACE());
        // [Effect] Initialize components
        self.tournament.initialize(world);
        self.playable.initialize(world);
        self.starterpack.initialize(world);
        self.merkledrop.initialize(world, merkledrop_end);
    }

    #[abi(embed_v0)]
    impl MerkledropImpl of IMerkledrop<ContractState> {
        fn on_claim(
            ref self: ContractState, recipient: starknet::ContractAddress, leaf_data: Span<felt252>,
        ) {
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Effect] Claim games
            self.playable.on_claim(world, recipient, leaf_data)
        }
    }

    #[abi(embed_v0)]
    impl StarterpackImpl of IStarterpack<ContractState> {
        fn on_issue(
            ref self: ContractState,
            recipient: starknet::ContractAddress,
            starterpack_id: u32,
            quantity: u32,
        ) {
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Effect] Mint games
            self.playable.on_issue(world, recipient, starterpack_id, quantity)
        }
    }

    #[abi(embed_v0)]
    impl PlayImpl of IPlay<ContractState> {
        fn buy(ref self: ContractState, player_name: felt252) -> u64 {
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Effect] Buy games
            self.playable.buy(world, player_name)
        }

        fn start(ref self: ContractState, game_id: u64) -> (u64, u16) {
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Effect] Start game
            self.playable.start(world, game_id)
        }

        fn set(ref self: ContractState, game_id: u64, index: u8) -> u16 {
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Effect] Set slot
            self.playable.set(world, game_id, index)
        }
    }
}

