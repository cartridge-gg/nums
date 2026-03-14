/**
 * Helper function to calculate the reward amount
 * Equivalent to helpers/rewarder.cairo
 */

import { MULTIPLIER_PRECISION } from "@/constants";

const TEN_POW_18 = 10n ** 18n;
const A = 306_211_270_390_303_800n * TEN_POW_18;
const B = 3n;
const K = 10n;

export class Rewarder {
  /**
   * Mirrors Rewarder::base — supply-independent base reward for a given score.
   * @param scoreNum  - Numerator of the score fraction
   * @param scoreDen  - Denominator of the score fraction
   * @param slotCount - Number of slots in the game
   * @returns Base reward (18-decimal bigint)
   */
  static base(scoreNum: bigint, scoreDen: bigint, slotCount: bigint): bigint {
    if (scoreDen === 0n) return 0n;
    const denLhs = (slotCount + B) ** K;
    const denRhs = scoreNum ** K / scoreDen ** K;
    if (denLhs <= denRhs) return 0n;
    return (
      A / (denLhs - denRhs) - A / denLhs + (scoreNum * TEN_POW_18) / scoreDen
    );
  }

  /**
   * Mirrors Rewarder::supply_multiplier — MULTIPLIER_PRECISION-based (1_000_000 = 1×).
   * Returns 0 when supply ≥ 2 × target (no rewards).
   */
  static supplyMultiplier(supply: bigint, target: bigint): bigint {
    if (supply > target * 2n || target === 0n) return 0n;
    return ((2n * target - supply) * MULTIPLIER_PRECISION) / target;
  }

  /**
   * Mirrors Rewarder::burn_multiplier — MULTIPLIER_PRECISION-based (1_000_000 = 1×).
   * @param burn - NUMS burned per game (18-decimal bigint)
   */
  static burnMultiplier(
    burn: bigint,
    scoreNum: bigint,
    scoreDen: bigint,
    slotCount: bigint,
  ): bigint {
    const mint = Rewarder.base(scoreNum, scoreDen, slotCount);
    if (mint === 0n) return 0n;
    return (burn * MULTIPLIER_PRECISION) / mint;
  }

  /**
   * Mirrors Rewarder::multiplier — MULTIPLIER_PRECISION-based (1_000_000 = 1×).
   * @param supply    - Current supply of the game
   * @param target    - Target supply of the game
   * @param burn      - NUMS burned per game (18-dec bigint)
   * @param scoreNum  - Numerator of the score fraction
   * @param scoreDen  - Denominator of the score fraction
   * @param slotCount - Number of slots in the game
   * @returns Multiplier on MULTIPLIER_PRECISION-based scale (1_000_000n = 1×)
   */
  static multiplier(
    supply: bigint,
    target: bigint,
    burn: bigint,
    scoreNum: bigint,
    scoreDen: bigint,
    slotCount: bigint,
  ): bigint {
    const supplyMultiplier = Rewarder.supplyMultiplier(supply, target);
    const burnMultiplier = Rewarder.burnMultiplier(
      burn,
      scoreNum,
      scoreDen,
      slotCount,
    );
    return (supplyMultiplier * burnMultiplier) / MULTIPLIER_PRECISION;
  }

  /**
   * Mirrors Rewarder::amount
   * @param multiplier - MULTIPLIER_PRECISION-based bigint (1_000_000n = 1×, as stored on-chain)
   * @returns Reward amount (NUMS, human-readable without 18 decimals)
   */
  static amount(
    scoreNum: bigint,
    scoreDen: bigint,
    slotCount: bigint,
    multiplier: bigint,
  ): number {
    const base = Rewarder.base(scoreNum, scoreDen, slotCount);
    return Number((base * multiplier) / MULTIPLIER_PRECISION / TEN_POW_18);
  }

  /**
   * Pure-math fallback for multiplier estimation (no Ekubo fetch).
   * Prefer useMultiplier() hook for live estimation with real swap quotes.
   * Mirrors the playable.cairo computation (quantity = 1), using numsPrice
   * as a linear rate without slippage.
   *
   * @param basePrice      - config.base_price (USDC, 6 decimals)
   * @param packMultiplier - starterpack.multiplier (raw, e.g. 1 or 10)
   * @param burnPercentage - config.burn_percentage
   * @param slotCount      - config.slot_count
   * @param averageScore   - config.average_score (EMA-scaled u32)
   * @param averageWeight  - config.average_weigth (EMA weight u16)
   * @param currentSupply  - current NUMS total supply (18-dec bigint)
   * @param targetSupply   - config.target_supply (18-dec bigint)
   * @param numsPrice      - USD/NUMS scaled × 10^6 (e.g. 954n for $0.000954)
   * @returns float multiplier (1.0 = 1×)
   */
  static estimate(
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
    const EMA_SCORE_PRECISION = 1000n;

    if (
      numsPrice === 0n ||
      targetSupply === 0n ||
      currentSupply === 0n ||
      burnPercentage === 0n
    ) {
      return 1;
    }

    // burn_usdc = burn_percentage * pack_multiplier * base_price / 100 (6-dec USDC)
    const burnUsdc = (burnPercentage * packMultiplier * basePrice) / 100n;

    // Convert USDC → NUMS (18-dec) at the given numsPrice (no fee — pure math fallback)
    const burnPerGame = (burnUsdc * TEN_POW_18) / numsPrice;

    const supplyPerGame =
      currentSupply > burnPerGame ? currentSupply - burnPerGame : 0n;

    const avgDen = averageWeight * EMA_SCORE_PRECISION;
    const multiplier = Rewarder.multiplier(
      supplyPerGame,
      targetSupply,
      burnPerGame,
      averageScore,
      avgDen,
      slotCount,
    );
    return Number(multiplier) / Number(MULTIPLIER_PRECISION);
  }
}
