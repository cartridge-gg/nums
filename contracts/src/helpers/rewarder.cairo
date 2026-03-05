// Imports

use core::integer::u512_safe_div_rem_by_u256;
use core::num::traits::{Pow, WideMul};

pub const A: u256 = 3_062_112_703_903_038_000;
pub const B: u256 = 3;
pub const K: u32 = 10;
pub const MIN_REWARD: u64 = 1;

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
        let score_num_pow_k = score_num.pow(K);
        let score_den_pow_k = score_den.pow(K).try_into().expect('mul_div division by zero');
        let (den_rhs, _r) = u512_safe_div_rem_by_u256(
            target.wide_mul(score_num_pow_k), score_den_pow_k,
        );
        let den = den_lhs - den_rhs.try_into().expect('mul_div quotient > u256');
        (num / den - num / den_lhs).try_into().unwrap() + MIN_REWARD
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const TARGET_SUPPLY: u256 = 10_000_000_000_000_000_000_000_000;
    const SLOT_COUNT: u256 = 18;

    #[test]
    fn test_reward_score_20_at_target() {
        let reward = Rewarder::amount(18, 1, SLOT_COUNT, TARGET_SUPPLY, TARGET_SUPPLY);
        assert_eq!(reward, 50001);
    }

    #[test]
    fn test_reward_score_20_below_target() {
        let reward = Rewarder::amount(18, 1, SLOT_COUNT, TARGET_SUPPLY / 2, TARGET_SUPPLY);
        assert_eq!(reward, 75001);
    }

    #[test]
    fn test_reward_score_20_over_target() {
        let reward = Rewarder::amount(
            18000000, 1000000, SLOT_COUNT, TARGET_SUPPLY * 3 / 2, TARGET_SUPPLY,
        );
        assert_eq!(reward, 25001);
    }
}
