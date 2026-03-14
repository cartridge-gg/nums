// SPDX-License-Identifier: MITuse use crate::interfaces::erc20::IERC20Dispatcher;
// Compatible with OpenZeppelin Contracts for Cairo ^1.0.0

use starknet::ContractAddress;

#[starknet::interface]
pub trait IToken<TContractState> {
    fn reward(ref self: TContractState, recipient: ContractAddress, amount: u256) -> bool;
    fn burn(ref self: TContractState, amount: u256);
}

pub fn NAME() -> ByteArray {
    "Token"
}

const MINTER_ROLE: felt252 = selector!("MINTER_ROLE");

#[dojo::contract]
mod Token {
    use dojo::world::WorldStorageTrait;
    use openzeppelin::access::accesscontrol::{AccessControlComponent, DEFAULT_ADMIN_ROLE};
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::token::erc20::{DefaultConfig, ERC20Component};
    use starknet::{ContractAddress, get_caller_address};
    use crate::constants::NAMESPACE;
    use crate::interfaces::erc20::IERC20Metadata;
    use crate::systems::play::NAME as PLAY_NAME;
    use crate::systems::treasury::NAME as TREASURY;
    use super::MINTER_ROLE;

    component!(path: ERC20Component, storage: erc20, event: ERC20Event);
    component!(path: AccessControlComponent, storage: accesscontrol, event: AccessControlEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);

    #[abi(embed_v0)]
    impl AccessControlImpl =
        AccessControlComponent::AccessControlImpl<ContractState>;
    #[abi(embed_v0)]
    impl ERC20Impl = ERC20Component::ERC20Impl<ContractState>;
    #[abi(embed_v0)]
    impl ERC20CamelOnlyImpl = ERC20Component::ERC20CamelOnlyImpl<ContractState>;
    impl ERC20InternalImpl = ERC20Component::InternalImpl<ContractState>;
    impl AccessControlInternalImpl = AccessControlComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc20: ERC20Component::Storage,
        #[substorage(v0)]
        accesscontrol: AccessControlComponent::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC20Event: ERC20Component::Event,
        #[flat]
        AccessControlEvent: AccessControlComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
    }


    fn dojo_init(ref self: ContractState, initial_supply: u128, recipient: ContractAddress) {
        // [Effect] Initialize ERC20
        self.erc20.initializer("Nums", "NUMS");
        // [Effect] Initialize Access Control
        let world = self.world(@NAMESPACE());
        let treasury_address = world.dns_address(@TREASURY()).expect('Treasury not found!');
        self.accesscontrol.initializer();
        self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, treasury_address);
        let play_address = world.dns_address(@PLAY_NAME()).expect('Game contract not found!');
        self.accesscontrol._grant_role(MINTER_ROLE, play_address);
        // [Effect] Extra rights for test purpose
        let deployer_account = starknet::get_tx_info().unbox().account_contract_address;
        self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, deployer_account);
        // [Effect] Mint initial supply
        self.erc20.mint(recipient, initial_supply.into());
    }

    #[abi(embed_v0)]
    impl ERC20Metadata<ContractState> of IERC20Metadata<ContractState> {
        // IERC20Metadata
        fn name(self: @ContractState) -> felt252 {
            'Nums'
        }

        fn symbol(self: @ContractState) -> felt252 {
            'NUMS'
        }

        fn decimals(self: @ContractState) -> u8 {
            18
        }
    }

    impl ERC20HooksImpl of ERC20Component::ERC20HooksTrait<ContractState> {}

    //
    // Internal
    //

    #[abi(embed_v0)]
    impl TokenImpl of super::IToken<ContractState> {
        fn reward(ref self: ContractState, recipient: ContractAddress, amount: u256) -> bool {
            self.accesscontrol.assert_only_role(MINTER_ROLE);
            // [Effect] Reward minted to the recipient
            self.erc20.mint(recipient, amount);
            // [Return] Success
            true
        }

        fn burn(ref self: ContractState, amount: u256) {
            // [Effect] Burn tokens from the caller
            self.erc20.burn(get_caller_address(), amount);
        }
    }
}
