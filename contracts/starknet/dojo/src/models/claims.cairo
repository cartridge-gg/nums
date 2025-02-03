#[derive(Drop, Serde)]
#[dojo::model]
pub struct RewardClaims {
    #[key]
    pub game_id: u32,
    pub amount: u32,
}
