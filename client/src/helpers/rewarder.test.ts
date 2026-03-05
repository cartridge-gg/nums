import { describe, test, expect } from "vitest";
import { Rewarder } from "./rewarder";

const TARGET_SUPPLY = 10_000_000_000_000_000_000_000_000n;
const SLOT_COUNT = 18n;

describe("Rewarder", () => {
  test("test_reward_score_18_at_target", () => {
    const reward = Rewarder.amount(
      18n,
      1n,
      SLOT_COUNT,
      TARGET_SUPPLY,
      TARGET_SUPPLY,
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
    );
    expect(reward).toBe(25001);
  });
});
