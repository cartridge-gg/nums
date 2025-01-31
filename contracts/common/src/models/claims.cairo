#[derive(Drop, Serde)]
#[dojo::model]
pub struct Claims {
    #[key]
    pub game_id: u32,
    pub ty: ClaimsType,
    pub block_number: u64, // to track proving progress from saya
    pub message_hash: felt252, // to track messages from appchain to starknet (piltover)
}

#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
pub struct TokenClaim {
    amount: u32,
}

#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
pub struct JackpotClaim {
    id: u32,
}

#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
pub enum ClaimsType {
    TOKEN: TokenClaim,
    JACKPOT: JackpotClaim,
}
