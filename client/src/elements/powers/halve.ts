import { Game } from "@/models/game";
import { Verifier } from "@/helpers";

/**
 * Halve power implementation
 * Equivalent to elements/powers/halve.cairo
 */
export class Halve {
  static apply(game: Game): void {
    game.number = Halve.halve(game.number);
  }

  static rescue(game: Game): boolean {
    const modifiedNumber = Halve.halve(game.number);
    return !Verifier.isOver(
      modifiedNumber,
      game.level,
      game.slot_count,
      game.slots,
    );
  }

  private static halve(number: number): number {
    return Math.floor(number / 2);
  }
}
