// SPDX-License-Identifier: MITuse use crate::interfaces::erc20::IERC20Dispatcher;
// Compatible with OpenZeppelin Contracts for Cairo ^1.0.0

use starknet::ContractAddress;

#[starknet::interface]
pub trait IToken<TContractState> {
    fn reward(ref self: TContractState, recipient: ContractAddress, amount: u64) -> bool;
    fn mint(ref self: TContractState, recipient: ContractAddress, amount: u256);
    fn burn(ref self: TContractState, amount: u256);
    fn withdraw(ref self: TContractState, token_address: ContractAddress);
}

pub fn NAME() -> ByteArray {
    "Token"
}

const TREASURY_FEE: u64 = 25; // 25%
const WITHDRAWER_ROLE: felt252 = selector!("WITHDRAWER_ROLE");
const MINTER_ROLE: felt252 = selector!("MINTER_ROLE");

#[dojo::contract]
mod Token {
    use dojo::world::WorldStorageTrait;
    use openzeppelin::access::accesscontrol::{AccessControlComponent, DEFAULT_ADMIN_ROLE};
    use openzeppelin::governance::votes::VotesComponent;
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::token::erc20::{DefaultConfig, ERC20Component};
    use openzeppelin::utils::contract_clock::timestamp::ERC6372TimestampClock;
    use openzeppelin::utils::cryptography::nonces::NoncesComponent;
    use openzeppelin::utils::cryptography::snip12::SNIP12Metadata;
    use starknet::{ContractAddress, get_caller_address};
    use crate::constants::{NAMESPACE, TEN_POW_18};
    use crate::interfaces::erc20::{IERC20Dispatcher, IERC20DispatcherTrait, IERC20Metadata};
    use crate::systems::play::NAME as PLAY_NAME;
    use crate::systems::vault::{IVaultDispatcher, IVaultDispatcherTrait, NAME as VAULT};
    use super::{MINTER_ROLE, WITHDRAWER_ROLE};

    component!(path: ERC20Component, storage: erc20, event: ERC20Event);
    component!(path: AccessControlComponent, storage: accesscontrol, event: AccessControlEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: VotesComponent, storage: erc20_votes, event: ERC20VotesEvent);
    component!(path: NoncesComponent, storage: nonces, event: NoncesEvent);

    // External
    #[abi(embed_v0)]
    impl AccessControlImpl =
        AccessControlComponent::AccessControlImpl<ContractState>;

    // Nonces
    #[abi(embed_v0)]
    impl NoncesImpl = NoncesComponent::NoncesImpl<ContractState>;

    // Votes
    #[abi(embed_v0)]
    impl VotesImpl = VotesComponent::VotesImpl<ContractState>;
    impl VotesInternalImpl = VotesComponent::InternalImpl<ContractState>;

    // Internal
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
        #[substorage(v0)]
        erc20_votes: VotesComponent::Storage,
        #[substorage(v0)]
        nonces: NoncesComponent::Storage,
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
        #[flat]
        ERC20VotesEvent: VotesComponent::Event,
        #[flat]
        NoncesEvent: NoncesComponent::Event,
    }


    fn dojo_init(ref self: ContractState, initial_supply: u128) {
        // [Effect] Initialize ERC20
        self.erc20.initializer("Nums", "NUMS");
        // [Effect] Initialize Access Control
        let world = self.world(@NAMESPACE());
        let play_address = world.dns_address(@PLAY_NAME()).expect('Game contract not found!');
        let deployer_account = starknet::get_tx_info().unbox().account_contract_address;
        self.accesscontrol.initializer();
        self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, deployer_account);
        self.accesscontrol._grant_role(MINTER_ROLE, play_address);
        // [Effect] Mint 1 share unit to the deployer account
        self.erc20.mint(deployer_account, initial_supply.into());
    }

    pub impl SNIP12MetadataImpl of SNIP12Metadata {
        fn name() -> felt252 {
            'Nums'
        }
        fn version() -> felt252 {
            '1.0.0'
        }
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

    //
    // Internal
    //

    impl ERC20VotesImpl of VotesComponent::VotingUnitsTrait<ContractState> {
        /// Returns the number of voting units for a given account.
        ///
        /// This implementation is specific to ERC20 tokens, where the balance
        /// of tokens directly represents the number of voting units.
        ///
        /// NOTE: This implementation will work out of the box if the ERC20 component
        /// is implemented in the final contract.
        ///
        /// WARNING: This implementation assumes tokens map to voting units 1:1.
        /// Any deviation from this formula when transferring voting units (e.g. by using hooks)
        /// may compromise the internal vote accounting.
        fn get_voting_units(self: @ContractState, account: ContractAddress) -> u256 {
            let world = self.world(@NAMESPACE());
            let vault_address = world.dns_address(@VAULT()).expect('Vault contract not found!');
            let vault = IVaultDispatcher { contract_address: vault_address };
            self.erc20.balance_of(account) + vault.staked_of(account)
        }
    }

    // We need to call the `transfer_voting_units` function after
    // every mint, burn and transfer.
    // For this, we use the `after_update` hook of the `ERC20Component::ERC20HooksTrait`.
    impl ERC20VotesHooksImpl of ERC20Component::ERC20HooksTrait<ContractState> {
        fn after_update(
            ref self: ERC20Component::ComponentState<ContractState>,
            from: ContractAddress,
            recipient: ContractAddress,
            amount: u256,
        ) {
            let mut contract_state = self.get_contract_mut();
            contract_state.erc20_votes.transfer_voting_units(from, recipient, amount);
        }
    }

    #[abi(embed_v0)]
    impl TokenImpl of super::IToken<ContractState> {
        fn reward(ref self: ContractState, recipient: ContractAddress, amount: u64) -> bool {
            self.accesscontrol.assert_only_role(MINTER_ROLE);
            // [Effect] Reward minted to the recipient
            self.erc20.mint(recipient, amount.into() * TEN_POW_18.into());
            // [Return] Success
            true
        }

        fn mint(ref self: ContractState, recipient: ContractAddress, amount: u256) {
            self.erc20.mint(recipient, amount);
        }

        fn burn(ref self: ContractState, amount: u256) {
            // [Effect] Burn tokens from the caller
            self.erc20.burn(get_caller_address(), amount);
        }

        fn withdraw(ref self: ContractState, token_address: ContractAddress) {
            self.accesscontrol.assert_only_role(WITHDRAWER_ROLE);
            let token = IERC20Dispatcher { contract_address: token_address };
            let balance = token.balance_of(starknet::get_contract_address());
            token.transfer(get_caller_address(), balance);
        }
    }
}
