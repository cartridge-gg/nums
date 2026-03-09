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
    multiplier: number,
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
    const reward = num / den - num / denLhs + MIN_REWARD;
    return Number((reward * BigInt(multiplier * 100)) / BigInt(100));
  }

  /**
   * Estimate the game multiplier for a given starterpack and market conditions.
   * Mirrors the on-chain calculation in playable.cairo (quantity = 1).
   *
   * Formula (Cairo equivalent):
   *   burn_usdc        = burn_percentage * pack_price / 100
   *   burn_amount_nums = burn_usdc * 10^18 / (numsPrice * 10^6)   [NUMS, 18-dec]
   *   burn_per_game    = base_price * pack_multiplier * burn_amount / pack_price
   *   supply_per_game  = current_supply - burn_per_game
   *   avg_reward       = Rewarder(avg_num, avg_den, slot_count, supply_per_game, target) * 10^18
   *   equilibrium      = 100 * avg_reward / burn_percentage
   *   multiplier_raw   = 100 * burn_per_game / equilibrium      [100-based]
   *
   * @param basePrice       - config.base_price (USDC, 6 decimals)
   * @param packMultiplier  - starterpack.multiplier (100-based, 100 = 1×)
   * @param burnPercentage  - config.burn_percentage
   * @param slotCount       - config.slot_count
   * @param averageScore    - config.average_score (EMA-scaled u32)
   * @param averageWeight   - config.average_weigth (EMA weight u16)
   * @param currentSupply   - current NUMS total supply (18-dec bigint)
   * @param targetSupply    - config.target_supply (18-dec bigint)
   * @param numsPrice       - USD price per NUMS token (float)
   * @returns multiplier as a regular float (1.0 = 1×)
   */
  /**
   * @param numsPrice - USD price per NUMS token scaled by 10^6 (e.g. 950n for $0.00095)
   */
  static multiplier(
    basePrice: bigint,
    packMultiplier: bigint,
    burnPercentage: bigint,
    slotCount: bigint,
    averageScore: bigint,
    averageWeight: bigint,
    currentSupply: bigint,
    targetSupply: bigint,
    numsPrice: bigint,
  ): number {
    const TEN_POW_18 = 10n ** 18n;
    const EMA_SCORE_PRECISION = 1000n;
    const CONVERSION_FEE = 50n + 48n; // Swap fee + slippage estimation

    if (
      numsPrice === 0n ||
      targetSupply === 0n ||
      currentSupply === 0n ||
      burnPercentage === 0n
    ) {
      return 1;
    }

    // USDC used to buy+burn NUMS (6-decimal bigint)
    const burnUsdc = (burnPercentage * packMultiplier * basePrice) / 100n;

    // Approximate NUMS burned (18-decimal bigint), net of conversion fee
    // burn_usdc (6-dec) / 10^6 / numsPrice * 10^18 = burn_usdc * 10^18 / numsPrice
    // numsPrice is already scaled by 10^6, so division is exact
    const burnAmountNums =
      (((burnUsdc * TEN_POW_18) / numsPrice) * (1000n - CONVERSION_FEE)) /
      1000n;

    // burn_per_game = base_price * pack_multiplier * burn_amount / pack_price
    const burnPerGame = burnAmountNums / 1n;

    // supply_per_game = current_supply - burn_per_game
    const supplyPerGame =
      currentSupply > burnPerGame ? currentSupply - burnPerGame : 0n;

    // average_score() => (average_score, average_weigth * EMA_SCORE_PRECISION)
    const avgDen = averageWeight * EMA_SCORE_PRECISION;

    // avg_reward scaled by 10^18 to match burn_per_game units
    const avgRewardPlain = Rewarder.amount(
      averageScore,
      avgDen,
      slotCount,
      supplyPerGame,
      targetSupply,
      1,
    );
    const avgReward = BigInt(avgRewardPlain) * TEN_POW_18;

    if (avgReward === 0n) return 1;

    // equilibrium_reward = 100 * avg_reward / burn_percentage
    const equilibriumReward = (100n * avgReward) / burnPercentage;

    if (equilibriumReward === 0n) return 1;

    // multiplier (100-based) = 100 * burn_per_game / equilibrium_reward
    // result is converted to Number only here
    const multiplierRaw = (100n * burnPerGame) / equilibriumReward;

    return Number(multiplierRaw) / 100;
  }
}
