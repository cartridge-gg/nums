#[dojo::contract]
pub mod message_handlers {
    use nums_common::models::config::Config;
    use nums_common::models::jackpot::Jackpot;
    use nums_common::WORLD_RESOURCE;
    use dojo::model::ModelStorage;

    #[l1_handler]
    fn create_jackpot_handler(ref self: ContractState, from_address: felt252, jackpot: Jackpot) {
        let mut world = self.world(@"nums");
        let config: Config = world.read_model(WORLD_RESOURCE);
        assert(config.starknet_jackpot.into() == from_address, 'Invalid caller');
        world.write_model(@jackpot);
    }

    #[l1_handler]
    fn set_config_handler(ref self: ContractState, from_address: felt252, config: Config) {
        assert(config.starknet_config.into() == from_address, 'Invalid caller');

        let mut world = self.world(@"nums");
        world.write_model(@config);
    }
}
