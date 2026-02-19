import { describe, test, expect } from "vitest";
import { Lucky } from "./lucky";
import { Game } from "@/models/game";
import { Random } from "@/helpers/random";
import { Power } from "@/types/power";
import { Trap } from "@/types/trap";

const DEFAULT_SLOT_COUNT = 20;
const DEFAULT_MULTIPLIER = 100;
const DEFAULT_SLOT_MIN = 1;
const DEFAULT_SLOT_MAX = 999;

function createTestGame(slots: number[]): Game {
  return new Game(
    0,
    false,
    DEFAULT_MULTIPLIER,
    0,
    DEFAULT_SLOT_COUNT,
    DEFAULT_SLOT_MIN,
    DEFAULT_SLOT_MAX,
    0,
    0,
    [],
    [Power.from(0), Power.from(0), Power.from(0)],
    [false, false, false],
    Array.from({ length: DEFAULT_SLOT_COUNT }, () => false),
    0,
    0,
    0,
    Array.from({ length: DEFAULT_SLOT_COUNT }, () => Trap.from(0)),
    slots,
    0n,
  );
}

describe("Lucky", () => {
  test("test_lucky_single", () => {
    const random = new Random(0n);
    const game = createTestGame([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
    new Lucky().apply(game, 9, random);
    expect(game.slots).toEqual([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 738, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
  });

  test("test_lucky_full_large", () => {
    const random = new Random(0n);
    const game = createTestGame([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 500, 990, 991, 992, 993, 994, 995, 996, 997,
      998, 999,
    ]);
    new Lucky().apply(game, 9, random);
    expect(game.slots).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 814, 990, 991, 992, 993, 994, 995, 996, 997,
      998, 999,
    ]);
  });

  test("test_lucky_full_tight", () => {
    const random = new Random(0n);
    const game = createTestGame([
      491, 492, 493, 494, 495, 496, 497, 498, 499, 500, 501, 502, 503, 504, 505,
      506, 507, 508, 509, 510,
    ]);
    new Lucky().apply(game, 9, random);
    expect(game.slots).toEqual([
      491, 492, 493, 494, 495, 496, 497, 498, 499, 501, 501, 502, 503, 504, 505,
      506, 507, 508, 509, 510,
    ]);
  });

  test("test_lucky_full_even", () => {
    const random = new Random(0n);
    const game = createTestGame(
      Array.from({ length: DEFAULT_SLOT_COUNT }, () => 500),
    );
    new Lucky().apply(game, 9, random);
    expect(game.slots).toEqual(
      Array.from({ length: DEFAULT_SLOT_COUNT }, () => 500),
    );
  });
});
