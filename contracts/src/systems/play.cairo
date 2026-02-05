use starknet::ContractAddress;

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
pub trait IExternal<T> {
    fn register_starterpack(
        ref self: T,
        payment_token: ContractAddress,
        reissuable: bool,
        referral_percentage: u8,
        price: u256,
    );
    fn update_starterpack(
        ref self: T,
        starterpack_id: u32,
        reissuable: bool,
        payment_token: ContractAddress,
        referral_percentage: u8,
        price: u128,
    );
    fn update_metadata(ref self: T, starterpack_id: u32);
}

#[dojo::contract]
pub mod Play {
    use achievement::components::achievable::AchievableComponent;
    use leaderboard::components::rankable::RankableComponent;
    use quest::components::questable::QuestableComponent;
    use quest::interfaces::IQuestRewarder;
    use starknet::ContractAddress;
    use starterpack::interface::IStarterpackImplementation as IStarterpack;
    use crate::components::playable::PlayableComponent;
    use crate::components::starterpack::StarterpackComponent;
    use crate::constants::NAMESPACE;
    use crate::models::starterpack::StarterpackAssert;
    use super::*;

    // Components

    component!(path: AchievableComponent, storage: achievable, event: AchievableEvent);
    impl AchievableInternalImpl = AchievableComponent::InternalImpl<ContractState>;
    component!(path: QuestableComponent, storage: questable, event: QuestableEvent);
    impl QuestableInternalImpl = QuestableComponent::InternalImpl<ContractState>;
    component!(path: RankableComponent, storage: rankable, event: RankableEvent);
    impl RankableInternalImpl = RankableComponent::InternalImpl<ContractState>;
    component!(path: PlayableComponent, storage: playable, event: PlayableEvent);
    impl PlayableInternalImpl = PlayableComponent::InternalImpl<ContractState>;
    impl PlayableStarterpackImpl = PlayableComponent::StarterpackImpl<ContractState>;
    impl PlayableQuestRewarderImpl = PlayableComponent::QuestRewarderImpl<ContractState>;
    component!(path: StarterpackComponent, storage: starterpack, event: StarterpackEvent);
    impl StarterpackInternalImpl = StarterpackComponent::InternalImpl<ContractState>;

    // Storage

    #[storage]
    struct Storage {
        #[substorage(v0)]
        achievable: AchievableComponent::Storage,
        #[substorage(v0)]
        questable: QuestableComponent::Storage,
        #[substorage(v0)]
        rankable: RankableComponent::Storage,
        #[substorage(v0)]
        playable: PlayableComponent::Storage,
        #[substorage(v0)]
        starterpack: StarterpackComponent::Storage,
    }

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        AchievableEvent: AchievableComponent::Event,
        #[flat]
        QuestableEvent: QuestableComponent::Event,
        #[flat]
        RankableEvent: RankableComponent::Event,
        #[flat]
        PlayableEvent: PlayableComponent::Event,
        #[flat]
        StarterpackEvent: StarterpackComponent::Event,
    }

    fn dojo_init(ref self: ContractState) {
        // [Setup] World
        let world = self.world(@NAMESPACE());
        // [Effect] Initialize components
        self.starterpack.initialize(world);
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

    #[abi(embed_v0)]
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

    #[abi(embed_v0)]
    impl ExternalImpl of IExternal<ContractState> {
        fn register_starterpack(
            ref self: ContractState,
            payment_token: ContractAddress,
            reissuable: bool,
            referral_percentage: u8,
            price: u256,
        ) {
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Effect] Register starterpack
            self.starterpack.register(world, payment_token, reissuable, referral_percentage, price)
        }

        fn update_starterpack(
            ref self: ContractState,
            starterpack_id: u32,
            reissuable: bool,
            payment_token: ContractAddress,
            referral_percentage: u8,
            price: u128,
        ) {
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Effect] Update starterpack
            self
                .starterpack
                .update(
                    world,
                    starterpack_id,
                    reissuable,
                    payment_token,
                    referral_percentage,
                    price.into(),
                )
        }

        fn update_metadata(ref self: ContractState, starterpack_id: u32) {
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Effect] Update metadata
            self.starterpack.update_metadata(world, starterpack_id)
        }
    }
}

