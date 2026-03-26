use starknet::ContractAddress;

#[derive(Drop, Serde, IntrospectPacked)]
#[dojo::model]
pub struct Config {
    #[key]
    pub world_resource: felt252,
    pub vrf: ContractAddress,
    pub quote: ContractAddress,
    pub team_address: ContractAddress,
    pub ekubo_router: ContractAddress,
    pub ekubo_positions: ContractAddress,
    pub target_supply: u256,
    pub burn_percentage: u8,
    pub vault_percentage: u8,
    pub slot_count: u8,
    pub slot_min: u16,
    pub slot_max: u16,
    pub average_weigth: u16,
    pub average_score: u32,
    pub last_updated: u64,
    pub pool_fee: u128,
    pub pool_tick_spacing: u128,
    pub pool_extension: ContractAddress,
    pub pool_sqrt: u256,
    pub base_price: u256,
}

#[derive(Copy, Drop, Serde, IntrospectPacked)]
#[dojo::model]
pub struct Game {
    #[key]
    pub id: u64,
    pub claimed: bool, // 1 bit
    pub level: u8, // 5 bits
    pub slot_count: u8,
    pub slot_min: u16,
    pub slot_max: u16,
    pub number: u16, // 10 bits
    pub next_number: u16, // 10 bits
    pub selectable_powers: u8, // 3 * 1 bit
    pub selected_powers: u16, // 3 * 4 bits (could be 3 * 3 bits)
    pub enabled_powers: u16, // 3 * 1 bits
    pub disabled_traps: u32, // 18 * 1 bit
    pub over: u64,
    pub expiration: u64,
    pub traps: u128, // 18 * 3 bits
    pub multiplier: u128,
    pub reward: u128,
    pub slots: felt252, // 18 * 11 bits (counld be 18 * 10 bits)
    pub supply: felt252,
    pub price: felt252,
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct VaultInfo {
    #[key]
    pub world_resource: felt252,
    pub open: bool,
    pub total_reward: u256,
    pub fee: u16,
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
