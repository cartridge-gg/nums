/**
 * Helper function to calculate the reward amount
 * Equivalent to helpers/rewarder.cairo
 */

const NUMERATOR = 270_000_000_000n;
const MIN_REWARD = 1n;

/**
 * Calculate the reward amount for a given level
 *
 * @param level - The level of the reward
 * @param slotCount - The number of slots in the game
 * @param supply - The current supply of the game
 * @param target - The target supply of the game
 * @returns The reward amount (u64 equivalent)
 */
export class Rewarder {
  static amount(
    level: number,
    slotCount: number,
    supply: bigint,
    target: bigint,
  ): number {
    // [Check] Manage the specific case where the supply is twice the target
    if (supply > target * 2n) {
      return 0;
    }
    // [Compute] Otherwise, calculate the reward amount
    let num: bigint;
    if (supply < target) {
      num = NUMERATOR + (NUMERATOR * (target - supply)) / target;
    } else {
      num = NUMERATOR - (NUMERATOR * (supply - target)) / target;
    }
    const den: bigint = (BigInt(slotCount) + 3n) ** 5n;
    const levelPow: bigint = BigInt(level) ** 5n;
    const result = num / (den - levelPow) - (num - MIN_REWARD * den) / den;
    return Number(result);
  }
}
