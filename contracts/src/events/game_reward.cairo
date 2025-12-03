pub use crate::events::index::GameReward;

#[generate_trait]
pub impl GameRewardImpl of GameRewardTrait {
    fn new(game_id: u64, reward: u64) -> GameReward {
        GameReward { game_id: game_id, reward: reward }
    }
}
