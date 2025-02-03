use starknet::ContractAddress;

// Can be removed, used for testing
#[derive(Drop, Serde)]
#[dojo::model]
pub struct Message {
    #[key]
    pub player: ContractAddress,
    #[key]
    pub hash: felt252,
    pub destination: Destination,
}

#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
pub enum Destination {
    APPCHAIN,
    STARKNET,
}
