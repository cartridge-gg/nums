use starknet::ContractAddress;

#[starknet::interface]
pub trait IFaucet<TContractState> {
    fn mint(ref self: TContractState, recipient: ContractAddress, amount: u256);
    fn burn(ref self: TContractState, amount: u256);
}

pub fn NAME() -> ByteArray {
    "Faucet"
}

#[dojo::contract]
mod Faucet {
    use dojo::world::IWorldDispatcherTrait;
    use openzeppelin::token::erc20::{DefaultConfig, ERC20Component};
    use starknet::{ContractAddress, get_caller_address};
    use crate::constants::NAMESPACE;
    use crate::interfaces::erc20::IERC20Metadata;

    component!(path: ERC20Component, storage: erc20, event: ERC20Event);

    #[abi(embed_v0)]
    impl ERC20Impl = ERC20Component::ERC20Impl<ContractState>;
    #[abi(embed_v0)]
    impl ERC20CamelOnlyImpl = ERC20Component::ERC20CamelOnlyImpl<ContractState>;
    impl ERC20InternalImpl = ERC20Component::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc20: ERC20Component::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC20Event: ERC20Component::Event,
    }


    fn dojo_init(ref self: ContractState, initial_supply: u128, recipient: ContractAddress) {
        // [Effect] Initialize ERC20
        self.erc20.initializer("USDC (Circle)", "USDC");
        // [Effect] Mint initial supply
        self.erc20.mint(recipient, initial_supply.into());
        // [Event] Emit a new registered contract for torii to index
        let this = starknet::get_contract_address();
        let instance_name: felt252 = this.into();
        let world = self.world(@NAMESPACE());
        world
            .dispatcher
            .register_external_contract(
                namespace: NAMESPACE(),
                contract_name: "ERC20",
                instance_name: format!("{}", instance_name),
                contract_address: this,
                block_number: 1,
            )
    }

    #[abi(embed_v0)]
    impl ERC20Metadata<ContractState> of IERC20Metadata<ContractState> {
        // IERC20Metadata
        fn name(self: @ContractState) -> felt252 {
            'USDC (Circle)'
        }

        fn symbol(self: @ContractState) -> felt252 {
            'USDC'
        }

        fn decimals(self: @ContractState) -> u8 {
            6
        }
    }

    impl ERC20HooksImpl of ERC20Component::ERC20HooksTrait<ContractState> {}

    //
    // Internal
    //

    #[abi(embed_v0)]
    impl FaucetImpl of super::IFaucet<ContractState> {
        fn mint(ref self: ContractState, recipient: ContractAddress, amount: u256) {
            self.erc20.mint(recipient, amount);
        }

        fn burn(ref self: ContractState, amount: u256) {
            self.erc20.burn(get_caller_address(), amount);
        }
    }
}
