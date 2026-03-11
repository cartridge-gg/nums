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
    use dojo::world::WorldStorageTrait;
    use ekubo::interfaces::positions::IPositionsDispatcherTrait;
    use ekubo::types::bounds::Bounds;
    use ekubo::types::keys::PoolKey;
    use openzeppelin::access::accesscontrol::AccessControlComponent;
    use openzeppelin::governance::timelock::TimelockControllerComponent;
    use openzeppelin::introspection::src5::SRC5Component;
    use starknet::ContractAddress;
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
}
