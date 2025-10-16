// Constants

#[inline]
pub fn NAME() -> ByteArray {
    "Play"
}

#[starknet::interface]
pub trait IPlay<T> {
    fn create(ref self: T) -> u64;
    fn enter(ref self: T, tournament_id: u64, player_name: felt252) -> u64;
    fn start(ref self: T, game_id: u64) -> (u64, u16);
    fn set(ref self: T, game_id: u64, index: u8) -> u16;
    fn submit(ref self: T, tournament_id: u64);
}

#[dojo::contract]
pub mod Play {
    use achievement::components::achievable::AchievableComponent;
    use crate::components::playable::PlayableComponent;
    use crate::components::tournament::TournamentComponent;
    use crate::constants::NAMESPACE;
    use super::IPlay;

    // Components

    component!(path: AchievableComponent, storage: achievable, event: AchievableEvent);
    impl AchievableInternalImpl = AchievableComponent::InternalImpl<ContractState>;
    component!(path: TournamentComponent, storage: tournament, event: TournamentEvent);
    impl TournamentInternalImpl = TournamentComponent::InternalImpl<ContractState>;
    component!(path: PlayableComponent, storage: playable, event: PlayableEvent);
    impl PlayableInternalImpl = PlayableComponent::InternalImpl<ContractState>;

    // Storage

    #[storage]
    struct Storage {
        #[substorage(v0)]
        achievable: AchievableComponent::Storage,
        #[substorage(v0)]
        playable: PlayableComponent::Storage,
        #[substorage(v0)]
        tournament: TournamentComponent::Storage,
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
    }

    fn dojo_init(ref self: ContractState) {
        // [Setup] World
        let world = self.world(@NAMESPACE());
        // [Effect] Initialize components
        self.tournament.initialize(world);
        self.playable.initialize(world);
    }

    #[abi(embed_v0)]
    impl PlayImpl of IPlay<ContractState> {
        fn create(ref self: ContractState) -> u64 {
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Effect] Create tournament
            self.tournament.create(world)
        }

        fn enter(ref self: ContractState, tournament_id: u64, player_name: felt252) -> u64 {
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Effect] Enter tournament
            self.tournament.enter(world, tournament_id, player_name)
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

        fn submit(ref self: ContractState, tournament_id: u64) {
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Effect] Submit tournament
            self.tournament.submit(world, tournament_id)
        }
    }
}

