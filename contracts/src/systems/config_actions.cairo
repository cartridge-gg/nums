use nums::models::config::Config;

#[starknet::interface]
pub trait IConfigActions<T> {
    fn set_config(ref self: T, config: Config);
}

#[dojo::contract]
pub mod config_actions {
    use dojo::world::{IWorldDispatcherTrait, WorldStorageTrait};
    use nums::models::config::{Config, GameConfig};
    use nums::{StoreImpl, StoreTrait, WORLD_RESOURCE};
    use starknet::ContractAddress;
    use crate::constants::ONE_MINUTE;
    use super::IConfigActions;

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
                    nums_address,
                    vrf_address,
                    game: GameConfig {
                        max_slots: 20,
                        min_number: 1,
                        max_number: 1000,
                        entry_cost: 1000,
                        game_duration: 3 * ONE_MINUTE,
                    },
                    reward: array![
                        1, 1, 1, 2, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192,
                        16384, 32768, 65536,
                    ],
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

            store.set_config(config);
        }
    }
}
