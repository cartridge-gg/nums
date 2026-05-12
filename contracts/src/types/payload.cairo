use starknet::ContractAddress;

mod Errors {
    pub const INVALID_PAYLOAD: felt252 = 'Invalid payload';
}

#[derive(Drop, Copy, Serde)]
pub struct Payload {
    pub player: ContractAddress,
    pub game_id: u64,
    pub multiplier: u128,
    pub supply: u256,
    pub price: u256,
    pub level: u8,
    pub reward: u128,
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
    fn from(ref span: Span<felt252>) -> Payload {
        Serde::deserialize(ref span).expect(Errors::INVALID_PAYLOAD)
    }

    #[inline]
    fn span(self: @Payload) -> Span<felt252> {
        let mut output: Array<felt252> = array![];
        Serde::serialize(self, ref output);
        output.span()
    }
}
