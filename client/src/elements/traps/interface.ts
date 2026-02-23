import type { Game } from "@/models/game";

/**
 * Trap trait interface
 * Equivalent to elements/traps/interface.cairo
 */
export interface TrapTrait {
  /**
   * Apply the trap to the game
   * @param game - The game to apply the trap to
   * @param slotIndex - The index of the slot where the trap is triggered
   * @param rand - The random number generator
   */
  apply(game: Game, slotIndex: number, rand: Random): void;
}

/**
 * Random interface for trap operations
 * This is a simplified interface that traps need from Random
 */
export interface Random {
  /**
   * Generate a random number between min and max (inclusive)
   */
  between(min: number, max: number): number;

  /**
   * Generate next seed for random number generation
   */
  nextSeed(): bigint;
}
