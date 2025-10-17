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
    use crate::models::config::Config;
    use super::ISetup;

    fn dojo_init(
        ref self: ContractState,
        nums_address: Option<ContractAddress>,
        vrf_address: Option<ContractAddress>,
        starterpack_address: Option<ContractAddress>,
        forwarder_address: Option<ContractAddress>,
        owner_address: Option<ContractAddress>,
    ) {
        let mut world = self.world(@NAMESPACE());
        let mut store = StoreImpl::new(world);

        let nums_address = if let Option::Some(address) = nums_address {
            address
        } else {
            world.dns_address(@"MockNumsToken").expect('MockNumsToken not found!')
        };

        let vrf_address = if let Option::Some(address) = vrf_address {
            address
        } else {
            world.dns_address(@"MockVRF").expect('MockVRF not found!')
        };

        store
            .set_config(
                Config {
                    world_resource: 0, nums_address, vrf_address, forwarder_address, owner_address,
                },
            )
    }

    #[abi(embed_v0)]
    impl SetupImpl of ISetup<ContractState> {
        fn set_config(ref self: ContractState, config: Config) {
            let mut world = self.world(@"nums");
            let mut store = StoreImpl::new(world);

            let caller = starknet::get_caller_address();
            assert!(world.dispatcher.is_owner(WORLD_RESOURCE, caller), "Unauthorized caller");

            store.set_config(config);
        }
    }
}
