import { Game } from "@/models/game";
import { TrapTrait, Random } from "./interface";

/**
 * Bomb trap implementation
 * Equivalent to elements/traps/bomb.cairo
 */
export class Bomb implements TrapTrait {
  /**
   * Apply the bomb trap effect
   * Rerolls the two nearest set numbers after a number is placed here
   */
  apply(game: Game, slotIndex: number, rand: Random): void {
    // [Effect] Take the nearest number and shuffle them
    const slots = game.slots;
    // [Compute] Find the nearest number to the left
    let previousIndex = 0;
    let previousSlot = game.slot_min;
    let previousPreviousSlot = 0;
    for (let index = 0; index < slotIndex; index++) {
      const slot = slots[index];
      if (slot !== 0) {
        previousPreviousSlot = previousSlot;
        previousSlot = slot;
        previousIndex = index;
      }
    }
    // [Compute] Find the nearest number to the right
    let nextIndex = 0;
    let nextSlot = game.slot_max;
    let nextNextSlot = 0;
    for (let index = slots.length - 1; index > slotIndex; index--) {
      const slot = slots[index];
      if (slot !== 0) {
        nextNextSlot = nextSlot;
        nextSlot = slot;
        nextIndex = index;
      }
    }
    // [Effect] Shuffle the 2 nearest numbers
    const trapSlot = slots[slotIndex];
    const newSlots = slots.map((slot, index) => {
      if (index === previousIndex && previousPreviousSlot !== 0) {
        return rand.between(previousPreviousSlot, trapSlot);
      } else if (index === nextIndex && nextNextSlot !== 0) {
        return rand.between(trapSlot, nextNextSlot);
      } else {
        return slot;
      }
    });
    game.slots = newSlots;
  }
}
