#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct Purchased {
    #[key]
    pub player_id: felt252,
    pub starterpack_id: u32,
    pub quantity: u32,
    pub multiplier: u128,
    pub time: u64,
    pub price: u256,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct Started {
    #[key]
    pub player_id: felt252,
    #[key]
    pub game_id: u64,
    pub multiplier: u128,
    pub time: u64,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct Claimed {
    #[key]
    pub player_id: felt252,
    #[key]
    pub game_id: u64,
    pub reward: u128,
    pub time: u64,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct Voucher {
    #[key]
    pub player: starknet::ContractAddress,
    #[key]
    pub time: u64,
    pub multiplier: Option<u128>,
    pub supply: Option<u256>,
    pub price: Option<u256>,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct Payload {
    #[key]
    pub game_id: u64,
    #[key]
    pub player: starknet::ContractAddress,
    pub multiplier: u128,
    pub supply: u256,
    pub price: u256,
    pub level: u8,
    pub reward: u128,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct VaultPaid {
    #[key]
    pub player_id: felt252,
    pub amount: u256,
    pub time: u64,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct VaultClaimed {
    #[key]
    pub user: felt252,
    pub amount: u256,
    pub time: u64,
}
