// Imports

use core::num::traits::Pow;

pub const A: u256 = 30_621_127_039_030_380_000;
pub const B: u256 = 3_363_332_834_583_166_000;
pub const K: u32 = 10;
pub const MIN_REWARD: u64 = 3;

/// Helper function to calculate the reward amount.
///
/// # Arguments
///
/// * `level` - The level of the reward.
/// * `slot_count` - The number of slots in the game.
/// * `supply` - The current supply of the game.
/// * `target` - The target supply of the game.
#[generate_trait]
pub impl Rewarder of RewarderTrait {
    #[inline]
    fn amount(
        score_num: u256, score_den: u256, slot_count: u256, supply: u256, target: u256,
    ) -> u64 {
        // [Check] Manage the specific case where the supply is twice the target
        if supply > target * 2 {
            return 0;
        }
        // [Compute] Otherwise, calculate the reward amount
        let num: u256 = A * (2 * target - supply);
        let den_lhs: u256 = target * (slot_count + B).pow(K);
        let den_rhs = target * score_num.pow(K) / score_den.pow(K);
        let den = den_lhs - den_rhs;
        (num / den - num / den_lhs).try_into().unwrap() + MIN_REWARD
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const TARGET_SUPPLY: u256 = 100_000_000_000_000_000_000_000_000;
    const SLOT_COUNT: u256 = 20;

    #[test]
    fn test_reward_score_20_at_target() {
        let reward = Rewarder::amount(20, 1, SLOT_COUNT, TARGET_SUPPLY, TARGET_SUPPLY);
        assert_eq!(reward, 41_479);
    }

    #[test]
    fn test_reward_score_20_below_target() {
        let reward = Rewarder::amount(20, 1, SLOT_COUNT, TARGET_SUPPLY / 2, TARGET_SUPPLY);
        assert_eq!(reward, 62_219);
    }

    #[test]
    fn test_reward_score_20_over_target() {
        let reward = Rewarder::amount(20, 1, SLOT_COUNT, TARGET_SUPPLY * 3 / 2, TARGET_SUPPLY);
        assert_eq!(reward, 20_740);
    }
}
