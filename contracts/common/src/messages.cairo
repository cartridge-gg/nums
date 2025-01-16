use nums_common::models::challenge::ChallengeMode;
use starknet::ContractAddress;

#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
pub struct ChallengeMessage {
    pub id: u32,
    pub expiration: u64,
    pub mode: ChallengeMode,
}

#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
pub struct ConfigMessage {}

#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
pub struct AppChain {
    pub message_contract: ContractAddress,
    pub to_address: ContractAddress,
    pub to_selector: felt252,
}