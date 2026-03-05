use starknet::ContractAddress;

#[derive(Drop, Serde)]
#[dojo::model]
pub struct Config {
    #[key]
    pub world_resource: felt252,
    pub nums: ContractAddress,
    pub vrf: ContractAddress,
    pub starterpack: ContractAddress,
    pub vault: ContractAddress,
    pub owner: ContractAddress,
    pub quote: ContractAddress,
    pub ekubo: ContractAddress,
    pub target_supply: u256,
    pub count: u32,
    pub burn_percentage: u8,
    pub slot_count: u8,
    pub slot_min: u16,
    pub slot_max: u16,
    pub average_weigth: u16,
    pub average_score: u32,
    pub last_updated: u64,
    pub pool_fee: u128,
    pub pool_tick_spacing: u128,
    pub pool_extension: ContractAddress,
    pub base_price: u256,
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
    pub multiplier: u8,
}

#[derive(Copy, Drop, Serde, IntrospectPacked)]
#[dojo::model]
pub struct Game {
    #[key]
    pub id: u64,
    pub claimed: bool,
    pub multiplier: u16,
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

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct VaultInfo {
    #[key]
    pub world_resource: felt252,
    pub open: bool,
    pub total_reward: u256,
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct VaultPosition {
    #[key]
    pub user: felt252,
    pub time_lock: u64,
    pub current_reward: u256,
    pub pending_reward: u256,
}
