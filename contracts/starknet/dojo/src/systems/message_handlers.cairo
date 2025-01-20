use starknet::ContractAddress;

#[starknet::interface]
pub trait IMessageHandlers<T> {
    fn consume_claim_jackpot(ref self: T, game_id: u32, jackpot_id: u32, player: ContractAddress);
}

#[dojo::contract]
pub mod message_handlers {
    use super::IMessageHandlers;
    use starknet::ContractAddress;
    use nums_common::models::jackpot::Jackpot;
    use nums_common::models::config::Config;
    use nums_starknet::interfaces::messaging::{IMessagingDispatcher, IMessagingDispatcherTrait};

    use dojo::model::ModelStorage;

    const WORLD: felt252 = 0;

    #[abi(embed_v0)]
    impl MessageHandlersImpl of IMessageHandlers<ContractState> {
        fn consume_claim_jackpot(ref self: ContractState, game_id: u32, jackpot_id: u32, player: ContractAddress) {
            assert(player == starknet::get_caller_address(), 'caller is not the player');

            let mut world = self.world(@"nums");
            let mut jackpot: Jackpot = world.read_model(jackpot_id);
            assert(jackpot.winner.is_none(), 'Jackpot already claimed');

            let config: Config = world.read_model(WORLD);
            assert(config.game.is_some(), 'game config not set');

            let _msg_hash = IMessagingDispatcher { 
                contract_address: config.messenger_address
            }.consume_message_from_appchain(
                config.appchain_jackpot,
                array![
                    game_id.into(),
                    jackpot_id.into(),
                    player.into(),
                ].span()
            );

            jackpot.winner = Option::Some(player);
            jackpot.claimed = true;
            world.write_model(@jackpot);

            // if let Option::Some(token) = jackpot.token {
            //     ITokenDispatcher { contract_address: token.address }
            //         .transfer(game.player, token.total);
            // }
        }
    }
}
