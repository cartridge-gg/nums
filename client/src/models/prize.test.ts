/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import { PrizeModel } from "./prize";

// Test constants matching the Cairo contract
const PRIZE_AMOUNT = 1_000_000_000_000_000_000n; // 1 ETH in wei

describe("PrizeModel.payout", () => {
  it("should calculate payout for one winner", () => {
    const capacity = 1;
    const payout = PrizeModel.payout(PRIZE_AMOUNT, 1, capacity);
    expect(payout).toBe(PRIZE_AMOUNT);
  });

  it("should calculate payout for two winners", () => {
    const capacity = 2;

    const second = PrizeModel.payout(PRIZE_AMOUNT, 2, capacity) as bigint;
    expect(second).toBe(PRIZE_AMOUNT / 3n);

    const first = PrizeModel.payout(PRIZE_AMOUNT, 1, capacity) as bigint;
    expect(first).toBe(PRIZE_AMOUNT - second);
    expect(first + second).toBe(PRIZE_AMOUNT);
  });

  it("should calculate payout for three winners", () => {
    const capacity = 3;

    const third = PrizeModel.payout(PRIZE_AMOUNT, 3, capacity) as bigint;
    expect(third).toBe(PRIZE_AMOUNT / 6n);

    const second = PrizeModel.payout(PRIZE_AMOUNT, 2, capacity) as bigint;
    expect(second).toBe((PRIZE_AMOUNT - third) / 3n);

    const first = PrizeModel.payout(PRIZE_AMOUNT, 1, capacity) as bigint;
    expect(first).toBe(PRIZE_AMOUNT - second - third);
    expect(first + second + third).toBe(PRIZE_AMOUNT);
  });

  it("should calculate payout for four winners", () => {
    const capacity = 4;

    const fourth = PrizeModel.payout(PRIZE_AMOUNT, 4, capacity) as bigint;
    expect(fourth).toBe(PRIZE_AMOUNT / 12n);

    const third = PrizeModel.payout(PRIZE_AMOUNT, 3, capacity) as bigint;
    expect(third).toBe((PRIZE_AMOUNT - fourth) / 6n);

    const second = PrizeModel.payout(PRIZE_AMOUNT, 2, capacity) as bigint;
    expect(second).toBe((PRIZE_AMOUNT - third - fourth) / 3n);

    const first = PrizeModel.payout(PRIZE_AMOUNT, 1, capacity) as bigint;
    expect(first).toBe(PRIZE_AMOUNT - second - third - fourth);
    expect(first + second + third + fourth).toBe(PRIZE_AMOUNT);
  });

  it("should calculate payout for five winners", () => {
    const capacity = 5;

    const fifth = PrizeModel.payout(PRIZE_AMOUNT, 5, capacity) as bigint;
    expect(fifth).toBe(PRIZE_AMOUNT / 24n);

    const fourth = PrizeModel.payout(PRIZE_AMOUNT, 4, capacity) as bigint;
    expect(fourth).toBe((PRIZE_AMOUNT - fifth) / 12n);

    const third = PrizeModel.payout(PRIZE_AMOUNT, 3, capacity) as bigint;
    expect(third).toBe((PRIZE_AMOUNT - fourth - fifth) / 6n);

    const second = PrizeModel.payout(PRIZE_AMOUNT, 2, capacity) as bigint;
    expect(second).toBe((PRIZE_AMOUNT - third - fourth - fifth) / 3n);

    const first = PrizeModel.payout(PRIZE_AMOUNT, 1, capacity) as bigint;
    expect(first).toBe(PRIZE_AMOUNT - second - third - fourth - fifth);
    expect(first + second + third + fourth + fifth).toBe(PRIZE_AMOUNT);
  });

  it("should return 0 for rank 0", () => {
    expect(PrizeModel.payout(PRIZE_AMOUNT, 0, 5)).toBe(0n);
  });

  it("should return 0 for rank > capacity", () => {
    expect(PrizeModel.payout(PRIZE_AMOUNT, 6, 5)).toBe(0n);
  });

  it("should throw for invalid capacity", () => {
    expect(() => PrizeModel.payout(PRIZE_AMOUNT, 1, 0)).toThrow(
      "Invalid capacity: 0",
    );
    expect(() => PrizeModel.payout(PRIZE_AMOUNT, 1, 11)).toThrow(
      "Invalid capacity: 11",
    );
  });

  it("should work with number (USD) values", () => {
    const usdAmount = 1000;
    const capacity = 5;

    const fifth = PrizeModel.payout(usdAmount, 5, capacity) as number;
    expect(fifth).toBeCloseTo(usdAmount / 24, 2);

    const fourth = PrizeModel.payout(usdAmount, 4, capacity) as number;
    expect(fourth).toBeCloseTo((usdAmount - fifth) / 12, 2);

    const first = PrizeModel.payout(usdAmount, 1, capacity) as number;
    expect(first).toBeGreaterThan(0);
  });
});
