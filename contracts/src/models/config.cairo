use starknet::ContractAddress;

#[derive(Drop, Serde)]
#[dojo::model]
pub struct Config {
    #[key]
    pub world_resource: felt252,
    pub nums_address: ContractAddress,
    pub vrf_address: ContractAddress,
    pub burn_pct: u8,
}

