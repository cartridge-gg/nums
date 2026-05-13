use starknet::ContractAddress;
pub use crate::events::index::Payload;

pub mod errors {
    pub const INVALID_SERIALIZED: felt252 = 'Payload: invalid serialized';
}

#[generate_trait]
pub impl PayloadImpl of PayloadTrait {
    #[inline]
    fn new(
        player: ContractAddress,
        game_id: u64,
        multiplier: u128,
        supply: u256,
        price: u256,
        level: u8,
        reward: u128,
    ) -> Payload {
        Payload { player, game_id, multiplier, supply, price, level, reward }
    }

    #[inline]
    fn from(ref serialized: Span<felt252>) -> Payload {
        Serde::deserialize(ref serialized).expect(errors::INVALID_SERIALIZED)
    }

    #[inline]
    fn span(self: @Payload) -> Span<felt252> {
        let mut output: Array<felt252> = array![];
        Serde::serialize(self, ref output);
        output.span()
    }
}
