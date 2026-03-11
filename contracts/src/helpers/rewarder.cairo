// Imports

use core::num::traits::Pow;
use crate::constants::TEN_POW_10;

pub const A: u256 = 306_211_270_390_303_800;
pub const B: u256 = 3;
pub const K: u32 = 10;

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
        let target = target / TEN_POW_10.into();
        let supply = supply / TEN_POW_10.into();
        let num: u256 = A * (2 * target - supply);
        let den_lhs: u256 = target * (slot_count + B).pow(K);
        let den_rhs = target * score_num.pow(K) / score_den.pow(K);
        (num / (den_lhs - den_rhs) - num / den_lhs + score_num / score_den).try_into().unwrap()
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

    #[test]
    fn test_reward_case_001() {
        let supply = 1199801199778322845177093;
        let target = 1000000000000000000000000;
        let reward = Rewarder::amount(1200000, 100000, 18, supply, target);
        assert_eq!(reward, 66);
    }
}
