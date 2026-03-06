#[starknet::interface]
pub trait IFaucet<TContractState> {
    fn request(ref self: TContractState, amount: u256);
    fn withdraw(self: @TContractState);
}

pub fn NAME() -> ByteArray {
    "Faucet"
}

#[dojo::contract]
pub mod Faucet {
    use openzeppelin::interfaces::token::erc20::{IERC20Dispatcher, IERC20DispatcherTrait};
    use openzeppelin::token::erc20::DefaultConfig as ERC20DefaultConfig;
    use starknet::storage::{
        Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess,
        StoragePointerWriteAccess,
    };
    use starknet::{ContractAddress, get_block_timestamp, get_caller_address, get_contract_address};
    use super::IFaucet;

    const MINT_INTERVAL: u64 = 10 * 60; // 10 minutes

    #[storage]
    pub struct Storage {
        asset: IERC20Dispatcher,
        available: Map<ContractAddress, u64>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {}

    fn dojo_init(ref self: ContractState, asset_address: ContractAddress) {
        // [Effect] Initialize ERC20
        let asset = IERC20Dispatcher { contract_address: asset_address };
        self.asset.write(asset);
    }

    #[abi(embed_v0)]
    impl IFaucetImpl of IFaucet<ContractState> {
        fn request(ref self: ContractState, amount: u256) {
            // [Check] Check if the account has minted in the last MINT_INTERVAL
            let account = get_caller_address();
            let time = get_block_timestamp();
            let available = self.available.read(account);
            assert(time > available, 'Faucet: not available');
            // [Check] Balance
            let asset = self.asset.read();
            let balance = asset.balance_of(account);
            assert(balance >= amount, 'Faucet: insufficient balance');
            // [Effect] Update last minted time
            self.available.write(account, time + MINT_INTERVAL);
            // [Interaction] Mint the tokens
            asset.transfer(account, amount);
        }

        fn withdraw(self: @ContractState) {
            // [Effect] Withdraw the tokens
            let asset = self.asset.read();
            let caller = get_caller_address();
            let this = get_contract_address();
            asset.transfer(caller, asset.balance_of(this));
        }
    }
}
