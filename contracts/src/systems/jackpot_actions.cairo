use nums::models::jackpot::CreateJackpotFactoryParams;


#[starknet::interface]
pub trait IJackpotActions<T> {
    fn create_jackpot_factory(ref self: T, params: CreateJackpotFactoryParams);
    fn claim_jackpot(ref self: T, jackpot_id: u32, indexes: Array<u8>);
    fn next_jackpot(ref self: T, factory_id: u32);
    fn rescue_jackpot(ref self: T, jackpot_id: u32);
}


#[dojo::contract]
pub mod jackpot_actions {
    // use dojo::event::EventStorage;
    use dojo::world::IWorldDispatcherTrait;
    use nums::interfaces::erc20::{IERC20Dispatcher, IERC20DispatcherTrait};
    use nums::interfaces::nums::INumsTokenDispatcherTrait;
    use nums::models::jackpot::{
        JackpotFactoryImpl, JackpotFactoryTrait, JackpotImpl, JackpotMode, JackpotTrait, TimingMode,
    };
    use nums::token::TokenType;
    use nums::{StoreImpl, StoreTrait};
    use nums::constants::WORLD_RESOURCE;
    
    use super::*;

    // #[derive(Drop, Serde)]
    // #[dojo::event]
    // pub struct RewardClaimed {
    //     #[key]
    //     claim_id: u32,
    //     player: ContractAddress,
    //     amount: u64,
    // }

    fn dojo_init(self: @ContractState) {
        let mut world = self.world(@"nums");
        let mut store = StoreImpl::new(world);
        let jackpot_actions_addr = starknet::get_contract_address();

        // dojo_init is called by the world, we need to use starknet::get_tx_info() to retrieve
        // deployer account
        let deployer_account = starknet::get_tx_info().unbox().account_contract_address;

        // create a perpetual nums jackpot factory
        let params = CreateJackpotFactoryParams {
            name: "Perp Nums Jackpot",
            game_config: Option::None,
            rewards: Option::None,
            token: Option::None,
            mode: JackpotMode::ConditionalVictory,
            timing_mode: TimingMode::Perpetual,
            initial_duration: 0,
            extension_duration: 0,
            max_winners: 1,
            min_slots: 13, // TODO: set right figure
            jackpot_count: 0,
        };

        let mut factory = JackpotFactoryImpl::new(
            ref world, ref store, jackpot_actions_addr, deployer_account, params,
        );
        let mut jackpot = factory.create_jackpot(ref world, ref store);

        store.set_jackpot_factory(@factory);
        store.set_jackpot(@jackpot);
    }

    #[abi(embed_v0)]
    impl JackpotActions of IJackpotActions<ContractState> {
        fn create_jackpot_factory(ref self: ContractState, params: CreateJackpotFactoryParams) {
            let mut world = self.world(@"nums");

            // only world owner can create
            let creator = starknet::get_caller_address();
            assert!(world.dispatcher.is_owner(WORLD_RESOURCE, creator), "Unauthorized caller");

            let mut store = StoreImpl::new(world);
            let creator = starknet::get_caller_address();
            let jackpot_actions_addr = starknet::get_contract_address();

            // create factory & transfer rewards to this contract
            let mut factory = JackpotFactoryImpl::new(
                ref world, ref store, jackpot_actions_addr, creator, params,
            );
            let mut jackpot = factory.create_jackpot(ref world, ref store);

            store.set_jackpot_factory(@factory);
            store.set_jackpot(@jackpot);
        }

        fn next_jackpot(ref self: ContractState, factory_id: u32) {
            let mut world = self.world(@"nums");
            let mut store = StoreImpl::new(world);
            let mut factory = store.jackpot_factory(factory_id);

            let can_create = factory.can_create_jackpot(ref store);
            assert!(can_create, "cannot create jackpot");

            factory.create_jackpot(ref world, ref store);
        }


        fn claim_jackpot(ref self: ContractState, jackpot_id: u32, indexes: Array<u8>) {
            let mut world = self.world(@"nums");
            let mut store = StoreImpl::new(world);
            let player = starknet::get_caller_address();

            let mut jackpot = store.jackpot(jackpot_id);
            assert!(jackpot.has_ended(ref store), "jackpot has not ended");

            let has_claimed = jackpot.claim(ref store, indexes, player);
            assert!(has_claimed, "nothing to claim");
        }

        fn rescue_jackpot(ref self: ContractState, jackpot_id: u32) {
            let mut world = self.world(@"nums");
            let mut store = StoreImpl::new(world);
            let caller = starknet::get_caller_address();

            let mut jackpot = store.jackpot(jackpot_id);
            let factory = store.jackpot_factory(jackpot.factory_id);

            assert!(!jackpot.rescued, "jackpot already rescued");
            assert!(jackpot.has_ended(ref store), "jackpot has not ended");
            assert!(jackpot.total_winners == 0, "jackpot has winner");
            assert!(factory.creator == caller, "caller is not creator");

            jackpot.rescued = true;
            store.set_jackpot(@jackpot);

            // burn nums
            store.nums_disp().burn(jackpot.nums_balance);

            // rescue token
            if let Option::Some(token) = @jackpot.token {
                match token.ty {
                    TokenType::ERC20(config) => {
                        // transfer from jackpot_actions_addr to caller
                        IERC20Dispatcher { contract_address: *token.address }
                            .transfer(caller, *config.amount);
                    },
                    TokenType::ERC721(_config) => { panic!("ERC721 not handled yet"); },
                    TokenType::ERC1155(_config) => { panic!("ERC1155 not handled yet"); },
                }
            }
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
    pub impl InternalImpl of InternalTrait {}
}

