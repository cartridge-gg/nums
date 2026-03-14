// Imports

use core::num::traits::Pow;
use crate::constants::TEN_POW_18;

pub const A: u256 = 306_211_270_390_303_800;
pub const B: u256 = 3;
pub const K: u32 = 10;
pub const PRECISION: u16 = 100;

/// Helper function to handle the reward calculation.
#[generate_trait]
pub impl Rewarder of RewarderTrait {
    /// Calculate the base reward for a given score.
    /// # Arguments
    /// * `score_num` - The numerator of the score fraction.
    /// * `score_den` - The denominator of the score fraction.
    /// * `slot_count` - The number of slots in the game.
    /// # Returns
    /// The reward base amount.
    #[inline]
    fn base(score_num: u256, score_den: u256, slot_count: u256) -> u256 {
        if score_den == 0 {
            return 0;
        }
        let den_lhs: u256 = (slot_count + B).pow(K);
        let den_rhs: u256 = score_num.pow(K) / score_den.pow(K);
        (A / (den_lhs - den_rhs) - A / den_lhs + score_num / score_den)
    }

    /// Calculate the supply multiplier for a given supply and target.
    /// # Arguments
    /// * `supply` - The current supply of the game.
    /// * `target` - The target supply of the game.
    /// # Returns
    /// The supply multiplier on a 100-based scale.
    #[inline]
    fn supply_multiplier(supply: u256, target: u256) -> u16 {
        if supply > target * 2 || target == 0 {
            return 0;
        }
        ((2 * target - supply) * PRECISION.into() / target).try_into().unwrap()
    }

    /// Calculate the burn multiplier for a given burn amount, score, and slot count.
    /// # Arguments
    /// * `burn` - The burn amount.
    /// * `score_num` - The numerator of the average score fraction.
    /// * `score_den` - The denominator of the average score fraction.
    /// * `slot_count` - The number of slots in the game.
    /// # Returns
    /// The burn multiplier on a 100-based scale.
    #[inline]
    fn burn_multiplier(burn: u256, score_num: u256, score_den: u256, slot_count: u256) -> u16 {
        let mint = Self::base(score_num, score_den, slot_count);
        if mint == 0 {
            return 0;
        }
        (burn * PRECISION.into() / (mint * TEN_POW_18.into())).try_into().unwrap()
    }

    /// Calculate the multiplier for a given supply, target, burn, score, and slot count.
    /// # Arguments
    /// * `supply` - The current supply of the game.
    /// * `target` - The target supply of the game.
    /// * `burn` - The burn amount.
    /// * `score_num` - The numerator of the score fraction.
    /// * `score_den` - The denominator of the score fraction.
    /// * `slot_count` - The number of slots in the game.
    /// # Returns
    /// The multiplier on a 100-based scale.
    #[inline]
    fn multiplier(
        supply: u256, target: u256, burn: u256, score_num: u256, score_den: u256, slot_count: u256,
    ) -> u16 {
        let supply_multiplier: u128 = Self::supply_multiplier(supply, target).into();
        let burn_multiplier: u128 = Self::burn_multiplier(burn, score_num, score_den, slot_count)
            .into();
        let multiplier: u128 = supply_multiplier * burn_multiplier / PRECISION.into();
        multiplier.try_into().unwrap()
    }

    /// Calculate the reward amount for a given score and multiplier.
    /// # Arguments
    /// * `score_num` - The numerator of the score fraction.
    /// * `score_den` - The denominator of the score fraction.
    /// * `slot_count` - The number of slots in the game.
    /// * `multiplier` - The multiplier for the reward.
    /// # Returns
    /// The reward amount.
    #[inline]
    fn amount(score_num: u256, score_den: u256, slot_count: u256, multiplier: u16) -> u64 {
        let base = Self::base(score_num, score_den, slot_count);
        let amount = base * multiplier.into() / PRECISION.into();
        amount.try_into().unwrap()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const BURN: u256 = 1000 * TEN_POW_18.into();
    const TARGET_SUPPLY: u256 = 1_000_000;
    const SLOT_COUNT: u256 = 18;

    #[test]
    fn test_rewarder_at_target_at_average() {
        let multiplier = Rewarder::multiplier(
            TARGET_SUPPLY, TARGET_SUPPLY, BURN, 12, 1, SLOT_COUNT,
        );
        let reward = Rewarder::amount(12, 1, SLOT_COUNT, multiplier);
        assert_eq!(reward.into(), BURN / TEN_POW_18.into());
    }

    #[test]
    fn test_rewarder_at_target_below_average() {
        let multiplier = Rewarder::multiplier(
            TARGET_SUPPLY, TARGET_SUPPLY, BURN, 12, 1, SLOT_COUNT,
        );
        let reward = Rewarder::amount(10, 1, SLOT_COUNT, multiplier);
        assert_lt!(reward.into(), BURN / TEN_POW_18.into());
    }

    #[test]
    fn test_rewarder_at_target_above_average() {
        let multiplier = Rewarder::multiplier(
            TARGET_SUPPLY, TARGET_SUPPLY, BURN, 12, 1, SLOT_COUNT,
        );
        let reward = Rewarder::amount(14, 1, SLOT_COUNT, multiplier);
        assert_gt!(reward.into(), BURN / TEN_POW_18.into());
    }

    #[test]
    fn test_rewarder_below_target_at_average() {
        let multiplier = Rewarder::multiplier(
            TARGET_SUPPLY / 2, TARGET_SUPPLY, BURN, 12, 1, SLOT_COUNT,
        );
        let reward = Rewarder::amount(12, 1, SLOT_COUNT, multiplier);
        assert_gt!(reward.into(), BURN / TEN_POW_18.into());
    }

    #[test]
    fn test_rewarder_above_target_at_average() {
        let multiplier = Rewarder::multiplier(
            TARGET_SUPPLY * 3 / 2, TARGET_SUPPLY, BURN, 12, 1, SLOT_COUNT,
        );
        let reward = Rewarder::amount(12, 1, SLOT_COUNT, multiplier);
        assert_lt!(reward.into(), BURN / TEN_POW_18.into());
    }

    #[test]
    fn test_rewarder_at_target_at_lowest() {
        let multiplier = Rewarder::multiplier(
            TARGET_SUPPLY, TARGET_SUPPLY, BURN, 12, 1, SLOT_COUNT,
        );
        let reward = Rewarder::amount(0, 1, SLOT_COUNT, multiplier);
        assert_eq!(reward.into(), 0);
    }

    #[test]
    fn test_rewarder_at_target_at_highest() {
        let multiplier = Rewarder::multiplier(
            TARGET_SUPPLY, TARGET_SUPPLY, BURN, 12, 1, SLOT_COUNT,
        );
        let reward = Rewarder::amount(18, 1, SLOT_COUNT, multiplier);
        assert_gt!(reward.into(), BURN / TEN_POW_18.into());
    }

    #[test]
    fn test_rewarder_at_lowest_at_average() {
        let multiplier = Rewarder::multiplier(0, TARGET_SUPPLY, BURN, 12, 1, SLOT_COUNT);
        let reward = Rewarder::amount(12, 1, SLOT_COUNT, multiplier);
        assert_gt!(reward.into(), BURN / TEN_POW_18.into());
    }

    #[test]
    fn test_rewarder_at_highest_at_average() {
        let multiplier = Rewarder::multiplier(
            TARGET_SUPPLY * 2, TARGET_SUPPLY, BURN, 12, 1, SLOT_COUNT,
        );
        let reward = Rewarder::amount(12, 1, SLOT_COUNT, multiplier);
        assert_eq!(reward.into(), 0);
        let multiplier = Rewarder::multiplier(
            TARGET_SUPPLY * 3, TARGET_SUPPLY, BURN, 12, 1, SLOT_COUNT,
        );
        let reward = Rewarder::amount(12, 1, SLOT_COUNT, multiplier);
        assert_eq!(reward.into(), 0);
    }

    #[test]
    fn test_case_001() {
        let averageScore = 1355000;
        let averageWeight = 113 * 1000;
        let burn = 137938187098112424807;
        let slotCount = 18;
        let supply = 1207160726135631875323840;
        let targetSupply = 1000000000000000000000000;
        let multiplier = Rewarder::multiplier(
            supply, targetSupply, burn, averageScore, averageWeight, slotCount,
        );
        assert_eq!(multiplier, 137);
    }
}
