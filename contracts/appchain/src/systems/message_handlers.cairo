#[dojo::contract]
pub mod message_handlers {
    use dojo::model::ModelStorage;

    use nums_common::models::{challenge::Challenge, config::Config};

    const WORLD: felt252 = 0;

    #[l1_handler]
    fn challenge_message_handler(
        ref self: ContractState,
        from_address: felt252,
        challenge: Challenge
    ) {
        // TODO: check if calling address is Starknet Contract
        let mut world = self.world(@"nums");
        world.write_model(@challenge);
    }

    #[l1_handler]
    fn config_message_handler(
        ref self: ContractState,
        from_address: felt252,
        config: Config,
    ) {
        // TODO: check if calling address is Starknet Contract

        //let owner = get_caller_address();
        let mut world = self.world(@"nums");

        //assert!(world.dispatcher.is_owner(WORLD, owner), "Unauthorized owner");
        assert!(config.world_resource == WORLD, "Invalid config state");

        world.write_model(@config);
    }
}