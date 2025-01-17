use starknet::ContractAddress;

#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
pub struct AppChain {
    pub message_contract: ContractAddress,
    pub to_address: ContractAddress,
    pub to_selector: felt252,
}