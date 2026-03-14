import { describe, test, expect } from "vitest";
import { Rewarder } from "./rewarder";

// Mirror of Cairo test constants in rewarder.cairo
const BURN = 1000n * 10n ** 18n; // 1000 NUMS (18-dec)
const TARGET_SUPPLY = 1_000_000n;
const SLOT_COUNT = 18n;

// Shared multiplier calibrated at average score (12/1) and target supply
// supply_multiplier(TARGET, TARGET) = 100
// burn_multiplier(BURN, 12, 1, 18)  = BURN * 100 / (base(12,1,18) * 10^18)
// multiplier = 100 * burn_mul / 100 = burn_mul
const AVG_MULTIPLIER =
  Rewarder.supplyMultiplier(TARGET_SUPPLY, TARGET_SUPPLY) *
  Rewarder.burnMultiplier(BURN, 12n, 1n, SLOT_COUNT) /
  100n;

describe("Rewarder.base", () => {
  test("returns_0_when_score_den_is_0", () => {
    expect(Rewarder.base(12n, 0n, SLOT_COUNT)).toBe(0n);
  });

  test("returns_positive_value_for_average_score", () => {
    expect(Rewarder.base(12n, 1n, SLOT_COUNT)).toBeGreaterThan(0n);
  });

  test("higher_score_yields_higher_base", () => {
    const low = Rewarder.base(10n, 1n, SLOT_COUNT);
    const high = Rewarder.base(14n, 1n, SLOT_COUNT);
    expect(high).toBeGreaterThan(low);
  });
});

describe("Rewarder.supplyMultiplier", () => {
  test("returns_100_at_target_supply", () => {
    expect(Rewarder.supplyMultiplier(TARGET_SUPPLY, TARGET_SUPPLY)).toBe(100n);
  });

  test("returns_200_at_zero_supply", () => {
    expect(Rewarder.supplyMultiplier(0n, TARGET_SUPPLY)).toBe(200n);
  });

  test("returns_0_at_double_target_supply", () => {
    expect(Rewarder.supplyMultiplier(TARGET_SUPPLY * 2n, TARGET_SUPPLY)).toBe(0n);
  });

  test("returns_0_above_double_target", () => {
    expect(Rewarder.supplyMultiplier(TARGET_SUPPLY * 3n, TARGET_SUPPLY)).toBe(0n);
  });

  test("returns_0_when_target_is_0", () => {
    expect(Rewarder.supplyMultiplier(TARGET_SUPPLY, 0n)).toBe(0n);
  });
});

describe("Rewarder.amount", () => {
  test("test_rewarder_at_target_at_average", () => {
    // At target supply, average score: reward == BURN / 10^18
    const reward = Rewarder.amount(12n, 1n, SLOT_COUNT, AVG_MULTIPLIER);
    expect(reward).toBe(Number(BURN / 10n ** 18n)); // 1000
  });

  test("test_rewarder_at_target_below_average", () => {
    const reward = Rewarder.amount(10n, 1n, SLOT_COUNT, AVG_MULTIPLIER);
    expect(reward).toBeLessThan(Number(BURN / 10n ** 18n));
  });

  test("test_rewarder_at_target_above_average", () => {
    const reward = Rewarder.amount(14n, 1n, SLOT_COUNT, AVG_MULTIPLIER);
    expect(reward).toBeGreaterThan(Number(BURN / 10n ** 18n));
  });

  test("test_rewarder_at_target_at_lowest", () => {
    const reward = Rewarder.amount(0n, 1n, SLOT_COUNT, AVG_MULTIPLIER);
    expect(reward).toBe(0);
  });

  test("test_rewarder_at_target_at_highest", () => {
    const reward = Rewarder.amount(SLOT_COUNT, 1n, SLOT_COUNT, AVG_MULTIPLIER);
    expect(reward).toBeGreaterThan(Number(BURN / 10n ** 18n));
  });

  test("test_rewarder_below_target_at_average", () => {
    // Below target: supply_multiplier > 100 → more rewards
    const belowMul =
      Rewarder.supplyMultiplier(TARGET_SUPPLY / 2n, TARGET_SUPPLY) *
      Rewarder.burnMultiplier(BURN, 12n, 1n, SLOT_COUNT) /
      100n;
    const reward = Rewarder.amount(12n, 1n, SLOT_COUNT, belowMul);
    expect(reward).toBeGreaterThan(Number(BURN / 10n ** 18n));
  });

  test("test_rewarder_above_target_at_average", () => {
    // Above target: supply_multiplier < 100 → fewer rewards
    const aboveMul =
      Rewarder.supplyMultiplier((TARGET_SUPPLY * 3n) / 2n, TARGET_SUPPLY) *
      Rewarder.burnMultiplier(BURN, 12n, 1n, SLOT_COUNT) /
      100n;
    const reward = Rewarder.amount(12n, 1n, SLOT_COUNT, aboveMul);
    expect(reward).toBeLessThan(Number(BURN / 10n ** 18n));
  });

  test("test_rewarder_at_highest_supply_at_average", () => {
    // At 2× target: supply_multiplier = 0 → reward = 0
    const zeroMul =
      Rewarder.supplyMultiplier(TARGET_SUPPLY * 2n, TARGET_SUPPLY) *
      Rewarder.burnMultiplier(BURN, 12n, 1n, SLOT_COUNT) /
      100n;
    const reward = Rewarder.amount(12n, 1n, SLOT_COUNT, zeroMul);
    expect(reward).toBe(0);
  });
});

// Shared constants for market multiplier tests
const BASE_PRICE = 2_000_000n;     // 2 USDC (6 decimals)
const PACK_MULTIPLIER = 100n;      // 1× pack (100-based)
const BURN_PERCENTAGE = 70n;       // 70%
const SLOT_COUNT_NUM = 18n;
const AVG_SCORE = 1322000n;        // average_score (EMA-scaled)
const AVG_WEIGHT = 111n;           // average_weigth (EMA_INITIAL_WEIGHT)
const NUMS_PRICE = 1000n;          // $0.001 per NUMS (scaled × 10^6)

describe("Rewarder.estimate", () => {
  test("returns_1_when_nums_price_is_0", () => {
    const m = Rewarder.estimate(
      BASE_PRICE, PACK_MULTIPLIER, BURN_PERCENTAGE,
      SLOT_COUNT_NUM, AVG_SCORE, AVG_WEIGHT,
      TARGET_SUPPLY, TARGET_SUPPLY, 0n,
    );
    expect(m).toBe(1);
  });

  test("returns_1_when_target_supply_is_0", () => {
    const m = Rewarder.estimate(
      BASE_PRICE, PACK_MULTIPLIER, BURN_PERCENTAGE,
      SLOT_COUNT_NUM, AVG_SCORE, AVG_WEIGHT,
      TARGET_SUPPLY, 0n, NUMS_PRICE,
    );
    expect(m).toBe(1);
  });

  test("returns_positive_multiplier_at_target_supply", () => {
    const m = Rewarder.estimate(
      BASE_PRICE, PACK_MULTIPLIER, BURN_PERCENTAGE,
      SLOT_COUNT_NUM, AVG_SCORE, AVG_WEIGHT,
      TARGET_SUPPLY, TARGET_SUPPLY, NUMS_PRICE,
    );
    expect(m).toBeGreaterThan(0);
  });

  test("higher_nums_price_yields_lower_multiplier", () => {
    const mLow = Rewarder.estimate(
      BASE_PRICE, PACK_MULTIPLIER, BURN_PERCENTAGE,
      SLOT_COUNT_NUM, AVG_SCORE, AVG_WEIGHT,
      TARGET_SUPPLY, TARGET_SUPPLY, 1000n,   // $0.001
    );
    const mHigh = Rewarder.estimate(
      BASE_PRICE, PACK_MULTIPLIER, BURN_PERCENTAGE,
      SLOT_COUNT_NUM, AVG_SCORE, AVG_WEIGHT,
      TARGET_SUPPLY, TARGET_SUPPLY, 10000n,  // $0.01
    );
    expect(mHigh).toBeLessThan(mLow);
  });

  test("higher_base_price_yields_higher_multiplier", () => {
    const mBase = Rewarder.estimate(
      BASE_PRICE, PACK_MULTIPLIER, BURN_PERCENTAGE,
      SLOT_COUNT_NUM, AVG_SCORE, AVG_WEIGHT,
      TARGET_SUPPLY, TARGET_SUPPLY, NUMS_PRICE,
    );
    const mDouble = Rewarder.estimate(
      BASE_PRICE * 2n, PACK_MULTIPLIER, BURN_PERCENTAGE,
      SLOT_COUNT_NUM, AVG_SCORE, AVG_WEIGHT,
      TARGET_SUPPLY, TARGET_SUPPLY, NUMS_PRICE,
    );
    expect(mDouble).toBeGreaterThan(mBase);
  });

  test("test_multiplier_case_pack_1", () => {
    const multiplier = Rewarder.estimate(
      2_000_000n,
      1n,
      70n,
      18n,
      1322000n,
      111n,
      12008156869796926328406417n,
      10000000000000000000000000n,
      954n,
    );
    expect(multiplier).toBe(14.87);
  });

  test("test_multiplier_case_pack_10", () => {
    const multiplier = Rewarder.estimate(
      2_000_000n,
      10n,
      70n,
      18n,
      1322000n,
      111n,
      12008156869796926328406417n,
      10000000000000000000000000n,
      954n,
    );
    expect(multiplier).toBe(150.71);
  });
});
