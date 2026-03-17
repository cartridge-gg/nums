import type { Game } from "@/models/game";
import type { Random } from "@/helpers/random";

export type { Random };

export interface TrapTrait {
  apply(game: Game, slotIndex: number, rand: Random): void;
}
