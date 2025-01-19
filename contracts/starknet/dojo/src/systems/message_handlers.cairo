use nums_common::models::jackpot::Jackpot;

#[starknet::interface]
pub trait IMessageHandlers<T> {
    fn consume_claim_jackpot(ref self: T, jackpot: Jackpot);
}

#[dojo::contract]
pub mod message_handlers {
    use super::IMessageHandlers;
    use nums_common::models::jackpot::Jackpot;

    use dojo::model::ModelStorage;

    const WORLD: felt252 = 0;

    #[abi(embed_v0)]
    impl MessageHandlersImpl of IMessageHandlers<ContractState> {
        fn consume_claim_jackpot(ref self: ContractState, jackpot: Jackpot) {
            let player = starknet::get_caller_address();
            assert(jackpot.winner == Option::Some(player), 'Jackpot not won by player');

            let world = self.world(@"nums");
            let starknet_jackpot: Jackpot = world.read_model(jackpot.id);
            assert(starknet_jackpot.id == jackpot.id, 'Jackpot ID mismatch');
            assert(starknet_jackpot.winner.is_none(), 'Jackpot already claimed');
            
            

            // if let Option::Some(token) = jackpot.token {
            //     ITokenDispatcher { contract_address: token.address }
            //         .transfer(game.player, token.total);
            // }
        }
    }
}
