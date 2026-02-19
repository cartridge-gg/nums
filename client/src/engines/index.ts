import { Game } from "@/models/game";
import { Random } from "@/helpers/random";

/**
 * Game engine that handles game actions
 * Equivalent to components/playable.cairo InternalImpl
 *
 * This engine provides pure game modification actions without:
 * - Store/world interactions
 * - Quest/starterpack functionality
 * - Rewards and token transfers
 * - Collection and ownership checks
 */
export class GameEngine {
  /**
   * Starts a new game
   * Equivalent to GameTrait::start in models/game.cairo
   *
   * @param game - The game instance to start
   * @param rand - The random number generator
   */
  static start(game: Game, rand: Random): void {
    // [Check] Game has not started yet
    if (game.number !== 0) {
      throw new Error("Game: already started");
    }
    // [Effect] Start the game
    game.start(rand);
  }

  /**
   * Sets a number in the specified slot for a game
   * Equivalent to PlayableComponent::InternalImpl::set
   *
   * @param game - The game instance to modify
   * @param index - The slot index where to place the number
   * @param rand - The random number generator
   * @param targetSupply - The target supply for reward calculation
   * @returns The next number after placement
   */
  static set(
    game: Game,
    index: number,
    rand: Random,
    targetSupply: bigint,
  ): number {
    // [Check] Game state
    if (game.number === 0) {
      throw new Error("Game: has not started");
    }
    // Check if game is over (using over field, like Cairo's assert_not_over)
    // A game can be over but still rescuable, so we check over field instead of isOver()
    if (game.over !== 0) {
      throw new Error("Game: is over");
    }
    if (game.isExpired()) {
      throw new Error("Game: has expired");
    }

    // [Effect] Place number
    game.place(game.number, index, rand);

    // [Check] Game is valid after placement
    if (!game.isValid()) {
      throw new Error("Game: invalid state after placement");
    }

    // [Effect] Update game
    game.update(rand, targetSupply);

    // [Return] Next number
    return game.number;
  }

  /**
   * Selects a power for a game
   * Equivalent to PlayableComponent::InternalImpl::select
   *
   * @param game - The game instance to modify
   * @param index - The index of the power to select from selectable_powers
   */
  static select(game: Game, index: number): void {
    // [Check] Game state
    if (game.number === 0) {
      throw new Error("Game: has not started");
    }
    // Check if game is over (using over field, like Cairo's assert_not_over)
    // A game can be over but still rescuable, so we check over field instead of isOver()
    if (game.over !== 0) {
      throw new Error("Game: is over");
    }
    if (game.isExpired()) {
      throw new Error("Game: has expired");
    }

    // [Effect] Select power
    game.select(index);
  }

  /**
   * Applies a power to the game
   * Equivalent to PlayableComponent::InternalImpl::apply
   *
   * @param game - The game instance to modify
   * @param index - The index of the power to apply from selected_powers
   * @param rand - The random number generator
   * @returns The next number after applying the power
   */
  static apply(game: Game, index: number, rand: Random): number {
    // [Check] Game state
    if (game.number === 0) {
      throw new Error("Game: has not started");
    }
    // Check if game is over (using over field, like Cairo's assert_not_over)
    // A game can be over but still rescuable, so we check over field instead of isOver()
    if (game.over !== 0) {
      throw new Error("Game: is over");
    }
    if (game.isExpired()) {
      throw new Error("Game: has expired");
    }

    // [Effect] Apply power
    game.applyPower(index, rand);

    // [Return] Next number
    return game.number;
  }

  /**
   * Claims the game reward
   * Equivalent to PlayableComponent::InternalImpl::claim
   *
   * Note: This only calculates and marks the game as claimed.
   * Token transfers are not handled here (handled by the contract).
   *
   * @param game - The game instance to modify
   * @returns The reward amount
   */
  static claim(game: Game): number {
    // [Check] Game state
    if (game.number === 0) {
      throw new Error("Game: has not started");
    }
    if (!game.isOver() && !game.isExpired()) {
      throw new Error("Game: not claimable");
    }
    if (game.claimed) {
      throw new Error("Game: is claimed");
    }

    // [Effect] Claim game
    const reward = game.claim();

    // [Return] Reward amount
    return reward;
  }
}
