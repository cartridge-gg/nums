use ekubo::types::bounds::Bounds;
use ekubo::types::keys::PoolKey;

pub fn NAME() -> ByteArray {
    "Treasury"
}

#[starknet::interface]
pub trait ICollector<TContractState> {
    fn collect_fees(self: @TContractState, id: u64, pool_key: PoolKey, bounds: Bounds);
}

#[dojo::contract]
mod Treasury {
    use core::num::traits::Zero;
    use dojo::world::WorldStorageTrait;
    use ekubo::interfaces::positions::IPositionsDispatcherTrait;
    use ekubo::types::bounds::Bounds;
    use ekubo::types::keys::PoolKey;
    use openzeppelin::access::accesscontrol::AccessControlComponent;
    use openzeppelin::governance::timelock::TimelockControllerComponent;
    use openzeppelin::introspection::src5::SRC5Component;
    use starknet::account::Call;
    use starknet::syscalls::call_contract_syscall;
    use starknet::{AccountContract, ContractAddress, get_caller_address, get_tx_info};
    use crate::constants::NAMESPACE;
    use crate::store::StoreTrait;
    use crate::systems::governor::NAME as GOVERNOR;

    component!(path: AccessControlComponent, storage: access_control, event: AccessControlEvent);
    component!(path: TimelockControllerComponent, storage: timelock, event: TimelockEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);

    // Timelock Mixin
    #[abi(embed_v0)]
    impl TimelockMixinImpl =
        TimelockControllerComponent::TimelockMixinImpl<ContractState>;
    impl TimelockInternalImpl = TimelockControllerComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        access_control: AccessControlComponent::Storage,
        #[substorage(v0)]
        timelock: TimelockControllerComponent::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        AccessControlEvent: AccessControlComponent::Event,
        #[flat]
        TimelockEvent: TimelockControllerComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
    }

    fn dojo_init(ref self: ContractState, min_delay: u64, admin: ContractAddress) {
        let world = self.world(@NAMESPACE());
        let governor = world.dns_address(@GOVERNOR()).expect('Governor not found!');
        let proposers: Span<ContractAddress> = array![governor].span();
        let executors: Span<ContractAddress> = array![0.try_into().unwrap()].span();
        self.timelock.initializer(min_delay, proposers, executors, admin);
    }

    #[abi(embed_v0)]
    impl ICollectorImpl of super::ICollector<ContractState> {
        fn collect_fees(self: @ContractState, id: u64, pool_key: PoolKey, bounds: Bounds) {
            // [Effect] Collect funds
            let world = self.world(@NAMESPACE());
            let store = StoreTrait::new(world);
            let positions = store.ekubo_positions();
            positions.collect_fees(id, pool_key, bounds);
        }
    }

    // This implementation exists solely for the purpose of allowing simulation of calls from the
    // governor with the flag to skip validation
    #[abi(embed_v0)]
    impl GovernorAccountContractForSimulation of AccountContract<ContractState> {
        fn __validate_declare__(self: @ContractState, class_hash: felt252) -> felt252 {
            panic!("Not allowed");
        }
        fn __validate__(ref self: ContractState, calls: Array<Call>) -> felt252 {
            panic!("Not allowed");
        }
        fn __execute__(ref self: ContractState, mut calls: Array<Call>) -> Array<Span<felt252>> {
            assert(get_caller_address().is_zero(), 'Invalid caller');
            let tx_version = get_tx_info().unbox().version.into();
            assert(
                tx_version == 0x100000000000000000000000000000001
                    || tx_version == 0x100000000000000000000000000000003,
                'Invalid TX version',
            );
            let mut results: Array<Span<felt252>> = array![];
            while let Option::Some(call) = calls.pop_front() {
                results.append(call.execute());
            }
            results
        }
    }

    #[generate_trait]
    pub impl CallTraitImpl of CallTrait {
        fn execute(self: @Call) -> Span<felt252> {
            let result = call_contract_syscall(*self.to, *self.selector, *self.calldata);

            if (result.is_err()) {
                panic(result.unwrap_err());
            }

            result.unwrap()
        }
    }
}
