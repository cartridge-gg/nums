// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts for Cairo ^1.0.0

#[dojo::contract]
mod MockNumsToken {
    use core::num::traits::Pow;
    use dojo::world::WorldStorageTrait;
    use openzeppelin::token::erc20::{ERC20Component, ERC20HooksEmptyImpl};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
    use starknet::{ContractAddress, get_caller_address};

    component!(path: ERC20Component, storage: erc20, event: ERC20Event);

    // External
    #[abi(embed_v0)]
    impl ERC20MixinImpl = ERC20Component::ERC20MixinImpl<ContractState>;

    // Internal
    impl ERC20InternalImpl = ERC20Component::InternalImpl<ContractState>;

    impl ERC20ImmutableConfig of ERC20Component::ImmutableConfig {
        const DECIMALS: u8 = 18;
    }

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc20: ERC20Component::Storage,
        // total_supply: u256,
        rewards_caller: ContractAddress,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC20Event: ERC20Component::Event,
    }

    const DECIMALS: u256 = 10_u256.pow(18);


    fn dojo_init(ref self: ContractState) {
        self.erc20.initializer("Mock NUMS", "mNUMS");

        let mut world = self.world(@"nums");
        let rewards_caller = world.dns_address(@"claim_actions").expect('claim_actions not found!');

        self.rewards_caller.write(rewards_caller);
    }

    #[generate_trait]
    #[abi(per_item)]
    impl ExternalImpl of ExternalTrait {
        #[external(v0)]
        fn reward(ref self: ContractState, recipient: ContractAddress, amount: u64) -> bool {
            assert!(
                self.rewards_caller.read() == get_caller_address(),
                "Only the reward caller can mint tokens",
            );
            self.erc20.mint(recipient, amount.into() * DECIMALS);
            true
        }


        #[external(v0)]
        fn mint(ref self: ContractState, recipient: ContractAddress, amount: u256) {
            self.erc20.mint(recipient, amount);
        }
    }
}
