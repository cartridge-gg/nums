#[dojo::contract]
pub mod message_handlers {
    use dojo::model::ModelStorage;

    use nums_common::models::challenge::Challenge;

    #[l1_handler]
    fn challenge_message_handler(
        ref self: ContractState,
        from_address: felt252,
        challenge_title: felt252,
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
        payload: Span<felt252>
    ) {
        panic!("Not implemented");
    }
}