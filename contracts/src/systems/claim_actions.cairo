use starknet::ContractAddress;

#[starknet::interface]
pub trait IClaimActions<T> {
    fn claim_from_forwarder(ref self: T, recipient: ContractAddress, leaf_data: Span<felt252>);
}

#[derive(Drop, Copy, Clone, Serde, PartialEq)]
pub struct LeafData {
    pub amount: u64,
}

#[dojo::contract]
mod claim_actions {
    use dojo::world::WorldStorageTrait;
    use nums::interfaces::nums::{INumsTokenDispatcher, INumsTokenDispatcherTrait};
    use nums::constants::ZERO_ADDRESS;
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
    use super::*;

    #[storage]
    struct Storage {
        nums_address: ContractAddress,
        forwarder_address: ContractAddress,
        claimable_until: u64,
    }

    fn dojo_init(
        ref self: ContractState,
        nums_address: Option<ContractAddress>,
        forwarder_address: Option<ContractAddress>,
        claimable_until: u64,
    ) {
        let mut world = self.world(@"nums");

        let nums_address = if let Option::Some(address) = nums_address {
            address
        } else {
            world.dns_address(@"MockNumsToken").expect('MockNumsToken not found!')
        };

        let forwarder_address = if let Option::Some(address) = forwarder_address {
            address
        } else {
            ZERO_ADDRESS
        };

        self.nums_address.write(nums_address);
        self.forwarder_address.write(forwarder_address);
        self.claimable_until.write(claimable_until);
    }

    #[abi(embed_v0)]
    impl ClaimImpl of IClaimActions<ContractState> {
        fn claim_from_forwarder(
            ref self: ContractState, recipient: ContractAddress, leaf_data: Span<felt252>,
        ) {
            // MUST check caller is forwarder
            self.assert_caller_is_forwarder();

            let claimable_until = self.claimable_until.read();
            let now = starknet::get_block_timestamp();
            assert!(now < claimable_until, "claim period has ended");

            // deserialize leaf_data
            let mut leaf_data = leaf_data;
            let data = Serde::<LeafData>::deserialize(ref leaf_data).unwrap();

            // mint nums
            INumsTokenDispatcher { contract_address: self.nums_address.read() }
                .reward(recipient, data.amount);
        }
    }


    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn assert_caller_is_forwarder(self: @ContractState) {
            let caller = starknet::get_caller_address();
            let forwarder_address = self.forwarder_address.read();
            assert!(caller == forwarder_address, "caller is not forwarder");
        }
    }
}
