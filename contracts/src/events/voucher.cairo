use starknet::ContractAddress;
pub use crate::events::index::Voucher;

pub mod errors {
    pub const INVALID_SERIALIZED: felt252 = 'Voucher: invalid serialized';
}

#[generate_trait]
pub impl VoucherImpl of VoucherTrait {
    #[inline]
    fn new(
        player: ContractAddress,
        multiplier: Option<u128>,
        supply: Option<u256>,
        price: Option<u256>,
    ) -> Voucher {
        let time = starknet::get_block_timestamp();
        Voucher { player, time, multiplier, supply, price }
    }

    #[inline]
    fn from(ref serialized: Span<felt252>) -> Voucher {
        Serde::deserialize(ref serialized).expect(errors::INVALID_SERIALIZED)
    }

    #[inline]
    fn span(self: @Voucher) -> Span<felt252> {
        let mut output: Array<felt252> = array![];
        Serde::serialize(self, ref output);
        output.span()
    }
}
