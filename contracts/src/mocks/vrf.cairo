pub fn NAME() -> ByteArray {
    "Vrf"
}

#[dojo::contract]
mod Vrf {
    use cartridge_vrf::{PublicKey, Source};
    use stark_vrf::Proof;
    use starknet::ContractAddress;
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    #[storage]
    struct Storage {
        pubkey_x: felt252,
        pubkey_y: felt252,
        test_seed: felt252,
    }

    #[generate_trait]
    #[abi(per_item)]
    impl ExternalImpl of ExternalTrait {
        #[external(v0)]
        fn request_random(ref self: ContractState, caller: ContractAddress, source: Source) {}

        #[external(v0)]
        fn submit_random(ref self: ContractState, seed: felt252, proof: Proof) {}

        #[external(v0)]
        fn consume_random(ref self: ContractState, source: Source) -> felt252 {
            let override_seed = self.test_seed.read();
            if override_seed != 0 {
                override_seed
            } else {
                starknet::get_tx_info().unbox().transaction_hash
            }
        }

        #[external(v0)]
        fn assert_consumed(ref self: ContractState, seed: felt252) {}

        #[external(v0)]
        fn get_consume_count(self: @ContractState) -> u32 {
            0
        }

        #[external(v0)]
        fn is_vrf_call(self: @ContractState) -> bool {
            false
        }

        #[external(v0)]
        fn get_public_key(self: @ContractState) -> PublicKey {
            PublicKey { x: self.pubkey_x.read(), y: self.pubkey_y.read() }
        }

        #[external(v0)]
        fn set_public_key(ref self: ContractState, new_pubkey: PublicKey) {
            self.pubkey_x.write(new_pubkey.x);
            self.pubkey_y.write(new_pubkey.y);
        }

        #[external(v0)]
        fn set_test_seed(ref self: ContractState, seed: felt252) {
            self.test_seed.write(seed);
        }
    }
}
