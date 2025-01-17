use nums_common::token::Token;
use nums_common::messages::AppChain;


#[starknet::interface]
pub trait IJackpotActions<T> {
    fn create_king_of_the_hill(
        ref self: T,
        title: felt252,
        expiration: u64,
        extension_time: u64,
        token: Option<Token>,
        appchain: AppChain,
    ) -> u32;
    fn create_conditional_victory(
        ref self: T,
        title: felt252,
        expiration: u64,
        slots_required: u8,
        token: Option<Token>,
        appchain: AppChain,
    ) -> u32;
    fn verify(ref self: T, jackpot_id: u32, verified: bool);
    fn resend_appchain_message(ref self: T, jackpot_id: u32, appchain: AppChain);
    //fn king_me(ref self: T, game_id: u32);
}


#[dojo::contract]
pub mod jackpot_actions {
    use core::array::ArrayTrait;
    use core::num::traits::Zero;
    use nums_starknet::interfaces::token::{ITokenDispatcher, ITokenDispatcherTrait};
    use nums_starknet::interfaces::messaging::{IMessagingDispatcher, IMessagingDispatcherTrait};
    use nums_common::token::{Token, TokenType};
    use nums_common::models::jackpot::{Jackpot, JackpotMode, ConditionalVictory, KingOfTheHill};
    use nums_common::messages::AppChain;

    use dojo::model::ModelStorage;
    use dojo::event::EventStorage;
    use dojo::world::IWorldDispatcherTrait;

    use starknet::{ContractAddress, get_contract_address, get_caller_address, get_block_timestamp};
    use super::IJackpotActions;

    const WORLD: felt252 = 0;

    #[derive(Drop, Serde)]
    #[dojo::event]
    pub struct JackpotCreated {
        #[key]
        jackpot_id: u32,
        token: Option<Token>,
    }

    #[derive(Drop, Serde)]
    #[dojo::event]
    pub struct JackpotClaimed {
        #[key]
        game_id: u32,
        #[key]
        jackpot_id: u32,
        player: ContractAddress,
    }

    #[derive(Drop, Serde)]
    #[dojo::event]
    pub struct KingCrowned {
        #[key]
        game_id: u32,
        #[key]
        jackpot_id: u32,
        player: ContractAddress
    }

    #[abi(embed_v0)]
    impl JackpotActions of IJackpotActions<ContractState> {
        fn create_conditional_victory(
            ref self: ContractState,
            title: felt252,
            expiration: u64,
            slots_required: u8,
            token: Option<Token>,
            appchain: AppChain,
        ) -> u32 {
            let mode = JackpotMode::CONDITIONAL_VICTORY(ConditionalVictory { slots_required });
            self._create(title, mode, expiration, token, appchain)
        }

        fn create_king_of_the_hill(
            ref self: ContractState,
            title: felt252,
            expiration: u64,
            extension_time: u64,
            token: Option<Token>,
            appchain: AppChain,
        ) -> u32 {
            if expiration == 0 && extension_time > 0 {
                panic!("cannot set extension with no expiration");
            }

            let mode = JackpotMode::KING_OF_THE_HILL(
                KingOfTheHill {
                    extension_time,
                    king: starknet::contract_address_const::<0x0>(),
                }
            );
            self._create(title, mode, expiration, token, appchain)
        }

        /// Claims the jackpot for a specific game. Ensures that the player is authorized and that
        /// the jackpot has not been claimed before.
        /// Transfers the jackpot token to the player and updates the jackpot state.
        ///
        /// # Arguments
        /// * `game_id` - The identifier of the game.
        // fn claim(ref self: ContractState, game_id: u32) {
        //     let mut world = self.world(@"nums");
        //     let player = get_caller_address();
        //     let game: Game = world.read_model((game_id, player));
        //     let config: Config = world.read_model(WORLD);
        //     let game_config = config.game.expect('game config not set');
        //     let jackpot_id = game.jackpot_id.expect('jackpot not defined');
        //     let mut jackpot: Jackpot = world.read_model(jackpot_id);

        //     if jackpot.expiration > 0 {
        //         assert(jackpot.expiration < get_block_timestamp(), 'cannot claim yet')
        //     }

        //     let mut nums = ArrayTrait::<u16>::new();
        //     let mut idx = game_config.max_slots;
        //     while idx > 0 {
        //         let slot: Slot = world.read_model(((game_id, player, game_config.max_slots - idx)));
        //         if slot.number != 0 {
        //             nums.append(slot.number);
        //         }
        //         idx -= 1_u8;
        //     };

        //     assert(nums.len() != 0, 'no slots filled');
        //     assert(game.is_valid(@nums), 'invalid game state');
        //     assert(jackpot.can_claim(@nums), 'cannot claim jackpot');

        //     jackpot.winner = Option::Some(game.player);
        //     jackpot.claimed = true;
        //     world.write_model(@jackpot);
        //     world.emit_event(@JackpotClaimed { game_id, jackpot_id, player });

        //     if let Option::Some(token) = jackpot.token {
        //         ITokenDispatcher { contract_address: token.address }
        //             .transfer(game.player, token.total);
        //     }
        // }

        /// Attempts to crown the caller as the new king in a King of the Hill jackpot.
        ///
        /// This function allows a player to claim the position of "king" in a King of the Hill
        /// jackpot game. It verifies that the game is associated with a King of the Hill
        /// jackpot, updates the current king, and potentially extends the jackpot's expiration
        /// time.
        ///
        /// The remaining_slots mechanism ensures that each new king must have fewer or equal
        /// remaining slots compared to the previous king. This creates a progressively more
        /// challenging game as it continues.
        ///
        /// # Arguments
        /// * `game_id` - The identifier of the game associated with the jackpot.
        // fn king_me(ref self: ContractState, game_id: u32) {
        //     let mut world = self.world(@"nums");
        //     let player = get_caller_address();
        //     let game: Game = world.read_model((game_id, player));
        //     let jackpot_id = game.jackpot_id.expect('Jackpot not defined');
        //     let mut jackpot: Jackpot = world.read_model(jackpot_id);

        //     let mut king_of_the_hill = match jackpot.mode {
        //         JackpotMode::KING_OF_THE_HILL(koth) => koth,
        //         _ => panic!("Not a King of the Hill jackpot")
        //     };

        //     assert(jackpot.expiration > get_block_timestamp(), 'Jackpot already expired');
        //     assert(
        //         game.remaining_slots < king_of_the_hill.remaining_slots
        //             || (game.remaining_slots == king_of_the_hill.remaining_slots
        //                 && player != king_of_the_hill.king),
        //         'No improvement or already king'
        //     );

        //     king_of_the_hill.king = player;
        //     king_of_the_hill.remaining_slots = game.remaining_slots;

        //     if king_of_the_hill.extension_time > 0 {
        //         let new_expiration = jackpot.expiration + king_of_the_hill.extension_time;
        //         if new_expiration > jackpot.expiration {
        //             jackpot.expiration = new_expiration;
        //         }
        //     }

        //     // Update the jackpot with the new king
        //     jackpot.mode = JackpotMode::KING_OF_THE_HILL(king_of_the_hill);
        //     world.write_model(@jackpot);
        //     world.emit_event(@KingCrowned { game_id, jackpot_id, player });
        // }


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

        fn resend_appchain_message(ref self: ContractState, jackpot_id: u32, appchain: AppChain) {
            let mut world = self.world(@"nums");
            let jackpot: Jackpot = world.read_model(jackpot_id);
            self._send_appchain_message(jackpot, appchain);
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
            appchain: AppChain,
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

            self._send_appchain_message(jackpot, appchain);

            id
        }

        fn _send_appchain_message(
            self: @ContractState,
            jackpot: Jackpot,
            appchain: AppChain,
        ) {
            let mut payload: Array<felt252> = array![];
            jackpot.serialize(ref payload);
            
            IMessagingDispatcher { contract_address: appchain.message_contract.try_into().unwrap() }.send_message_to_appchain(
                appchain.to_address.try_into().unwrap(),
                appchain.to_selector,
                payload.span(),
            );
        }
    }
}

