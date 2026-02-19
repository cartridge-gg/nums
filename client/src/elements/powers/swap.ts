import { Game } from "@/models/game";
import { Random } from "@/helpers/random";
import { Verifier } from "@/helpers";

/**
 * Swap power implementation
 * Equivalent to elements/powers/swap.cairo
 */
export class Swap {
  static apply(game: Game, _rand: Random): void {
    const [number, next] = Swap.swap(game.number, game.next_number);
    game.number = number;
    game.next_number = next;
  }

  static rescue(game: Game): boolean {
    const [number] = Swap.swap(game.number, game.next_number);
    return !Verifier.isOver(number, game.level, game.slot_count, game.slots);
  }

  private static swap(number: number, next: number): [number, number] {
    return [next, number];
  }
}
