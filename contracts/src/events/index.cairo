#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct GameReward {
    #[key]
    pub game_id: u64,
    pub reward: u64,
}
