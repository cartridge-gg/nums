import { Game } from "@/models/game";

/**
 * Helper module for game state verification functions.
 * Equivalent to helpers/verifier.cairo
 */
export class Verifier {
  /**
   * Determines if the game has ended based on current state and configuration.
   *
   * This function checks multiple conditions to determine if the game is over:
   * 1. All slots have been filled (level equals slot_count)
   * 2. Game has not started yet (number is 0)
   * 3. There is a valid empty slot for the next number
   * 4. The last slot is filled (no more moves possible)
   *
   * @param number - The next number to be placed in the game.
   * @param level - The current level (number of slots filled).
   * @param slotCount - The total number of slots in the game.
   * @param slots - An array of numbers representing the current state of all slots (0 = empty).
   * @returns Returns `true` if the game is over, `false` otherwise.
   */
  static isOver(
    number: number,
    level: number,
    slotCount: number,
    slots: number[],
  ): boolean {
    // [Check] All slots have been filled
    if (level === slotCount) {
      return true;
    }

    // [Check] Game is not started yet
    if (number === 0) {
      return false;
    }

    // [Check] There is a valid empty slot for next number
    const max = slotCount - 1;
    let idx = 0;
    let slot = slots[idx];
    let prevNumber = 0;

    while (idx < max) {
      const nextSlot = slots[idx + 1];
      if (slot === 0 && number <= nextSlot && number >= prevNumber) {
        return false;
      }
      if (slot !== 0 && number < slot) {
        return true;
      }
      prevNumber = slot;
      slot = nextSlot;
      idx += 1;
    }

    // [Check] Over if last slot is not empty
    return slot !== 0;
  }

  /**
   * Validates that the slots array is in valid order (ascending or equal).
   *
   * This function checks if all filled slots are in ascending order.
   * Empty slots (value 0) are ignored in the validation.
   *
   * @param slots - An array of numbers representing the current state of all slots (0 = empty).
   * @returns Returns `true` if slots are valid (ascending order), `false` otherwise.
   */
  static isValid(slots: number[]): boolean {
    const len = slots.length;
    for (let idx = 0; idx < len - 1; idx++) {
      const current = slots[idx];
      const next = slots[idx + 1];
      if (next !== 0 && current > next) {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns the largest streak of consecutive numbers in the game.
   *
   * This function calculates the longest sequence of consecutive non-zero numbers
   * in the slots array. Empty slots (value 0) are skipped.
   *
   * @param slots - An array of numbers representing the current state of all slots (0 = empty).
   * @returns The length of the longest consecutive streak.
   */
  static streak(slots: number[]): number {
    let count = 0;
    let streak = 0;
    let previousNumber = 0;
    const len = slots.length;

    for (let idx = 0; idx < len; idx++) {
      const slot = slots[idx];
      if (slot === 0) {
        continue;
      }
      if (previousNumber !== 0 && slot === previousNumber + 1) {
        count += 1;
      } else {
        if (count > streak) {
          streak = count;
        }
        count = 1;
      }
      previousNumber = slot;
    }

    if (count > streak) {
      return count;
    }
    return streak;
  }

  /**
   * Determines if the game is rescuable based on the available powers.
   *
   * This function checks if any of the selected powers can rescue the game
   * by finding a valid empty slot for the next number.
   *
   * @param game - A Game instance.
   * @returns Returns `true` if the game can be rescued, `false` otherwise.
   */
  static isRescuable(game: Game): boolean {
    // Check each selected power
    for (let index = 0; index < game.selected_powers.length; index++) {
      // Check if power is available (not used)
      // In the Game model, available_powers is a boolean array where true means used
      if (!game.available_powers[index]) {
        continue; // Power is already used
      }

      const power = game.selected_powers[index];
      if (power.rescue(game)) {
        return true;
      }
    }

    return false;
  }
}
