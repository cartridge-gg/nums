import { Game } from "@/models/game";
import { TrapTrait, Random } from "./interface";

/**
 * Windy trap implementation
 * Equivalent to elements/traps/windy.cairo
 */
export class Windy implements TrapTrait {
  /**
   * Apply the windy trap effect
   * Pushes the two nearest set numbers away from this tile
   */
  apply(game: Game, slotIndex: number, rand: Random): void {
    // [Effect] Push the nearest numbers away from slot_index
    const slots = game.slots;

    // [Compute] Find the nearest number to the left
    for (let index = slotIndex - 1; index > 0; index--) {
      const slot = slots[index];
      if (slot !== 0 && slots[index - 1] === 0) {
        const from = index;
        this.moveSlot(game, from, from - 1, rand);
        break;
      } else if (slot !== 0) {
        break;
      }
    }

    // [Compute] Find the nearest number to the right
    for (let index = slotIndex + 1; index < slots.length - 1; index++) {
      const slot = slots[index];
      if (slot !== 0 && slots[index + 1] === 0) {
        const from = index;
        this.moveSlot(game, from, from + 1, rand);
        break;
      } else if (slot !== 0) {
        break;
      }
    }
  }

  /**
   * Move a slot from one index to another
   * Equivalent to game.move in Cairo
   */
  private moveSlot(game: Game, from: number, to: number, rand: Random): void {
    // [Check] Index is valid
    if (
      from < 0 ||
      from >= game.slot_count ||
      to < 0 ||
      to >= game.slot_count
    ) {
      return;
    }
    // [Effect] Move number
    const slot = game.slots[from];
    game.slots[from] = 0;
    this.placeSlot(game, slot, to, rand);
  }

  /**
   * Place a number in a slot
   * Equivalent to game.place in Cairo
   */
  private placeSlot(
    game: Game,
    number: number,
    index: number,
    _rand: Random,
  ): void {
    // [Check] Index is valid
    if (index < 0 || index >= game.slot_count) {
      return;
    }
    // [Check] Target slot is empty
    if (game.slots[index] !== 0) {
      return;
    }
    // [Effect] Place number
    game.slots[index] = number;
  }
}
