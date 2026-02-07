import { Game } from "@/models/game";

/**
 * Low power implementation
 * Equivalent to elements/powers/low.cairo
 */
export class Low {
  static apply(_game: Game): void {
    // Low power modifies slot_max temporarily and generates a new number
    // For rescue, we check if there's a valid empty slot for a lower number
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
