#[dojo::contract]
mod MockVRF {
    use starknet::ContractAddress;

    use crate::interfaces::vrf::Source;
    use crate::random::RandomImpl;
    // fn dojo_init(ref self: ContractState) {}

    #[generate_trait]
    #[abi(per_item)]
    impl ExternalImpl of ExternalTrait {
        #[external(v0)]
        fn request_random(ref self: ContractState, caller: ContractAddress, source: Source) {}

        #[external(v0)]
        fn consume_random(ref self: ContractState, source: Source) -> felt252 {
            let mut random = RandomImpl::new();
            random.felt()
        }

        #[external(v0)]
        fn assert_consumed(ref self: ContractState, source: Source) {}
    }
}
