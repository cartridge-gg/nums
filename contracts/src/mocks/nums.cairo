// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts for Cairo ^1.0.0

#[starknet::interface]
pub trait IERC20Metadata<TState> {
    /// Returns the name of the token.
    fn name(self: @TState) -> felt252;

    /// Returns the symbol of the token.
    fn symbol(self: @TState) -> felt252;

    /// Returns the number of decimals used to get its user representation.
    fn decimals(self: @TState) -> u8;
}

pub fn NAME() -> ByteArray {
    "MockNumsToken"
}

const MINTER_ROLE: felt252 = selector!("MINTER_ROLE");

#[dojo::contract]
mod MockNumsToken {
    use dojo::world::WorldStorageTrait;
    use openzeppelin::access::accesscontrol::{AccessControlComponent, DEFAULT_ADMIN_ROLE};
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::token::erc20::{ERC20Component, ERC20HooksEmptyImpl};
    use starknet::{ContractAddress, get_caller_address};
    use crate::constants::{NAMESPACE, TEN_POW_18};
    use crate::systems::play::NAME as PLAY_NAME;
    use super::MINTER_ROLE;

    component!(path: ERC20Component, storage: erc20, event: ERC20Event);
    component!(path: AccessControlComponent, storage: accesscontrol, event: AccessControlEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);

    // External
    #[abi(embed_v0)]
    impl AccessControlImpl =
        AccessControlComponent::AccessControlImpl<ContractState>;

    // Internal
    #[abi(embed_v0)]
    impl ERC20Impl = ERC20Component::ERC20Impl<ContractState>;
    impl ERC20InternalImpl = ERC20Component::InternalImpl<ContractState>;
    impl AccessControlInternalImpl = AccessControlComponent::InternalImpl<ContractState>;

    impl ERC20ImmutableConfig of ERC20Component::ImmutableConfig {
        const DECIMALS: u8 = 18;
    }

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


    fn dojo_init(ref self: ContractState) {
        self.erc20.initializer("Mock NUMS", "mNUMS");

        let mut world = self.world(@NAMESPACE());
        let play_address = world.dns_address(@PLAY_NAME()).expect('Game contract not found!');

        // dojo_init is called by the world, we need to use starknet::get_tx_info() to retrieve
        // deployer account
        let deployer_account = starknet::get_tx_info().unbox().account_contract_address;

        self.accesscontrol.initializer();

        self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, deployer_account);
        self.accesscontrol._grant_role(MINTER_ROLE, play_address);
    }

    #[abi(embed_v0)]
    impl ERC20Metadata<ContractState> of super::IERC20Metadata<ContractState> {
        // IERC20Metadata
        fn name(self: @ContractState) -> felt252 {
            'Mock NUMS'
        }

        fn symbol(self: @ContractState) -> felt252 {
            'mNUMS'
        }

        fn decimals(self: @ContractState) -> u8 {
            18
        }
    }

    #[generate_trait]
    #[abi(per_item)]
    impl ExternalImpl of ExternalTrait {
        #[external(v0)]
        fn reward(ref self: ContractState, recipient: ContractAddress, amount: u64) -> bool {
            self.accesscontrol.assert_only_role(MINTER_ROLE);

            self.erc20.mint(recipient, amount.into() * TEN_POW_18.into());
            true
        }


        #[external(v0)]
        fn mint(ref self: ContractState, recipient: ContractAddress, amount: u256) {
            self.erc20.mint(recipient, amount);
        }

        #[external(v0)]
        fn burn(ref self: ContractState, amount: u256) {
            self.erc20.burn(get_caller_address(), amount)
        }
    }
}
