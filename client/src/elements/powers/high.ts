import type { Game } from "@/models/game";
import type { Random } from "@/helpers/random";

/**
 * High power implementation
 * Equivalent to elements/powers/high.cairo
 */
export class High {
  static apply(game: Game, rand: Random): void {
    // [Effect] Temporarily modify slot_min and generate a new number
    const slotMin = game.slot_min;
    game.slot_min = game.number;
    game.number = game.next(game.slots, rand);
    game.slot_min = slotMin;
  }

  static rescue(game: Game): boolean {
    // [Check] There is a valid empty slot for next number
    const min = 0;
    const number = game.number;
    const slots = game.slots;
    let idx = game.slot_count - 1;
    let slot = slots[idx];

    while (idx > min && slot >= number) {
      const previousSlot = slots[idx - 1];
      if (slot === 0) {
        return true;
      }
      slot = previousSlot;
      idx -= 1;
    }

    // [Check] Rescuable if last slot is empty
    return slot === 0;
  }
}
