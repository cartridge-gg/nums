#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct Reward {
    #[key]
    pub game_id: u64,
    pub reward: u64,
}
