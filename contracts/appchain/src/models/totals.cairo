use starknet::ContractAddress;

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct Totals {
    #[key]
    pub player: ContractAddress,
    pub rewards_earned: u64,
    pub rewards_claimed: u64,
    pub games_played: u32,
    pub slots_filled: u32,
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct GlobalTotals {
    #[key]
    pub world_resource: felt252,
    pub games_played: u32,
}
