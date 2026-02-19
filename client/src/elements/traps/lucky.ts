import { Game } from "@/models/game";
import { TrapTrait, Random } from "./interface";

/**
 * Lucky trap implementation
 * Equivalent to elements/traps/lucky.cairo
 */
export class Lucky implements TrapTrait {
  /**
   * Apply the lucky trap effect
   * Rerolls this tile after a number is placed here
   */
  apply(game: Game, slotIndex: number, rand: Random): void {
    // [Effect] Take the nearest number and shuffle them
    const slots = game.slots;
    // [Compute] Find the nearest number to the left
    let previous = game.slot_min;
    for (let idx = slotIndex - 1; idx >= 0; idx--) {
      const slot = slots[idx];
      if (slot !== 0) {
        previous = slot;
        break;
      }
    }
    // [Compute] Find the nearest number to the right
    let next = game.slot_max;
    for (let idx = slotIndex + 1; idx < slots.length; idx++) {
      const slot = slots[idx];
      if (slot !== 0) {
        next = slot;
        break;
      }
    }
    // [Effect] Shuffle the slot at index
    const slot = rand.between(previous, next);
    game.slots[slotIndex] = slot;
  }
}
