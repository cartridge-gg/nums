use starknet::ContractAddress;

#[derive(Drop, Serde)]
#[dojo::model]
pub struct Config {
    #[key]
    pub world_resource: felt252,
    pub nums_address: ContractAddress,
    pub vrf_address: ContractAddress,
    pub owner: ContractAddress,
    pub burn_pct: u8,
}

#[derive(Copy, Drop, Serde, Introspect, DojoStore, PartialEq)]
pub struct GameConfig {
    pub max_slots: u8,
    pub max_number: u16,
    pub min_number: u16,
    pub entry_cost: u32,
    pub game_duration: u64,
}

#[derive(Copy, Drop, Serde, IntrospectPacked)]
#[dojo::model]
pub struct Game {
    #[key]
    pub game_id: u64,
    pub level: u8,
    pub next_number: u16,
    pub reward: u32,
    pub score: u32,
    pub jackpot_id: u32,
    pub expires_at: u64,
    pub over: bool,
    pub claimed: bool,
}

#[derive(Debug, Copy, Drop, Serde)]
#[dojo::model]
pub struct Slot {
    #[key]
    pub game_id: u64,
    #[key]
    pub index: u8,
    pub number: u16,
}

#[dojo::model]
#[derive(Drop, Serde, IntrospectPacked)]
pub struct Tournament {
    #[key]
    pub id: u64,
    pub entry_count: u32,
    pub start_time: u64,
    pub end_time: u64,
}

#[dojo::model]
#[derive(Drop, Serde)]
pub struct Leaderboard {
    #[key]
    pub tournament_id: u64,
    pub capacity: u32,
    pub requirement: u32,
    pub games: Array<u64>,
}

#[dojo::model]
#[derive(Drop, Serde, IntrospectPacked)]
pub struct Prize {
    #[key]
    pub tournament_id: u64,
    #[key]
    pub address: felt252,
    pub amount: u128,
}

#[dojo::model]
#[derive(Drop, Serde, IntrospectPacked)]
pub struct Reward {
    #[key]
    pub tournament_id: u64,
    #[key]
    pub address: felt252,
    #[key]
    pub game_id: u64,
    pub claimed: bool,
}

