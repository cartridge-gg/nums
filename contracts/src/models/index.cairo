use starknet::ContractAddress;

#[derive(Drop, Serde)]
#[dojo::model]
pub struct Config {
    #[key]
    pub world_resource: felt252,
    pub nums: ContractAddress,
    pub vrf: ContractAddress,
    pub starterpack: ContractAddress,
    pub owner: ContractAddress,
    pub entry_price: u128,
    pub target_supply: u256,
    pub count: u32,
    pub slot_count: u8,
    pub slot_min: u16,
    pub slot_max: u16,
}

#[derive(Drop, Serde, IntrospectPacked)]
#[dojo::model]
pub struct Starterpack {
    #[key]
    pub id: u32,
    pub reissuable: bool,
    pub referral_percentage: u8,
    pub price: u256,
    pub payment_token: ContractAddress,
}

#[derive(Copy, Drop, Serde, IntrospectPacked)]
#[dojo::model]
pub struct Game {
    #[key]
    pub id: u64,
    pub claimed: bool,
    pub multiplier: u8,
    pub level: u8,
    pub slot_count: u8,
    pub slot_min: u16,
    pub slot_max: u16,
    pub number: u16,
    pub next_number: u16,
    pub selectable_powers: u8,
    pub selected_powers: u16,
    pub enabled_powers: u16,
    pub disabled_traps: u32,
    pub reward: u64,
    pub over: u64,
    pub expiration: u64,
    pub traps: u128,
    pub slots: felt252,
    pub supply: felt252,
}
