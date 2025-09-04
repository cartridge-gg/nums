use nums::models::jackpot::CreateJackpotFactoryParams;


#[starknet::interface]
pub trait IJackpotActions<T> {
    fn create_jackpot_factory(ref self: T, params: CreateJackpotFactoryParams);
    fn claim_jackpot(ref self: T, jackpot_id: u32);
}


#[dojo::contract]
pub mod jackpot_actions {
    // use core::num::traits::Zero;
    use dojo::event::EventStorage;
    use dojo::world::IWorldDispatcherTrait;
    // use nums::constants::ZERO_ADDRESS;
    // use nums::interfaces::token::{ITokenDispatcher, ITokenDispatcherTrait};
    use nums::models::jackpot::{
        JackpotFactoryImpl, JackpotFactoryTrait, JackpotImpl, JackpotMode, JackpotTrait, TimingMode,
    };
    use nums::token::{Token, TokenType};
    use nums::{StoreImpl, StoreTrait, WORLD_RESOURCE};
    use starknet::{get_block_timestamp, get_caller_address};
    use super::*;

    #[derive(Drop, Serde)]
    #[dojo::event]
    pub struct JackpotCreated {
        #[key]
        jackpot_id: u32,
        token: Option<Token>,
    }


    fn dojo_init(self: @ContractState) {
        let mut world = self.world(@"nums");
        let mut store = StoreImpl::new(world);
        let jackpot_actions_addr = starknet::get_contract_address();

        // dojo_init is called by the world, we need to use starknet::get_tx_info() to retrieve
        // deployer account
        let deployer_account = starknet::get_tx_info().unbox().account_contract_address;

        // consume uuid = zero
        let _uuid = world.dispatcher.uuid();

        // create a perpetual nums jackpot factory
        let params = CreateJackpotFactoryParams {
            name: "Perp Nums Jackpot",
            token: Option::None,
            mode: JackpotMode::ConditionalVictory,
            timing_mode: TimingMode::Perpetual,
            initial_duration: 0,
            extension_duration: 0,
            max_winners: 1,
            min_slots: 8, // TODO: set right figure
            jackpot_count: 0,
        };

        let mut factory = JackpotFactoryImpl::new(
            ref world, jackpot_actions_addr, deployer_account, params,
        );
        let mut jackpot = factory.create_jackpot(ref world, ref store);

        store.set_jackpot_factory(@factory);
        store.set_jackpot(@jackpot);
    }

    #[abi(embed_v0)]
    impl JackpotActions of IJackpotActions<ContractState> {
        fn create_jackpot_factory(ref self: ContractState, params: CreateJackpotFactoryParams) {
            let mut world = self.world(@"nums");
            let mut store = StoreImpl::new(world);
            let creator = starknet::get_caller_address();
            let jackpot_actions_addr = starknet::get_contract_address();

            // create factory & transfer rewards to this contract
            let mut factory = JackpotFactoryImpl::new(
                ref world, jackpot_actions_addr, creator, params,
            );
            let mut jackpot = factory.create_jackpot(ref world, ref store);

            store.set_jackpot_factory(@factory);
            store.set_jackpot(@jackpot);
        }


        fn claim_jackpot(ref self: ContractState, jackpot_id: u32) {
            let mut world = self.world(@"nums");
            let mut store = StoreImpl::new(world);
            let player = get_caller_address();

            let mut jackpot = store.jackpot(jackpot_id);
            assert!(jackpot.has_ended(ref store), "jackpot has not ended");

            let claimable = jackpot.claimable(player);
            assert!(claimable > 0, "nothing to claim");
            // TODO
        }
        /// Verifies or unverifies a jackpot as legitimate.
    /// Only the WORLD owner can call this function to mark a jackpot as verified or not.
    ///
    /// # Arguments
    /// * `jackpot_id` - The identifier of the jackpot to verify.
    /// * `verified` - A boolean indicating whether the jackpot should be marked as verified
    /// (true) or not (false).
    // fn verify(ref self: ContractState, jackpot_id: u32, verified: bool) {
    //     let mut world = self.world(@"nums");
    //     let mut store = StoreImpl::new(world);

        //     let owner = get_caller_address();
    //     assert!(world.dispatcher.is_owner(WORLD_RESOURCE, owner), "Unauthorized owner");

        //     let mut jackpot = store.jackpot(jackpot_id);
    //     jackpot.verified = verified;

        //     store.set_jackpot(@jackpot);
    // }
    }

    #[generate_trait]
    pub impl InternalImpl of InternalTrait { // fn _create(
    //     self: @ContractState,
    //     title: felt252,
    //     mode: JackpotMode,
    //     expiration: u64,
    //     token: Option<Token>,
    // ) -> u32 {
    //     if expiration > 0 {
    //         // TODO: add min delay
    //         assert!(expiration > get_block_timestamp(), "Expiration already passed")
    //     }

    //     let mut world = self.world(@"nums");
    //     let mut store = StoreImpl::new(world);
    //     let creator = get_caller_address();
    //     let id = world.dispatcher.uuid();

    //     store
    //         .set_jackpot(
    //             @Jackpot {
    //                 id,
    //                 title,
    //                 creator,
    //                 mode,
    //                 expiration,
    //                 token,
    //                 claimed: false,
    //                 verified: false,
    //                 winner: Option::None,
    //             },
    //         );

    //     world.emit_event(@JackpotCreated { jackpot_id: id, token });
    //     // let config = store.config();

    //     if let Option::Some(token) = token {
    //         assert(token.ty == TokenType::ERC20, 'only ERC20 supported');
    //         assert(token.total.is_non_zero(), 'total cannot be zero');
    //         // // message_consumers.cairo is what will transfer jackpot
    //     // ITokenDispatcher { contract_address: token.address }
    //     //     .transferFrom(
    //     //         get_caller_address(), config.starknet_consumer.clone(), token.total,
    //     //     );
    //     }

    //     id
    // }
    }
}

