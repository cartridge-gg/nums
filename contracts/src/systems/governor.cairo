pub fn NAME() -> ByteArray {
    "Governor"
}

#[dojo::contract]
mod Governor {
    use dojo::world::WorldStorageTrait;
    use openzeppelin::governance::governor::GovernorComponent::InternalTrait as GovernorInternalTrait;
    use openzeppelin::governance::governor::extensions::GovernorVotesQuorumFractionComponent::InternalTrait;
    use openzeppelin::governance::governor::extensions::{
        GovernorCoreExecutionComponent, GovernorCountingSimpleComponent,
        GovernorVotesQuorumFractionComponent,
    };
    use openzeppelin::governance::governor::{DefaultConfig, GovernorComponent};
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::utils::cryptography::snip12::SNIP12Metadata;
    use crate::constants::NAMESPACE;
    use crate::systems::token::NAME as TOKEN;

    pub const VOTING_DELAY: u64 = 86400; // 1 day
    pub const VOTING_PERIOD: u64 = 604800; // 1 week
    pub const PROPOSAL_THRESHOLD: u256 = 10;
    pub const QUORUM_NUMERATOR: u256 = 40; // 4%

    component!(path: GovernorComponent, storage: governor, event: GovernorEvent);
    component!(
        path: GovernorVotesQuorumFractionComponent,
        storage: governor_votes,
        event: GovernorVotesEvent,
    );
    component!(
        path: GovernorCountingSimpleComponent,
        storage: governor_counting_simple,
        event: GovernorCountingSimpleEvent,
    );
    component!(
        path: GovernorCoreExecutionComponent,
        storage: governor_core_execution,
        event: GovernorCoreExecutionEvent,
    );
    component!(path: SRC5Component, storage: src5, event: SRC5Event);

    // Governor
    #[abi(embed_v0)]
    impl GovernorImpl = GovernorComponent::GovernorImpl<ContractState>;

    // Extensions external
    #[abi(embed_v0)]
    impl QuorumFractionImpl =
        GovernorVotesQuorumFractionComponent::QuorumFractionImpl<ContractState>;

    // Extensions internal
    impl GovernorQuorumImpl = GovernorVotesQuorumFractionComponent::GovernorQuorum<ContractState>;
    impl GovernorVotesImpl = GovernorVotesQuorumFractionComponent::GovernorVotes<ContractState>;
    impl GovernorCountingSimpleImpl =
        GovernorCountingSimpleComponent::GovernorCounting<ContractState>;
    impl GovernorCoreExecutionImpl =
        GovernorCoreExecutionComponent::GovernorExecution<ContractState>;

    // SRC5
    #[abi(embed_v0)]
    impl SRC5Impl = SRC5Component::SRC5Impl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        pub governor: GovernorComponent::Storage,
        #[substorage(v0)]
        pub governor_votes: GovernorVotesQuorumFractionComponent::Storage,
        #[substorage(v0)]
        pub governor_counting_simple: GovernorCountingSimpleComponent::Storage,
        #[substorage(v0)]
        pub governor_core_execution: GovernorCoreExecutionComponent::Storage,
        #[substorage(v0)]
        pub src5: SRC5Component::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        GovernorEvent: GovernorComponent::Event,
        #[flat]
        GovernorVotesEvent: GovernorVotesQuorumFractionComponent::Event,
        #[flat]
        GovernorCountingSimpleEvent: GovernorCountingSimpleComponent::Event,
        #[flat]
        GovernorCoreExecutionEvent: GovernorCoreExecutionComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
    }

    fn dojo_init(ref self: ContractState) {
        let world = self.world(@NAMESPACE());
        let token_address = world.dns_address(@TOKEN()).expect('Token not found!');
        self.governor.initializer();
        self.governor_votes.initializer(token_address, QUORUM_NUMERATOR);
    }

    //
    // SNIP12 Metadata
    //

    pub impl SNIP12MetadataImpl of SNIP12Metadata {
        fn name() -> felt252 {
            'DAPP_NAME'
        }

        fn version() -> felt252 {
            'DAPP_VERSION'
        }
    }

    //
    // Locally implemented extensions
    //

    pub impl GovernorSettings of GovernorComponent::GovernorSettingsTrait<ContractState> {
        /// See `GovernorComponent::GovernorSettingsTrait::voting_delay`.
        fn voting_delay(self: @GovernorComponent::ComponentState<ContractState>) -> u64 {
            VOTING_DELAY
        }

        /// See `GovernorComponent::GovernorSettingsTrait::voting_period`.
        fn voting_period(self: @GovernorComponent::ComponentState<ContractState>) -> u64 {
            VOTING_PERIOD
        }

        /// See `GovernorComponent::GovernorSettingsTrait::proposal_threshold`.
        fn proposal_threshold(self: @GovernorComponent::ComponentState<ContractState>) -> u256 {
            PROPOSAL_THRESHOLD
        }
    }
}
