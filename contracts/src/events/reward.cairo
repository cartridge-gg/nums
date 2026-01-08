pub use crate::events::index::Reward;

#[generate_trait]
pub impl RewardImpl of GameRewardTrait {
    fn new(game_id: u64, reward: u64) -> Reward {
        Reward { game_id: game_id, reward: reward }
    }
}
