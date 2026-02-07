import { Game } from "@/models/game";

/**
 * Power static methods interface
 * Equivalent to elements/powers/interface.cairo
 */
export interface PowerStaticMethods {
  /**
   * Apply the power to the game
   * @param game - The game to apply the power to
   */
  apply(game: Game): void;

  /**
   * Check if the power can rescue the game
   * @param game - The game state
   * @returns true if the power can rescue the game
   */
  rescue(game: Game): boolean;
}
