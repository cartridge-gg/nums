import { Game } from "@/models/game";

/**
 * Reroll power implementation
 * Equivalent to elements/powers/reroll.cairo
 */
export class Reroll {
  static apply(_game: Game): void {
    // Reroll doesn't modify the game directly in the rescue context
    // The actual apply would generate a new number, but for rescue we just return true
  }

  static rescue(_game: Game): boolean {
    // Reroll always rescues the game by generating a new number
    return true;
  }
}
