// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts for Cairo ^1.0.0

#[dojo::contract]
mod MockRewardToken {
    use openzeppelin::token::erc20::{ERC20Component, ERC20HooksEmptyImpl};
    use starknet::ContractAddress;
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    component!(path: ERC20Component, storage: erc20, event: ERC20Event);

    // External
    #[abi(embed_v0)]
    impl ERC20Impl = ERC20Component::ERC20Impl<ContractState>;

    // Internal
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

    fn dojo_init(ref self: ContractState) {
        self.erc20.initializer("Mock REW", "mREW");
    }

    #[generate_trait]
    #[abi(per_item)]
    impl ExternalImpl of ExternalTrait {
        #[external(v0)]
        fn mint(ref self: ContractState, recipient: ContractAddress, amount: u256) {
            self.erc20.mint(recipient, amount);
        }

        #[external(v0)]
        fn name(self: @ContractState) -> felt252 {
            'Mock REW'
        }

        #[external(v0)]
        fn symbol(self: @ContractState) -> felt252 {
            'mREW'
        }

        #[external(v0)]
        fn decimals(self: @ContractState) -> u8 {
            18
        }
    }
}
