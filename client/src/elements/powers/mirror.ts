import { Game } from "@/models/game";
import { Verifier } from "@/helpers";

/**
 * Mirror power implementation
 * Equivalent to elements/powers/mirror.cairo
 */
export class Mirror {
  static apply(game: Game): void {
    game.number = Mirror.mirror(game.number, game.slot_min, game.slot_max);
  }

  static rescue(game: Game): boolean {
    const modifiedNumber = Mirror.mirror(
      game.number,
      game.slot_min,
      game.slot_max,
    );
    return !Verifier.isOver(
      modifiedNumber,
      game.level,
      game.slot_count,
      game.slots,
    );
  }

  private static mirror(
    number: number,
    slotMin: number,
    slotMax: number,
  ): number {
    const amplitude = slotMax + slotMin;
    if (number > amplitude) {
      return slotMin;
    } else {
      return amplitude - number;
    }
  }
}
