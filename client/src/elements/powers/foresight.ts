import { Game } from "@/models/game";

/**
 * Foresight power implementation
 * Equivalent to elements/powers/foresight.cairo
 */
export class Foresight {
  static apply(_game: Game): void {
    // Foresight reveals the next number but doesn't change the current game state
  }

  static rescue(_game: Game): boolean {
    // Foresight cannot rescue the game
    return false;
  }
}
