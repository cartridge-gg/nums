import { Game } from "@/models/game";
import { Random } from "@/helpers/random";

/**
 * Foresight power implementation
 * Equivalent to elements/powers/foresight.cairo
 */
export class Foresight {
  static apply(game: Game, rand: Random): void {
    // [Effect] Reveal the next number
    game.next_number = game.next(game.slots, rand);
  }

  static rescue(_game: Game): boolean {
    // Foresight cannot rescue the game
    return false;
  }
}
