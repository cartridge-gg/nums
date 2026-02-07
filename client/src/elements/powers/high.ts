import { Game } from "@/models/game";

/**
 * High power implementation
 * Equivalent to elements/powers/high.cairo
 */
export class High {
  static apply(_game: Game): void {
    // High power modifies slot_min temporarily and generates a new number
    // For rescue, we check if there's a valid empty slot for a higher number
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
