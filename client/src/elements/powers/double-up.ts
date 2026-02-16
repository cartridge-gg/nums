import { Game } from "@/models/game";
import { Random } from "@/helpers/random";
import { Verifier } from "@/helpers";

/**
 * DoubleUp power implementation
 * Equivalent to elements/powers/double_up.cairo
 */
export class DoubleUp {
  static apply(game: Game, _rand: Random): void {
    game.number = DoubleUp.double(game.number);
  }

  static rescue(game: Game): boolean {
    const modifiedNumber = DoubleUp.double(game.number);
    return !Verifier.isOver(
      modifiedNumber,
      game.level,
      game.slot_count,
      game.slots,
    );
  }

  private static double(number: number): number {
    return Math.min(number * 2, 999);
  }
}
