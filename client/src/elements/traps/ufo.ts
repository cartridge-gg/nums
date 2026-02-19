import { Game } from "@/models/game";
import { TrapTrait, Random } from "./interface";

/**
 * UFO trap implementation
 * Equivalent to elements/traps/ufo.cairo
 */
export class Ufo implements TrapTrait {
  /**
   * Apply the UFO trap effect
   * Moves this tile to a random slot after a number is placed here
   */
  apply(game: Game, slotIndex: number, rand: Random): void {
    // [Effect] Push the nearest numbers away from slot_index
    const slots = game.slots;

    // [Compute] Find the nearest number to the left
    let leftIndex = slotIndex;
    for (let index = slotIndex - 1; index >= 0; index--) {
      const slot = slots[index];
      if (slot !== 0) {
        break;
      } else {
        leftIndex = index;
      }
    }

    // [Compute] Find the nearest number to the right
    let rightIndex = slotIndex;
    for (let index = slotIndex + 1; index < slots.length; index++) {
      const slot = slots[index];
      if (slot !== 0) {
        break;
      } else {
        rightIndex = index;
      }
    }

    // [Effect] Move the slot at slot_index somewhere between the nearest numbers
    const newIndex = rand.between(leftIndex, rightIndex);
    this.moveSlot(game, slotIndex, newIndex, rand);
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
