import { describe, test, expect } from "vitest";
import { Bomb } from "./bomb";
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

describe("Bomb", () => {
  test("test_bomb_large_range", () => {
    const random = new Random(0n);
    const game = createTestGame([
      1, 0, 0, 0, 250, 0, 0, 0, 0, 500, 0, 0, 0, 0, 750, 0, 0, 0, 0, 999,
    ]);
    new Bomb().apply(game, 9, random);
    expect(game.slots).toEqual([
      1, 0, 0, 0, 120, 0, 0, 0, 0, 500, 0, 0, 0, 0, 503, 0, 0, 0, 0, 999,
    ]);
  });

  test("test_bomb_small_range", () => {
    const random = new Random(0n);
    const game = createTestGame([
      1, 0, 0, 0, 0, 0, 0, 100, 250, 500, 750, 900, 0, 0, 0, 0, 0, 0, 0, 999,
    ]);
    new Bomb().apply(game, 9, random);
    expect(game.slots).toEqual([
      1, 0, 0, 0, 0, 0, 0, 100, 200, 500, 846, 900, 0, 0, 0, 0, 0, 0, 0, 999,
    ]);
  });

  test("test_bomb_at_boundary", () => {
    const random = new Random(0n);
    const game = createTestGame([
      1, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 999,
    ]);
    new Bomb().apply(game, 9, random);
    expect(game.slots).toEqual([
      120, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 503,
    ]);
  });

  test("test_bomb_even", () => {
    const random = new Random(0n);
    const game = createTestGame([
      1, 0, 0, 0, 0, 0, 0, 500, 500, 500, 500, 500, 0, 0, 0, 0, 0, 0, 0, 999,
    ]);
    new Bomb().apply(game, 9, random);
    expect(game.slots).toEqual([
      1, 0, 0, 0, 0, 0, 0, 500, 500, 500, 500, 500, 0, 0, 0, 0, 0, 0, 0, 999,
    ]);
  });

  test("test_bomb_almost_even", () => {
    const random = new Random(0n);
    const game = createTestGame([
      1, 0, 0, 0, 0, 0, 0, 499, 499, 500, 501, 501, 0, 0, 0, 0, 0, 0, 0, 999,
    ]);
    new Bomb().apply(game, 9, random);
    expect(game.slots).toEqual([
      1, 0, 0, 0, 0, 0, 0, 499, 500, 500, 501, 501, 0, 0, 0, 0, 0, 0, 0, 999,
    ]);
  });

  test("test_bomb_left_only", () => {
    const random = new Random(0n);
    const game = createTestGame([
      0, 0, 0, 0, 0, 0, 0, 250, 0, 500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
    new Bomb().apply(game, 9, random);
    expect(game.slots).toEqual([
      0, 0, 0, 0, 0, 0, 0, 120, 0, 500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
  });

  test("test_bomb_right_only", () => {
    const random = new Random(0n);
    const game = createTestGame([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0, 0, 0, 0, 750, 0, 0, 0, 0, 0,
    ]);
    new Bomb().apply(game, 9, random);
    expect(game.slots).toEqual([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0, 0, 0, 0, 619, 0, 0, 0, 0, 0,
    ]);
  });
});
