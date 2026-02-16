import { describe, test, expect } from "vitest";
import { Rewarder } from "./rewarder";

const TARGET_SUPPLY = 100_000_000_000_000_000_000_000_000n;
const SLOT_COUNT = 20;

describe("Rewarder", () => {
  test("test_reward_level_20_at_target", () => {
    const reward = Rewarder.amount(
      20,
      SLOT_COUNT,
      TARGET_SUPPLY,
      TARGET_SUPPLY,
    );
    expect(reward).toBe(41_479);
  });

  test("test_reward_level_20_below_target", () => {
    const reward = Rewarder.amount(
      20,
      SLOT_COUNT,
      TARGET_SUPPLY / 2n,
      TARGET_SUPPLY,
    );
    expect(reward).toBe(62_219);
  });

  test("test_reward_level_20_over_target", () => {
    const reward = Rewarder.amount(
      20,
      SLOT_COUNT,
      (TARGET_SUPPLY * 3n) / 2n,
      TARGET_SUPPLY,
    );
    expect(reward).toBe(20_740);
  });
});
