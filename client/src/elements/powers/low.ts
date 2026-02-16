import { Game } from "@/models/game";
import { Random } from "@/helpers/random";

/**
 * Low power implementation
 * Equivalent to elements/powers/low.cairo
 */
export class Low {
  static apply(game: Game, rand: Random): void {
    // [Effect] Temporarily modify slot_max and generate a new number
    const slotMax = game.slot_max;
    game.slot_max = game.number;
    game.number = game.next(game.slots, rand);
    game.slot_max = slotMax;
  }

  static rescue(game: Game): boolean {
    // [Check] There is a valid empty slot for next number
    const max = game.slot_count - 1;
    const number = game.number;
    const slots = game.slots;
    let idx = 0;
    let slot = slots[idx];

    while (idx < max && slot <= number) {
      const nextSlot = slots[idx + 1];
      if (slot === 0) {
        return true;
      }
      slot = nextSlot;
      idx += 1;
    }

    // [Check] Rescuable if last slot is empty
    return slot === 0;
  }
}
