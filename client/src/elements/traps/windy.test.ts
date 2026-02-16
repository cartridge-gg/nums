import { describe, test, expect } from "vitest";
import { Windy } from "./windy";
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

describe("Windy", () => {
  test("test_windy_basic_left", () => {
    const random = new Random(0n);
    const game = createTestGame([
      100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
    new Windy().apply(game, 9, random);
    // Left slot at 0 should move away from slot_index (9) to the left, but already at boundary
    expect(game.slots).toEqual([
      100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
  });

  test("test_windy_basic_right", () => {
    const random = new Random(0n);
    const game = createTestGame([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500,
    ]);
    new Windy().apply(game, 9, random);
    // Right slot at 19 should move away from slot_index (9) to the right, but already at
    // boundary
    expect(game.slots).toEqual([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500,
    ]);
  });

  test("test_windy_both_sides", () => {
    const random = new Random(0n);
    const game = createTestGame([
      100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500,
    ]);
    new Windy().apply(game, 9, random);
    // Left slot at 0 can't move (boundary), right slot at 19 can't move (boundary)
    expect(game.slots).toEqual([
      100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500,
    ]);
  });

  test("test_windy_move_left_away", () => {
    const random = new Random(0n);
    const game = createTestGame([
      0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
    new Windy().apply(game, 9, random);
    // Left slot at 1 should move away from slot_index (9) to the left (to index 0)
    expect(game.slots).toEqual([
      100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
  });

  test("test_windy_move_right_away", () => {
    const random = new Random(0n);
    const game = createTestGame([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0,
    ]);
    new Windy().apply(game, 9, random);
    // Right slot at 18 should move away from slot_index (9) to the right (to index 19)
    expect(game.slots).toEqual([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500,
    ]);
  });

  test("test_windy_target_occupied", () => {
    const random = new Random(0n);
    const game = createTestGame([
      200, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
    new Windy().apply(game, 9, random);
    // Left slot at 1 should move to 0, but 0 is occupied, so it doesn't move
    expect(game.slots).toEqual([
      200, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
  });

  test("test_windy_no_slots", () => {
    const random = new Random(0n);
    const game = createTestGame(
      Array.from({ length: DEFAULT_SLOT_COUNT }, () => 0),
    );
    new Windy().apply(game, 9, random);
    expect(game.slots).toEqual(
      Array.from({ length: DEFAULT_SLOT_COUNT }, () => 0),
    );
  });

  test("test_windy_slot_index_occupied", () => {
    const random = new Random(0n);
    const game = createTestGame([
      0, 100, 0, 0, 0, 0, 0, 0, 0, 250, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0,
    ]);
    new Windy().apply(game, 9, random);
    // Left slot at 1 should move to 0, right slot at 18 should move to 19
    expect(game.slots).toEqual([
      100, 0, 0, 0, 0, 0, 0, 0, 0, 250, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500,
    ]);
  });

  test("test_windy_slot_index_first_with_right_slot", () => {
    const random = new Random(0n);
    const game = createTestGame([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500,
    ]);
    new Windy().apply(game, 0, random);
    // slot_index is 0 (first), no left slot possible, right slot at 19 should move away from 0
    // to the right, but already at boundary
    expect(game.slots).toEqual([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500,
    ]);
  });

  test("test_windy_slot_index_first_with_right_slot_close", () => {
    const random = new Random(0n);
    const game = createTestGame([
      0, 500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
    new Windy().apply(game, 0, random);
    // slot_index is 0 (first), right slot at 1 should move away from 0 to the right (to index
    // 2)
    expect(game.slots).toEqual([
      0, 0, 500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
  });

  test("test_windy_slot_index_first_with_right_slot_target_occupied", () => {
    const random = new Random(0n);
    const game = createTestGame([
      0, 500, 200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
    new Windy().apply(game, 0, random);
    // slot_index is 0 (first), right slot at 1 should move to 2, but 2 is occupied, so it
    // doesn't move
    expect(game.slots).toEqual([
      0, 500, 200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
  });

  test("test_windy_slot_index_last_with_left_slot", () => {
    const random = new Random(0n);
    const game = createTestGame([
      100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
    new Windy().apply(game, 19, random);
    // slot_index is 19 (last), left slot at 0 should move away from 19 to the left, but already
    // at boundary
    expect(game.slots).toEqual([
      100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
  });

  test("test_windy_slot_index_last_with_left_slot_close", () => {
    const random = new Random(0n);
    const game = createTestGame([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 0,
    ]);
    new Windy().apply(game, 19, random);
    // slot_index is 19 (last), left slot at 18 should move away from 19 to the left (to index
    // 17)
    expect(game.slots).toEqual([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0,
    ]);
  });

  test("test_windy_slot_index_last_with_left_slot_target_occupied", () => {
    const random = new Random(0n);
    const game = createTestGame([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 100, 0,
    ]);
    new Windy().apply(game, 19, random);
    // slot_index is 19 (last), left slot at 18 should move to 17, but 17 is occupied, so it
    // doesn't move
    expect(game.slots).toEqual([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 100, 0,
    ]);
  });

  test("test_windy_slot_index_first_with_both_sides", () => {
    const random = new Random(0n);
    const game = createTestGame([
      0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500,
    ]);
    new Windy().apply(game, 0, random);
    // slot_index is 0 (first), left slot at 1 is actually to the right, so it should move right
    // to 2 Right slot at 19 should move away from 0 to the right, but already at boundary
    expect(game.slots).toEqual([
      0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500,
    ]);
  });

  test("test_windy_slot_index_last_with_both_sides", () => {
    const random = new Random(0n);
    const game = createTestGame([
      100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0,
    ]);
    new Windy().apply(game, 19, random);
    // slot_index is 19 (last), left slot at 0 should move away from 19 to the left, but already
    // at boundary Right slot at 18 should move to 17 (away from 19)
    expect(game.slots).toEqual([
      100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0, 0,
    ]);
  });
});
