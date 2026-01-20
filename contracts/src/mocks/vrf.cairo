pub fn NAME() -> ByteArray {
    "Vrf"
}

#[dojo::contract]
mod Vrf {
    use starknet::ContractAddress;
    use crate::helpers::random::RandomImpl;
    use crate::interfaces::vrf::Source;

    #[generate_trait]
    #[abi(per_item)]
    impl ExternalImpl of ExternalTrait {
        #[external(v0)]
        fn request_random(ref self: ContractState, caller: ContractAddress, source: Source) {}

        #[external(v0)]
        fn consume_random(ref self: ContractState, source: Source) -> felt252 {
            starknet::get_tx_info().unbox().transaction_hash
        }

        #[external(v0)]
        fn assert_consumed(ref self: ContractState, source: Source) {}
    }
}
