import { describe, test, expect } from "vitest";
import { Trap } from "./trap";
import { Random } from "@/helpers/random";
import { DEFAULT_SLOT_COUNT } from "@/constants";

describe("Trap", () => {
  test("test_trap_generate", () => {
    const random = new Random(0n);
    const traps = Trap.generate(5, DEFAULT_SLOT_COUNT, random);
    // The exact values depend on the random implementation
    // We check that we get the right number of traps
    expect(traps.length).toBe(DEFAULT_SLOT_COUNT);
    // Count non-zero traps (should be 5)
    const trapCount = traps.filter((t) => t !== 0).length;
    expect(trapCount).toBe(5);
  });
});
