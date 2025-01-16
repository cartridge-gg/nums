#[dojo::contract]
pub mod message_handlers {
    use dojo::model::ModelStorage;

    use nums_common::messages::ChallengeMessage;
    use nums_appchain::models::challenge::Challenge;

    #[l1_handler]
    fn challenge_message_handler(
        ref self: ContractState,
        from_address: felt252,
        challenge_message: ChallengeMessage
    ) {
        // TODO: check if calling address is Starknet Contract
        let mut world = self.world(@"nums");
        world.write_model(
            @Challenge {
                id: challenge_message.id,
                mode: challenge_message.mode,
                expiration: challenge_message.expiration,
                winner: Option::None,
            }
        );
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