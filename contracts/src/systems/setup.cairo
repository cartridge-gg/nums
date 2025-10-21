use crate::models::config::Config;

#[starknet::interface]
pub trait ISetup<T> {
    fn set_config(ref self: T, config: Config);
}

#[dojo::contract]
pub mod Setup {
    use dojo::world::{IWorldDispatcherTrait, WorldStorageTrait};
    use starknet::ContractAddress;
    use crate::StoreImpl;
    use crate::constants::{NAMESPACE, WORLD_RESOURCE};
    use crate::models::config::{Config, ConfigTrait};
    use super::ISetup;

    fn dojo_init(
        ref self: ContractState,
        nums_address: Option<ContractAddress>,
        vrf_address: Option<ContractAddress>,
        starterpack_address: ContractAddress,
        forwarder_address: ContractAddress,
        owner_address: ContractAddress,
    ) {
        // [Setup] World and Store
        let mut world = self.world(@NAMESPACE());
        let mut store = StoreImpl::new(world);
        // [Effect] Create config
        let nums_address = nums_address
            .unwrap_or(world.dns_address(@"MockNumsToken").expect('MockNumsToken not found!'));
        let vrf_address = vrf_address
            .unwrap_or(world.dns_address(@"MockVRF").expect('MockVRF not found!'));
        let config = ConfigTrait::new(
            world_resource: WORLD_RESOURCE,
            nums: nums_address,
            vrf: vrf_address,
            starterpack: starterpack_address,
            forwarder: forwarder_address,
            owner: owner_address,
        );
        store.set_config(config);
    }

    #[abi(embed_v0)]
    impl SetupImpl of ISetup<ContractState> {
        fn set_config(ref self: ContractState, config: Config) {
            // [Setup] World and Store
            let mut world = self.world(@NAMESPACE());
            let mut store = StoreImpl::new(world);
            // [Check] Caller is allowed
            let caller = starknet::get_caller_address();
            assert!(world.dispatcher.is_owner(WORLD_RESOURCE, caller), "Unauthorized caller");
            // [Effect] Update config
            store.set_config(config);
        }
    }
}
