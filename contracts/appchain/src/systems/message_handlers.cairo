#[dojo::contract]
pub mod message_handlers {
    use dojo::model::ModelStorage;
    use nums_common::models::{jackpot::Jackpot, config::Config};

    #[l1_handler]
    fn jackpot_message_handler(
        ref self: ContractState,
        from_address: felt252,
        jackpot: Jackpot
    ) {
        // TODO: check if calling address is Piltover Contract
        let mut world = self.world(@"nums");
        world.write_model(@jackpot);
    }

    #[l1_handler]
    fn config_message_handler(
        ref self: ContractState,
        from_address: felt252,
        config: Config,
    ) {
        // TODO: check if calling address is Piltover Contract
        let mut world = self.world(@"nums");
        world.write_model(@config);
    }
}