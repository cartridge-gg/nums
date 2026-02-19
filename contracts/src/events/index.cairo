#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct Purchased {
    #[key]
    pub player_id: felt252,
    pub starterpack_id: u32,
    pub quantity: u32,
    pub multiplier: u8,
    pub time: u64,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct Started {
    #[key]
    pub player_id: felt252,
    #[key]
    pub game_id: u64,
    pub multiplier: u8,
    pub time: u64,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct Claimed {
    #[key]
    pub player_id: felt252,
    #[key]
    pub game_id: u64,
    pub reward: u64,
    pub time: u64,
}
