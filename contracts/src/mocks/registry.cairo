pub fn NAME() -> ByteArray {
    "Registry"
}

#[dojo::contract]
mod Registry {
    use starknet::ContractAddress;
    use crate::interfaces::registry::IStarterpackRegistry;

    #[abi(embed_v0)]
    impl ExternalImpl of IStarterpackRegistry<ContractState> {
        fn register(
            ref self: ContractState,
            implementation: ContractAddress,
            referral_percentage: u8,
            reissuable: bool,
            price: u256,
            payment_token: ContractAddress,
            payment_receiver: Option<ContractAddress>,
            metadata: ByteArray,
        ) -> u32 {
            0
        }

        fn update(
            ref self: ContractState,
            starterpack_id: u32,
            implementation: ContractAddress,
            referral_percentage: u8,
            reissuable: bool,
            price: u256,
            payment_token: ContractAddress,
            payment_receiver: Option<ContractAddress>,
        ) {}

        fn update_metadata(ref self: ContractState, starterpack_id: u32, metadata: ByteArray) {}
    }
}
