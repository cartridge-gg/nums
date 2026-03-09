import { describe, test, expect } from "vitest";
import { Rewarder } from "./rewarder";

const TARGET_SUPPLY = 10_000_000_000_000_000_000_000_000n;
const SLOT_COUNT = 18n;

describe("Rewarder.amount", () => {
  test("test_reward_score_18_at_target", () => {
    const reward = Rewarder.amount(
      18n,
      1n,
      SLOT_COUNT,
      TARGET_SUPPLY,
      TARGET_SUPPLY,
      1,
    );
    expect(reward).toBe(50001);
  });

  test("test_reward_score_18_below_target", () => {
    const reward = Rewarder.amount(
      18n,
      1n,
      SLOT_COUNT,
      TARGET_SUPPLY / 2n,
      TARGET_SUPPLY,
      1,
    );
    expect(reward).toBe(75001);
  });

  test("test_reward_score_18_over_target", () => {
    const reward = Rewarder.amount(
      18n,
      1n,
      SLOT_COUNT,
      (TARGET_SUPPLY * 3n) / 2n,
      TARGET_SUPPLY,
      1,
    );
    expect(reward).toBe(25001);
  });

  test("test_reward_case_001", () => {
    const reward = Rewarder.amount(
      18n,
      1n,
      SLOT_COUNT,
      12010456314712373336261301n,
      10000000000000000000000000n,
      1,
    );
    expect(reward).toBe(39948);
  });
});

// Shared constants for multiplier tests
const BASE_PRICE = 2_000_000n; // 2 USDC (6 decimals)
const PACK_MULTIPLIER = 100n; // 1× (100-based)
const BURN_PERCENTAGE = 70n; // 70%
const SLOT_COUNT_NUM = 18n;
const AVG_SCORE = 1322000n; // average_score (EMA-scaled)
const AVG_WEIGHT = 111n; // average_weigth (EMA_INITIAL_WEIGHT)
const NUMS_PRICE = 1000n; // $0.001 per NUMS (scaled × 10^6)

describe("Rewarder.multiplier", () => {
  test("returns_1_when_nums_price_is_0", () => {
    const m = Rewarder.multiplier(
      BASE_PRICE,
      PACK_MULTIPLIER,
      BURN_PERCENTAGE,
      SLOT_COUNT_NUM,
      AVG_SCORE,
      AVG_WEIGHT,
      TARGET_SUPPLY,
      TARGET_SUPPLY,
      0n,
    );
    expect(m).toBe(1);
  });

  test("returns_1_when_target_supply_is_0", () => {
    const m = Rewarder.multiplier(
      BASE_PRICE,
      PACK_MULTIPLIER,
      BURN_PERCENTAGE,
      SLOT_COUNT_NUM,
      AVG_SCORE,
      AVG_WEIGHT,
      TARGET_SUPPLY,
      0n,
      NUMS_PRICE,
    );
    expect(m).toBe(1);
  });

  test("returns_positive_multiplier_at_target_supply", () => {
    const m = Rewarder.multiplier(
      BASE_PRICE,
      PACK_MULTIPLIER,
      BURN_PERCENTAGE,
      SLOT_COUNT_NUM,
      AVG_SCORE,
      AVG_WEIGHT,
      TARGET_SUPPLY,
      TARGET_SUPPLY,
      NUMS_PRICE,
    );
    expect(m).toBeGreaterThan(0);
  });

  test("higher_nums_price_yields_lower_multiplier", () => {
    // More expensive NUMS → fewer NUMS burned per game → lower multiplier
    const mLow = Rewarder.multiplier(
      BASE_PRICE,
      PACK_MULTIPLIER,
      BURN_PERCENTAGE,
      SLOT_COUNT_NUM,
      AVG_SCORE,
      AVG_WEIGHT,
      TARGET_SUPPLY,
      TARGET_SUPPLY,
      1000n, // $0.001
    );
    const mHigh = Rewarder.multiplier(
      BASE_PRICE,
      PACK_MULTIPLIER,
      BURN_PERCENTAGE,
      SLOT_COUNT_NUM,
      AVG_SCORE,
      AVG_WEIGHT,
      TARGET_SUPPLY,
      TARGET_SUPPLY,
      10000n, // $0.01
    );
    expect(mHigh).toBeLessThan(mLow);
  });

  test("higher_base_price_yields_higher_multiplier", () => {
    // pack_price cancels in burn_per_game; base_price is the actual driver
    const mBase = Rewarder.multiplier(
      BASE_PRICE,
      PACK_MULTIPLIER,
      BURN_PERCENTAGE,
      SLOT_COUNT_NUM,
      AVG_SCORE,
      AVG_WEIGHT,
      TARGET_SUPPLY,
      TARGET_SUPPLY,
      NUMS_PRICE,
    );
    const mDouble = Rewarder.multiplier(
      BASE_PRICE * 2n,
      PACK_MULTIPLIER,
      BURN_PERCENTAGE,
      SLOT_COUNT_NUM,
      AVG_SCORE,
      AVG_WEIGHT,
      TARGET_SUPPLY,
      TARGET_SUPPLY,
      NUMS_PRICE,
    );
    expect(mDouble).toBeGreaterThan(mBase);
  });

  test("test_multiplier_case_pack_1", () => {
    const multiplier = Rewarder.multiplier(
      2_000_000n,
      1n,
      70n,
      18n,
      1322000n,
      111n,
      12008156869796926328406417n,
      10000000000000000000000000n,
      954n, // $0.00095 scaled × 10^6
    );
    expect(multiplier).toBe(1.92);
  });

  test("test_multiplier_case_pack_10", () => {
    const multiplier = Rewarder.multiplier(
      2_000_000n,
      10n,
      70n,
      18n,
      1322000n,
      111n,
      12008156869796926328406417n,
      10000000000000000000000000n,
      954n, // $0.00095 scaled × 10^6
    );
    expect(multiplier).toBe(19.21);
  });
});
