use nums_common::token::Token;


#[starknet::interface]
pub trait IJackpotActions<T> {
    fn create_king_of_the_hill(
        ref self: T,
        title: felt252,
        expiration: u64,
        extension_time: u64,
        token: Option<Token>,
    ) -> u32;
    fn create_conditional_victory(
        ref self: T,
        title: felt252,
        expiration: u64,
        slots_required: u8,
        token: Option<Token>,
    ) -> u32;
    fn verify(ref self: T, jackpot_id: u32, verified: bool);
}


#[dojo::contract]
pub mod jackpot_actions {
    use core::array::ArrayTrait;
    use core::num::traits::Zero;
    use nums_starknet::interfaces::token::{ITokenDispatcher, ITokenDispatcherTrait};
    use nums_starknet::interfaces::messaging::{IMessagingDispatcher, IMessagingDispatcherTrait};
    use nums_common::token::{Token, TokenType};
    use nums_common::models::jackpot::{Jackpot, JackpotMode, ConditionalVictory, KingOfTheHill};
    use nums_common::models::config::Config;

    use dojo::model::ModelStorage;
    use dojo::event::EventStorage;
    use dojo::world::IWorldDispatcherTrait;

    use starknet::{get_contract_address, get_caller_address, get_block_timestamp, ContractAddress};
    use super::IJackpotActions;

    const WORLD: felt252 = 0;

    #[derive(Drop, Serde)]
    #[dojo::event]
    pub struct JackpotCreated {
        #[key]
        jackpot_id: u32,
        token: Option<Token>,
    }

    #[abi(embed_v0)]
    impl JackpotActions of IJackpotActions<ContractState> {
        fn create_conditional_victory(
            ref self: ContractState,
            title: felt252,
            expiration: u64,
            slots_required: u8,
            token: Option<Token>,
        ) -> u32 {
            let mut world = self.world(@"nums");
            let config: Config = world.read_model(WORLD);
            let game_config = config.game.expect('game config not set');

            assert(slots_required <= game_config.max_slots, 'cannot require > max slots');
            let mode = JackpotMode::CONDITIONAL_VICTORY(ConditionalVictory { slots_required });
            self._create(title, mode, expiration, token, config.messenger_address, config.appchain_handler)
        }

        fn create_king_of_the_hill(
            ref self: ContractState,
            title: felt252,
            expiration: u64,
            extension_time: u64,
            token: Option<Token>,
        ) -> u32 {
            if expiration == 0 && extension_time > 0 {
                panic!("cannot set extension with no expiration");
            }

            let mut world = self.world(@"nums");
            let config: Config = world.read_model(WORLD);
            let game_config = config.game.expect('game config not set');

            let mode = JackpotMode::KING_OF_THE_HILL(
                KingOfTheHill {
                    extension_time,
                    king: starknet::contract_address_const::<0x0>(),
                    remaining_slots: game_config.max_slots,
                }
            );
            self._create(title, mode, expiration, token, config.messenger_address, config.appchain_handler)
        }

        /// Verifies or unverifies a jackpot as legitimate.
        /// Only the game owner can call this function to mark a jackpot as verified or not.
        ///
        /// # Arguments
        /// * `jackpot_id` - The identifier of the jackpot to verify.
        /// * `verified` - A boolean indicating whether the jackpot should be marked as verified
        /// (true) or not (false).
        fn verify(ref self: ContractState, jackpot_id: u32, verified: bool) {
            let mut world = self.world(@"nums");
            let owner = get_caller_address();
            assert!(world.dispatcher.is_owner(WORLD, owner), "Unauthorized owner");
            let mut jackpot: Jackpot = world.read_model(jackpot_id);
            jackpot.verified = verified;

            world.write_model(@jackpot);
        }
    }

    #[generate_trait]
    pub impl InternalImpl of InternalTrait {
        fn _create(
            self: @ContractState,
            title: felt252,
            mode: JackpotMode,
            expiration: u64,
            token: Option<Token>,
            messenger_address: ContractAddress,
            appchain_handler: ContractAddress
        ) -> u32 {
            if expiration > 0 {
                assert!(expiration > get_block_timestamp(), "Expiration already passed")
            }

            let mut world = self.world(@"nums");
            let creator = get_caller_address();
            let id = world.dispatcher.uuid();
            let jackpot = Jackpot {
                id,
                title,
                creator,
                mode,
                expiration,
                token,
                claimed: false,
                verified: false,
                winner: Option::None,
            };

            world.write_model(@jackpot);
            world.emit_event(@JackpotCreated { jackpot_id: id, token });

            if let Option::Some(token) = token {
                assert(token.ty == TokenType::ERC20, 'only ERC20 supported');
                assert(token.total.is_non_zero(), 'total cannot be zero');

                ITokenDispatcher { contract_address: token.address }
                    .transferFrom(get_caller_address(), get_contract_address(), token.total);
            }

            let mut payload: Array<felt252> = array![];
            jackpot.serialize(ref payload);
            
            IMessagingDispatcher { contract_address: messenger_address }.send_message_to_appchain(
                appchain_handler,
                selector!("create_jackpot_handler"),
                payload.span(),
            );

            id
        }
    }
}

