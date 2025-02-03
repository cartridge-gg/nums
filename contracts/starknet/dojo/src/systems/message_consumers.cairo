use starknet::ContractAddress;
use piltover::messaging::types::{MessageToAppchainStatus, MessageToStarknetStatus};

#[starknet::interface]
pub trait IMessageConsumers<T> {
    fn consume_claim_jackpot(ref self: T, player: ContractAddress, game_id: u32, jackpot_id: u32);
    fn consume_claim_reward(ref self: T, player: ContractAddress, game_id: u32, amount: u32);
    fn sn_to_appchain_messages(self: @T, message_hash: felt252) -> MessageToAppchainStatus;
    fn appchain_to_sn_messages(self: @T, message_hash: felt252) -> MessageToStarknetStatus;
}

#[dojo::contract]
pub mod message_consumers {
    use super::IMessageConsumers;
    use starknet::ContractAddress;
    use nums_common::models::claims::{Claims, ClaimsType, TokenClaim};
    use nums_common::models::jackpot::Jackpot;
    use nums_common::models::config::Config;
    use nums_common::WORLD_RESOURCE;
    use nums_starknet::interfaces::messaging::{IMessagingDispatcher, IMessagingDispatcherTrait};
    use nums_starknet::interfaces::token::{ITokenDispatcher, ITokenDispatcherTrait};
    use nums_starknet::interfaces::token::{INumsTokenDispatcher, INumsTokenDispatcherTrait};
    use piltover::messaging::types::{MessageToAppchainStatus, MessageToStarknetStatus};
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

            let _ = IMessagingDispatcher { contract_address: config.starknet_messenger }
                .consume_message_from_appchain(
                    config.appchain_claimer,
                    array![player.into(), game_id.into(), jackpot_id.into(),].span()
                );

            jackpot.winner = Option::Some(player);
            jackpot.claimed = true;
            world.write_model(@jackpot);

            if let Option::Some(token) = jackpot.token {
                ITokenDispatcher { contract_address: token.address }.transfer(player, token.total);
            }
        }

        fn consume_claim_reward(
            ref self: ContractState, player: ContractAddress, game_id: u32, amount: u32
        ) {
            assert(player == starknet::get_caller_address(), 'caller is not the player');

            let mut world = self.world(@"nums");
            let mut claims: Claims = world.read_model(game_id);
            let config: Config = world.read_model(WORLD_RESOURCE);
            let hash = IMessagingDispatcher { contract_address: config.starknet_messenger }
                .consume_message_from_appchain(
                    config.appchain_claimer,
                    array![player.into(), game_id.into(), amount.into(),].span()
                );

            match claims.ty {
                ClaimsType::TOKEN(token) => assert(token.amount == 0, 'Already claimed'),
                _ => panic!("Expected token claim"),
            };

            claims.game_id = game_id;
            claims.ty = ClaimsType::TOKEN(TokenClaim { amount });
            claims.message_hash = hash;
            world.write_model(@claims);

            let reward = config.reward.expect('reward token not set');
            INumsTokenDispatcher { contract_address: reward.token }.reward(player, amount);
        }

        fn sn_to_appchain_messages(
            self: @ContractState, message_hash: felt252
        ) -> MessageToAppchainStatus {
            let world = self.world(@"nums");
            let config: Config = world.read_model(WORLD_RESOURCE);

            IMessagingDispatcher { contract_address: config.starknet_messenger }
                .sn_to_appchain_messages(message_hash)
        }

        fn appchain_to_sn_messages(
            self: @ContractState, message_hash: felt252
        ) -> MessageToStarknetStatus {
            let world = self.world(@"nums");
            let config: Config = world.read_model(WORLD_RESOURCE);

            IMessagingDispatcher { contract_address: config.starknet_messenger }
                .appchain_to_sn_messages(message_hash)
        }
    }
}

