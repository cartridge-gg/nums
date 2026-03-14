import { describe, test, expect } from "vitest";
import { ScriptedRandom } from "./scripted-random";

describe("ScriptedRandom", () => {
  test("nextSeed returns queued values in order", () => {
    const rng = new ScriptedRandom([10n, 20n, 30n]);
    expect(rng.nextSeed()).toBe(10n);
    expect(rng.nextSeed()).toBe(20n);
    expect(rng.nextSeed()).toBe(30n);
  });

  test("nextSeed returns 999n fallback when exhausted", () => {
    const rng = new ScriptedRandom([1n]);
    expect(rng.nextSeed()).toBe(1n);
    expect(rng.nextSeed()).toBe(999n);
    expect(rng.nextSeed()).toBe(999n);
  });

  test("between returns value within range", () => {
    const rng = new ScriptedRandom([500n]);
    const result = rng.between(100, 200);
    expect(result).toBeGreaterThanOrEqual(100);
    expect(result).toBeLessThanOrEqual(200);
  });

  test("between is deterministic for same seed", () => {
    const rng1 = new ScriptedRandom([42n]);
    const rng2 = new ScriptedRandom([42n]);
    expect(rng1.between(0, 100)).toBe(rng2.between(0, 100));
  });

  test("nextUnique avoids values in slots", () => {
    // Seed 50n with range 0-100: 50n % 101 + 0 = 50
    // If 50 is in slots, it recurses and uses next seed
    const rng = new ScriptedRandom([50n, 75n]);
    const result = rng.nextUnique(0, 100, [50]);
    expect(result).not.toBe(50);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });

  test("bool returns boolean", () => {
    const rng = new ScriptedRandom([0n, 1n]);
    expect(typeof rng.bool()).toBe("boolean");
    expect(typeof rng.bool()).toBe("boolean");
  });

  test("occurs returns false when likelihood is 0", () => {
    const rng = new ScriptedRandom([0n]);
    expect(rng.occurs(0)).toBe(false);
  });
});
