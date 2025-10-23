pub fn NAME() -> ByteArray {
    "MockStarterpack"
}

#[dojo::contract]
mod MockStarterpack {
    use starknet::ContractAddress;
    use crate::interfaces::starterpack::{IStarterpack, StarterPackMetadata};

    #[abi(embed_v0)]
    impl ExternalImpl of IStarterpack<ContractState> {
        fn register(
            ref self: ContractState,
            implementation: ContractAddress,
            referral_percentage: u8,
            reissuable: bool,
            price: u256,
            payment_token: ContractAddress,
            metadata: StarterPackMetadata,
        ) -> u32 {
            0
        }
    }
}
