#[dojo::contract]
pub mod message_handlers {
    use nums_common::models::config::Config;
    use nums_common::models::jackpot::Jackpot;
    use dojo::model::ModelStorage;

    #[l1_handler]
    fn create_jackpot_handler(
        ref self: ContractState,
        from_address: felt252,
        jackpot: Jackpot
    ) {
        // TODO: check if calling address is Piltover Contract
        let mut world = self.world(@"nums");
        world.write_model(@jackpot);
    }

    #[l1_handler]
    fn set_config_handler(
        ref self: ContractState,
        from_address: felt252,
        config: Config,
    ) {
        // TODO: check if calling address is Piltover Contract
        let mut world = self.world(@"nums");
        world.write_model(@config);
    }
}