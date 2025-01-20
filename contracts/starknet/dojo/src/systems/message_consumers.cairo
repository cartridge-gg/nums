use starknet::ContractAddress;

#[starknet::interface]
pub trait IMessageConsumers<T> {
    fn consume_claim_jackpot(ref self: T, player: ContractAddress, game_id: u32, jackpot_id: u32);
    fn consume_claim_reward(ref self: T, player: ContractAddress, game_id: u32, amount: u16);
}

#[dojo::contract]
pub mod message_consumers {
    use super::IMessageConsumers;
    use starknet::ContractAddress;
    use nums_starknet::models::message::{Message, Destination};
    use nums_common::models::jackpot::Jackpot;
    use nums_common::models::config::Config;
    use nums_common::WORLD_RESOURCE;
    use nums_starknet::interfaces::messaging::{IMessagingDispatcher, IMessagingDispatcherTrait};

    use dojo::model::ModelStorage;

    #[abi(embed_v0)]
    impl MessageConsumersImpl of IMessageConsumers<ContractState> {
        fn consume_claim_jackpot(
            ref self: ContractState, player: ContractAddress, game_id: u32, jackpot_id: u32
        ) {
            assert(player == starknet::get_caller_address(), 'caller is not the player');

            let mut world = self.world(@"nums");
            let mut jackpot: Jackpot = world.read_model(jackpot_id);
            assert(jackpot.winner.is_none(), 'Jackpot already claimed');

            let config: Config = world.read_model(WORLD_RESOURCE);
            assert(config.game.is_some(), 'game config not set');

            let hash = IMessagingDispatcher { contract_address: config.starknet_messenger }
                .consume_message_from_appchain(
                    config.appchain_claimer,
                    array![player.into(), game_id.into(), jackpot_id.into(),].span()
                );

            let message = Message { player, hash, destination: Destination::STARKNET, };
            world.write_model(@message);

            jackpot.winner = Option::Some(player);
            jackpot.claimed = true;
            world.write_model(@jackpot);
            // if let Option::Some(token) = jackpot.token {
        //     ITokenDispatcher { contract_address: token.address }
        //         .transfer(game.player, token.total);
        // }
        }

        fn consume_claim_reward(
            ref self: ContractState, player: ContractAddress, game_id: u32, amount: u16
        ) {}
    }
}
