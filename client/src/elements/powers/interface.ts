import { Game } from "@/models/game";
import { Random } from "@/helpers/random";

/**
 * Power static methods interface
 * Equivalent to elements/powers/interface.cairo
 */
export interface PowerStaticMethods {
  /**
   * Apply the power to the game
   * @param game - The game to apply the power to
   * @param rand - The random number generator
   */
  apply(game: Game, rand: Random): void;

  /**
   * Check if the power can rescue the game
   * @param game - The game state
   * @returns true if the power can rescue the game
   */
  rescue(game: Game): boolean;
}
