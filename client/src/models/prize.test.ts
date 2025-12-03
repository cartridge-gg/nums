/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import { PrizeModel } from "./prize";

// Test constants matching the Cairo contract
const PRIZE_AMOUNT = 1_000_000_000_000_000_000n; // 1 ETH in wei
const PRECISION = 10_000n;

describe("PrizeModel.payout", () => {
  it("should calculate payout for one winner with 1 entry", () => {
    const entryCount = 1;
    const payout = PrizeModel.payout(PRIZE_AMOUNT, 1, entryCount);
    expect(payout).toBe(PRIZE_AMOUNT);
  });

  it("should return 0 for rank > 1 when only 1 entry", () => {
    const entryCount = 1;
    const payout = PrizeModel.payout(PRIZE_AMOUNT, 255, entryCount);
    expect(payout).toBe(0n);
  });

  it("should calculate payout for first place with many entries", () => {
    const entryCount = 10_000;
    const payout = PrizeModel.payout(PRIZE_AMOUNT, 1, entryCount) as bigint;
    const expected = (PRIZE_AMOUNT * 2050n) / PRECISION;
    expect(payout).toBe(expected);
  });

  it("should calculate payout for last place with many entries", () => {
    const entryCount = 10_000;
    const payout = PrizeModel.payout(PRIZE_AMOUNT, 255, entryCount) as bigint;
    const expected = (PRIZE_AMOUNT * 8n) / PRECISION;
    expect(payout).toBe(expected);
  });

  it("should distribute total prize for 1000 entries with 10% winners", () => {
    const entryCount = 1_000;
    const winnerCount = Math.floor(entryCount / 10); // ~10% winners (100 winners)
    
    let total = 0n;
    for (let rank = 1; rank <= winnerCount; rank++) {
      const payout = PrizeModel.payout(PRIZE_AMOUNT, rank, entryCount) as bigint;
      total += payout;
    }
    
    expect(total).toBe(PRIZE_AMOUNT);
  });

  it("should return 0 for rank 0", () => {
    const entryCount = 100;
    expect(PrizeModel.payout(PRIZE_AMOUNT, 0, entryCount)).toBe(0n);
  });

  it("should work with number (USD) values", () => {
    const usdAmount = 1000;
    const entryCount = 100;

    const first = PrizeModel.payout(usdAmount, 1, entryCount) as number;
    expect(first).toBeGreaterThan(0);
    expect(first).toBeLessThanOrEqual(usdAmount);

    const tenth = PrizeModel.payout(usdAmount, 10, entryCount) as number;
    expect(tenth).toBeGreaterThan(0);
    expect(tenth).toBeLessThan(first);
  });

  it("should calculate correct payouts for small tournaments", () => {
    const entryCount = 10;
    const rank1 = PrizeModel.payout(PRIZE_AMOUNT, 1, entryCount) as bigint;
    const rank2 = PrizeModel.payout(PRIZE_AMOUNT, 2, entryCount) as bigint;
    
    // First place should get more than second place
    expect(rank1).toBeGreaterThan(rank2);
    
    // Both should be positive
    expect(rank1).toBeGreaterThan(0n);
    expect(rank2).toBeGreaterThan(0n);
  });

  it("should calculate correct payouts for medium tournaments", () => {
    const entryCount = 100;
    const rank1 = PrizeModel.payout(PRIZE_AMOUNT, 1, entryCount) as bigint;
    const rank10 = PrizeModel.payout(PRIZE_AMOUNT, 10, entryCount) as bigint;
    const rank20 = PrizeModel.payout(PRIZE_AMOUNT, 20, entryCount) as bigint;
    
    // Rankings should be in descending order
    expect(rank1).toBeGreaterThan(rank10);
    expect(rank10).toBeGreaterThan(rank20);
  });

  it("should calculate correct payouts for large tournaments", () => {
    const entryCount = 2_000;
    const rank1 = PrizeModel.payout(PRIZE_AMOUNT, 1, entryCount) as bigint;
    const rank50 = PrizeModel.payout(PRIZE_AMOUNT, 50, entryCount) as bigint;
    const rank100 = PrizeModel.payout(PRIZE_AMOUNT, 100, entryCount) as bigint;
    
    // Rankings should be in descending order
    expect(rank1).toBeGreaterThan(rank50);
    expect(rank50).toBeGreaterThan(rank100);
  });
});
