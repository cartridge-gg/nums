import type { Game } from "@/models/game";
import type { TrapTrait, Random } from "./interface";

export class Magnet implements TrapTrait {
  apply(game: Game, slotIndex: number, rand: Random): void {
    const slots = game.slots;
    // [Compute] Find the nearest number to the left
    for (let index = slotIndex - 1; index >= 0; index--) {
      const slot = slots[index];
      if (index + 1 === slotIndex && slot !== 0) {
        break;
      } else if (slot !== 0) {
        game.move(index, index + 1, rand);
        break;
      }
    }
    // [Compute] Find the nearest number to the right
    for (let index = slotIndex + 1; index < slots.length; index++) {
      const slot = slots[index];
      if (index - 1 === slotIndex && slot !== 0) {
        break;
      } else if (slot !== 0) {
        game.move(index, index - 1, rand);
        break;
      }
    }
  }
}
