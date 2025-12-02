pub use crate::models::index::Reward;

pub mod errors {
    pub const REWARD_ALREADY_CLAIMED: felt252 = 'Reward: already claimed';
}

#[generate_trait]
pub impl RewardImpl of RewardTrait {
    #[inline]
    fn new(tournament_id: u16, address: felt252, game_id: u64) -> Reward {
        // [Return] New reward
        Reward { tournament_id: tournament_id, address: address, game_id: game_id, claimed: true }
    }
}

#[generate_trait]
pub impl RewardAssert of AssertTrait {
    #[inline]
    fn assert_not_claimed(self: @Reward) {
        assert(!*self.claimed, errors::REWARD_ALREADY_CLAIMED);
    }
}
