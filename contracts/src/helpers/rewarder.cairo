// Imports

use core::num::traits::Pow;

pub const NUMERATOR: u64 = 270_000_000_000;
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
    fn amount(level: u8, slot_count: u8, supply: u256, target: u256) -> u64 {
        // [Check] Manage the specific case where the supply is twice the target
        if supply > target * 2 {
            return 0;
        }
        // [Compute] Otherwise, calculate the reward amount
        let num: u64 = if supply < target {
            (NUMERATOR.into() + NUMERATOR.into() * (target - supply) / target).try_into().unwrap()
        } else {
            (NUMERATOR.into() - NUMERATOR.into() * (supply - target) / target).try_into().unwrap()
        };
        let den: u64 = (slot_count.into() + 3_u64).pow(5);
        let level_pow: u64 = level.into();
        num / (den - level_pow.pow(5)) - (num - MIN_REWARD * den) / den
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const TARGET_SUPPLY: u256 = 100_000_000_000_000_000_000_000_000;
    const SLOT_COUNT: u8 = 20;

    #[test]
    fn test_reward_level_20_at_target() {
        let reward = Rewarder::amount(20, SLOT_COUNT, TARGET_SUPPLY, TARGET_SUPPLY);
        assert_eq!(reward, 41_479);
    }

    #[test]
    fn test_reward_level_20_below_target() {
        let reward = Rewarder::amount(20, SLOT_COUNT, TARGET_SUPPLY / 2, TARGET_SUPPLY);
        assert_eq!(reward, 62_219);
    }

    #[test]
    fn test_reward_level_20_over_target() {
        let reward = Rewarder::amount(20, SLOT_COUNT, TARGET_SUPPLY * 3 / 2, TARGET_SUPPLY);
        assert_eq!(reward, 20_740);
    }
}
