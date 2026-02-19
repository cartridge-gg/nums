#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct Purchase {
    #[key]
    pub player_id: felt252,
    pub starterpack_id: u32,
    pub quantity: u32,
    pub multiplier: u8,
    pub time: u64,
}
