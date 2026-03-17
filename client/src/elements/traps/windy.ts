import type { Game } from "@/models/game";
import type { TrapTrait, Random } from "./interface";

export class Windy implements TrapTrait {
  apply(game: Game, slotIndex: number, rand: Random): void {
    const slots = game.slots;

    // [Compute] Find the nearest number to the left and push it away
    for (let index = slotIndex - 1; index > 0; index--) {
      const slot = slots[index];
      if (slot !== 0 && slots[index - 1] === 0) {
        game.move(index, index - 1, rand);
        break;
      } else if (slot !== 0) {
        break;
      }
    }

    // [Compute] Find the nearest number to the right and push it away
    for (let index = slotIndex + 1; index < slots.length - 1; index++) {
      const slot = slots[index];
      if (slot !== 0 && slots[index + 1] === 0) {
        game.move(index, index + 1, rand);
        break;
      } else if (slot !== 0) {
        break;
      }
    }
  }
}
