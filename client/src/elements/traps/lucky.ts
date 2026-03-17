import type { Game } from "@/models/game";
import type { TrapTrait, Random } from "./interface";

export class Lucky implements TrapTrait {
  apply(game: Game, slotIndex: number, rand: Random): void {
    game.shuffle(slotIndex, rand);
  }
}
