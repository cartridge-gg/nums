import type { Game } from "@/models/game";
import type { TrapTrait, Random } from "./interface";

export class Ufo implements TrapTrait {
  apply(game: Game, slotIndex: number, rand: Random): void {
    const slots = game.slots;

    // [Compute] Find the nearest empty slot to the left
    let leftIndex = slotIndex;
    for (let index = slotIndex - 1; index >= 0; index--) {
      const slot = slots[index];
      if (slot !== 0) {
        break;
      } else {
        leftIndex = index;
      }
    }

    // [Compute] Find the nearest empty slot to the right
    let rightIndex = slotIndex;
    for (let index = slotIndex + 1; index < slots.length; index++) {
      const slot = slots[index];
      if (slot !== 0) {
        break;
      } else {
        rightIndex = index;
      }
    }

    // [Effect] Move the slot at slotIndex somewhere between the nearest numbers
    const newIndex = rand.between(leftIndex, rightIndex);
    game.move(slotIndex, newIndex, rand);
  }
}
