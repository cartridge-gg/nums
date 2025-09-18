// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts for Cairo ^1.0.0

const MINTER_ROLE: felt252 = selector!("MINTER_ROLE");

#[dojo::contract]
mod MockNumsToken {
    use dojo::world::WorldStorageTrait;
    use nums::constants::TEN_POW_18;
    use openzeppelin::access::accesscontrol::{AccessControlComponent, DEFAULT_ADMIN_ROLE};
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::token::erc20::{ERC20Component, ERC20HooksEmptyImpl};
    use starknet::{ContractAddress, get_caller_address};
    use super::MINTER_ROLE;

    component!(path: ERC20Component, storage: erc20, event: ERC20Event);
    component!(path: AccessControlComponent, storage: accesscontrol, event: AccessControlEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);

    // External
    #[abi(embed_v0)]
    impl ERC20MixinImpl = ERC20Component::ERC20MixinImpl<ContractState>;
    #[abi(embed_v0)]
    impl AccessControlMixinImpl =
        AccessControlComponent::AccessControlMixinImpl<ContractState>;

    // Internal
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

        let mut world = self.world(@"nums");
        let game_actions = world.dns_address(@"game_actions").expect('game_actions not found!');
        let claim_actions = world.dns_address(@"claim_actions").expect('claim_actions not found!');

        // dojo_init is called by the world, we need to use starknet::get_tx_info() to retrieve
        // deployer account
        let deployer_account = starknet::get_tx_info().unbox().account_contract_address;

        self.accesscontrol.initializer();

        self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, deployer_account);
        self.accesscontrol._grant_role(MINTER_ROLE, game_actions);
        self.accesscontrol._grant_role(MINTER_ROLE, claim_actions);
    }

    #[generate_trait]
    #[abi(per_item)]
    impl ExternalImpl of ExternalTrait {
        #[external(v0)]
        fn reward(ref self: ContractState, recipient: ContractAddress, amount: u64) -> bool {
            self.accesscontrol.assert_only_role(MINTER_ROLE);

            self.erc20.mint(recipient, amount.into() * TEN_POW_18);
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
