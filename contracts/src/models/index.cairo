use starknet::ContractAddress;

#[derive(Drop, Serde)]
#[dojo::model]
pub struct Config {
    #[key]
    pub world_resource: felt252,
    pub nums: ContractAddress,
    pub vrf: ContractAddress,
    pub starterpack: ContractAddress,
    pub forwarder: ContractAddress,
    pub owner: ContractAddress,
    pub entry_price: u128,
    pub target_supply: u256,
    pub count: u32,
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

#[derive(Drop, Serde, IntrospectPacked)]
#[dojo::model]
pub struct Merkledrop {
    #[key]
    pub id: felt252,
    pub active: bool,
    pub end: u64,
}

#[derive(Copy, Drop, Serde, IntrospectPacked)]
#[dojo::model]
pub struct Game {
    #[key]
    pub id: u64,
    pub over: bool,
    pub claimed: bool,
    pub level: u8,
    pub slot_count: u8,
    pub slot_min: u16,
    pub slot_max: u16,
    pub number: u16,
    pub next_number: u16,
    pub tournament_id: u16,
    pub selected_powers: u16,
    pub available_powers: u16,
    pub reward: u32,
    pub score: u32,
    pub slots: felt252,
}

#[dojo::model]
#[derive(Drop, Serde, IntrospectPacked)]
pub struct Tournament {
    #[key]
    pub id: u16,
    pub powers: u16,
    pub entry_count: u32,
    pub start_time: u64,
    pub end_time: u64,
    pub usage: felt252,
}

#[dojo::model]
#[derive(Drop, Serde)]
pub struct Leaderboard {
    #[key]
    pub tournament_id: u16,
    pub capacity: u32,
    pub requirement: u32,
    pub games: Array<u64>,
}

#[dojo::model]
#[derive(Drop, Serde, IntrospectPacked)]
pub struct Prize {
    #[key]
    pub tournament_id: u16,
    #[key]
    pub address: felt252,
    pub amount: u128,
}

#[dojo::model]
#[derive(Drop, Serde, IntrospectPacked)]
pub struct Reward {
    #[key]
    pub tournament_id: u16,
    #[key]
    pub address: felt252,
    #[key]
    pub game_id: u64,
    pub claimed: bool,
}

#[derive(Introspect, Drop, Serde)]
#[dojo::model]
pub struct Setting {
    #[key]
    pub id: u32,
    pub slot_count: u8,
    pub slot_min: u16,
    pub slot_max: u16,
    pub powers: u16,
    pub name: ByteArray,
    pub description: ByteArray,
    pub created_by: ContractAddress,
    pub created_at: u64,
}

#[derive(Introspect, Drop, Serde)]
#[dojo::model]
pub struct Usage {
    #[key]
    pub world_resource: felt252,
    pub last_update: u64,
    pub board: felt252,
}


#[derive(Introspect, Drop, Serde)]
#[dojo::model]
pub struct Claim {
    #[key]
    pub player: felt252,
    #[key]
    pub starterpack_id: u32,
    pub claimed: bool,
}

