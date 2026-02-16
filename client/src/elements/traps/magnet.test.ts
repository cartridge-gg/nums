import { describe, test, expect } from "vitest";
import { Magnet } from "./magnet";
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

describe("Magnet", () => {
  test("test_magnet_basic_left", () => {
    const random = new Random(0n);
    const game = createTestGame([
      100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
    new Magnet().apply(game, 9, random);
    expect(game.slots).toEqual([
      0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
  });

  test("test_magnet_basic_right", () => {
    const random = new Random(0n);
    const game = createTestGame([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500,
    ]);
    new Magnet().apply(game, 9, random);
    expect(game.slots).toEqual([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0,
    ]);
  });

  test("test_magnet_both_sides", () => {
    const random = new Random(0n);
    const game = createTestGame([
      100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500,
    ]);
    new Magnet().apply(game, 9, random);
    expect(game.slots).toEqual([
      0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0,
    ]);
  });

  test("test_magnet_no_slots", () => {
    const random = new Random(0n);
    const game = createTestGame(
      Array.from({ length: DEFAULT_SLOT_COUNT }, () => 0),
    );
    new Magnet().apply(game, 9, random);
    expect(game.slots).toEqual(
      Array.from({ length: DEFAULT_SLOT_COUNT }, () => 0),
    );
  });

  test("test_magnet_already_close", () => {
    const random = new Random(0n);
    const game = createTestGame([
      0, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500,
    ]);
    new Magnet().apply(game, 9, random);
    // Left slot at 8 should move to 9, but can't (max is slot_index - 1 = 8), so doesn't move
    // Right slot at 19 should move towards 9 (min is slot_index + 1 = 10)
    expect(game.slots).toEqual([
      0, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0,
    ]);
  });

  test("test_magnet_no_empty_slots_between", () => {
    const random = new Random(0n);
    const game = createTestGame([
      100, 200, 300, 400, 500, 600, 700, 800, 900, 0, 1000, 1100, 1200, 1300,
      1400, 1500, 1600, 1700, 1800, 1900,
    ]);
    new Magnet().apply(game, 9, random);
    // slot_index 9 is empty, left slot (8, 900) can move to max 8 (slot_index - 1), so doesn't
    // move right slot (10, 1000) can move to min 10 (slot_index + 1), so doesn't move
    expect(game.slots).toEqual([
      100, 200, 300, 400, 500, 600, 700, 800, 900, 0, 1000, 1100, 1200, 1300,
      1400, 1500, 1600, 1700, 1800, 1900,
    ]);
  });

  test("test_magnet_at_boundary_left", () => {
    const random = new Random(0n);
    const game = createTestGame([
      100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500,
    ]);
    new Magnet().apply(game, 0, random);
    // slot_index is 0, left slot at 0 can't move (already at max slot_index - 1 = -1, invalid),
    // right should move towards 0 (min at slot_index + 1 = 1)
    expect(game.slots).toEqual([
      100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0,
    ]);
  });

  test("test_magnet_at_boundary_right", () => {
    const random = new Random(0n);
    const game = createTestGame([
      100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500,
    ]);
    new Magnet().apply(game, 19, random);
    // slot_index is 19, left should move towards 19 (max at slot_index - 1 = 18), right slot at
    // 19 can't move (min at slot_index + 1 = 20, invalid)
    expect(game.slots).toEqual([
      0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500,
    ]);
  });

  test("test_magnet_slot_index_occupied", () => {
    const random = new Random(0n);
    const game = createTestGame([
      100, 0, 0, 0, 0, 0, 0, 0, 0, 250, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500,
    ]);
    new Magnet().apply(game, 9, random);
    // slot_index 9 is occupied, left should move to first empty towards 9 (max at 8), right
    // should move to last empty before 9 (min at 10, but no empty after 9, so moves to 8)
    expect(game.slots).toEqual([
      0, 100, 0, 0, 0, 0, 0, 0, 0, 250, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0,
    ]);
  });

  test("test_magnet_left_at_slot_index_minus_one", () => {
    const random = new Random(0n);
    const game = createTestGame([
      0, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500,
    ]);
    new Magnet().apply(game, 9, random);
    // Left slot at 8 (slot_index - 1) should not move, right should move towards 9
    expect(game.slots).toEqual([
      0, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0,
    ]);
  });

  test("test_magnet_right_at_slot_index_plus_one", () => {
    const random = new Random(0n);
    const game = createTestGame([
      100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
    new Magnet().apply(game, 9, random);
    // Right slot at 10 (slot_index + 1) should not move, left should move towards 9
    expect(game.slots).toEqual([
      0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
  });

  test("test_magnet_slot_index_first_with_both_sides", () => {
    const random = new Random(0n);
    const game = createTestGame([
      0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500,
    ]);
    new Magnet().apply(game, 0, random);
    expect(game.slots).toEqual([
      0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500,
    ]);
  });

  test("test_magnet_slot_index_last_with_both_sides", () => {
    const random = new Random(0n);
    const game = createTestGame([
      100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0,
    ]);
    new Magnet().apply(game, 19, random);
    expect(game.slots).toEqual([
      100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0,
    ]);
  });
});
