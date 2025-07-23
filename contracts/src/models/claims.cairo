use starknet::ContractAddress;

#[derive(Drop, Serde)]
#[dojo::model]
pub struct Claims {
    #[key]
    pub player: ContractAddress,
    #[key]
    pub claim_id: u32,
    pub ty: ClaimsType,
    pub claimed_on_starknet: bool,
    pub block_timestamp: u64, // for eta purposes
    pub block_number: u64, // to track proving progress from saya
    pub message_hash: felt252, // to track messages from appchain to starknet (piltover)
}

#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
pub struct TokenClaim {
    pub amount: u64,
}

#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
pub struct JackpotClaim {
    pub id: u32,
}

#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
pub enum ClaimsType {
    TOKEN: TokenClaim,
    JACKPOT: JackpotClaim,
}