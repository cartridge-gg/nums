import { describe, test, expect } from "vitest";
import { Ufo } from "./ufo";
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

describe("Ufo", () => {
  test("test_ufo_basic_left", () => {
    const random = new Random(0n);
    const game = createTestGame([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 250, 300, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
    new Ufo().apply(game, 9, random);
    expect(game.slots).toEqual([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 250, 300, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
  });

  test("test_ufo_no_position_available", () => {
    const random = new Random(0n);
    const game = createTestGame([
      100, 250, 300, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500,
    ]);
    new Ufo().apply(game, 1, random);
    expect(game.slots).toEqual([
      100, 250, 300, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500,
    ]);
  });

  test("test_ufo_slot_index_at_boundary_left_no_filled_left", () => {
    const random = new Random(0n);
    const game = createTestGame([
      250, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500,
    ]);
    new Ufo().apply(game, 0, random);
    // The slot at index 0 (250) should be moved somewhere between 0 and 19
    // The exact position depends on random generation, so we check:
    // 1. The slot at index 0 should be empty
    expect(game.slots[0]).toBe(0);
    // 2. The value 250 should be somewhere between index 0 and 19
    const newIndex = game.slots.indexOf(250);
    expect(newIndex).toBeGreaterThanOrEqual(0);
    expect(newIndex).toBeLessThan(19); // Should be before the slot with 500
    // 3. The slot with 500 should remain at index 19
    expect(game.slots[19]).toBe(500);
  });

  test("test_ufo_slot_index_at_boundary_left_with_filled_left", () => {
    const random = new Random(0n);
    const game = createTestGame([
      250, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500,
    ]);
    new Ufo().apply(game, 0, random);
    expect(game.slots).toEqual([
      250, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500,
    ]);
  });

  test("test_ufo_slot_index_at_boundary_right_no_filled_right", () => {
    const random = new Random(0n);
    const game = createTestGame([
      100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 250,
    ]);
    new Ufo().apply(game, 19, random);
    expect(game.slots).toEqual([
      100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 250, 0, 0,
    ]);
  });

  test("test_ufo_slot_index_at_boundary_right_with_filled_right", () => {
    const random = new Random(0n);
    const game = createTestGame([
      100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 250,
    ]);
    new Ufo().apply(game, 19, random);
    expect(game.slots).toEqual([
      100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 250,
    ]);
  });

  test("test_ufo_no_filled_slots", () => {
    const random = new Random(0n);
    const game = createTestGame([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 250, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
    new Ufo().apply(game, 9, random);
    expect(game.slots).toEqual([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 250,
    ]);
  });

  test("test_ufo_only_filled_left", () => {
    const random = new Random(0n);
    const game = createTestGame([
      100, 0, 0, 0, 0, 0, 0, 0, 0, 250, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
    new Ufo().apply(game, 9, random);
    expect(game.slots).toEqual([
      100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 250, 0, 0,
    ]);
  });

  test("test_ufo_only_filled_right", () => {
    const random = new Random(0n);
    const game = createTestGame([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 250, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500,
    ]);
    new Ufo().apply(game, 9, random);
    expect(game.slots).toEqual([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 250, 0, 0, 500,
    ]);
  });

  test("test_ufo_small_range", () => {
    const random = new Random(0n);
    const game = createTestGame([
      0, 0, 0, 0, 0, 0, 0, 0, 100, 250, 500, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
    new Ufo().apply(game, 9, random);
    expect(game.slots).toEqual([
      0, 0, 0, 0, 0, 0, 0, 0, 100, 250, 500, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
  });

  test("test_ufo_large_range", () => {
    const random = new Random(0n);
    const game = createTestGame([
      100, 0, 0, 0, 0, 0, 0, 0, 0, 250, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500,
    ]);
    new Ufo().apply(game, 9, random);
    expect(game.slots).toEqual([
      100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 250, 500,
    ]);
  });
});
