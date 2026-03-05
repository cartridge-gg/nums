/**
 * Helper function to calculate the reward amount
 * Equivalent to helpers/rewarder.cairo
 */

const A = 3_062_112_703_903_038_000n;
const B = 3n;
const K = 10n;
const MIN_REWARD = 1n;

/**
 * Calculate the reward amount for a given score
 *
 * @param scoreNum - Numerator of the score fraction
 * @param scoreDen - Denominator of the score fraction
 * @param slotCount - The number of slots in the game
 * @param supply - The current supply of the game
 * @param target - The target supply of the game
 * @returns The reward amount (u64 equivalent)
 */
export class Rewarder {
  static amount(
    scoreNum: bigint,
    scoreDen: bigint,
    slotCount: bigint,
    supply: bigint,
    target: bigint,
  ): number {
    // [Check] Manage the specific case where the supply is twice the target
    if (supply > target * 2n) {
      return 0;
    }
    // [Compute] Otherwise, calculate the reward amount
    const num = A * (2n * target - supply);
    const denLhs = target * (slotCount + B) ** K;
    const denRhs = (target * scoreNum ** K) / scoreDen ** K;
    const den = denLhs - denRhs;
    return Number(num / den - num / denLhs + MIN_REWARD);
  }
}
