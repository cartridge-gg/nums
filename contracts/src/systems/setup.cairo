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
    use crate::mocks::nums::NAME as NUMS;
    use crate::mocks::starterpack::NAME as STARTERPACK;
    use crate::mocks::vrf::NAME as VRF;
    use crate::models::config::{Config, ConfigTrait};
    use super::ISetup;

    fn dojo_init(
        ref self: ContractState,
        nums_address: Option<ContractAddress>,
        vrf_address: Option<ContractAddress>,
        starterpack_address: Option<ContractAddress>,
        forwarder_address: ContractAddress,
        owner_address: ContractAddress,
    ) {
        // [Setup] World and Store
        let mut world = self.world(@NAMESPACE());
        let mut store = StoreImpl::new(world);
        // [Effect] Create config
        let nums_address = if let Option::Some(nums_address) = nums_address {
            nums_address
        } else {
            world.dns_address(@NUMS()).expect('MockNumsToken not found!')
        };
        let vrf_address = if let Option::Some(vrf_address) = vrf_address {
            vrf_address
        } else {
            world.dns_address(@VRF()).expect('MockVRF not found!')
        };
        let starterpack_address = if let Option::Some(starterpack_address) = starterpack_address {
            starterpack_address
        } else {
            world.dns_address(@STARTERPACK()).expect('MockStarterpack not found!')
        };
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
