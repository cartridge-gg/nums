use nums::models::config::Config;

#[starknet::interface]
pub trait IConfigActions<T> {
    fn set_config(ref self: T, config: Config);
}

#[dojo::contract]
pub mod config_actions {
    use super::IConfigActions;
    use nums::models::config::Config;
    use nums::WORLD_RESOURCE;

    use dojo::model::ModelStorage;
    use dojo::world::IWorldDispatcherTrait;

    #[abi(embed_v0)]
    impl ConfigActions of IConfigActions<ContractState> {
        fn set_config(ref self: ContractState, config: Config) {
            let owner = starknet::get_caller_address();
            let mut world = self.world(@"nums");

            assert!(world.dispatcher.is_owner(WORLD_RESOURCE, owner), "Unauthorized owner");
            assert!(config.world_resource == WORLD_RESOURCE, "Invalid config state");

            world.write_model(@config);
        }
    }
}
