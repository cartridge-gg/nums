use nums::models::config::Config;

#[starknet::interface]
pub trait IConfigActions<T> {
    fn set_config(ref self: T, config: Config);
}

#[dojo::contract]
pub mod config_actions {
    use super::IConfigActions;
    use starknet::ContractAddress;
    use nums::models::config::{Config, GameConfig};
    use nums::{StoreImpl, StoreTrait};
    use nums::WORLD_RESOURCE;

    use dojo::world::IWorldDispatcherTrait;
    use dojo::world::{WorldStorageTrait};

    fn dojo_init(
        ref self: ContractState,
        nums_address: Option<ContractAddress>,
        vrf_address: Option<ContractAddress>,
    ) {
        let mut world = self.world(@"nums");
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
                    world_resource: 0,
                    game: Option::Some(
                        GameConfig {
                            max_slots: 20, max_number: 1000, min_number: 0, entry_cost: 1_000,
                        },
                    ),
                    reward: Option::None,
                    nums_address,
                    vrf_address,
                },
            )
    }

    #[abi(embed_v0)]
    impl ConfigActions of IConfigActions<ContractState> {
        fn set_config(ref self: ContractState, config: Config) {
            let mut world = self.world(@"nums");
            let mut store = StoreImpl::new(world);

            let owner = starknet::get_caller_address();
            assert!(world.dispatcher.is_owner(WORLD_RESOURCE, owner), "Unauthorized owner");
            // assert!(config.world_resource == WORLD_RESOURCE, "Invalid config state");

            store.set_config(config);
        }
    }
}
