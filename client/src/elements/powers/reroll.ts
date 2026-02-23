import type { Game } from "@/models/game";
import type { Random } from "@/helpers/random";

/**
 * Reroll power implementation
 * Equivalent to elements/powers/reroll.cairo
 */
export class Reroll {
  static apply(game: Game, rand: Random): void {
    // [Effect] Generate a new number
    game.number = game.next(game.slots, rand);
  }

  static rescue(_game: Game): boolean {
    // Reroll always rescues the game by generating a new number
    return true;
  }
}
