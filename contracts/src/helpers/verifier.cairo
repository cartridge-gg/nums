use crate::helpers::bitmap::Bitmap;
use crate::helpers::packer::Packer;
use crate::models::game::Game;
use crate::types::power::{Power, PowerTrait};

/// Helper module for game state verification functions.
///
/// This module provides utility functions to verify game state conditions,
/// helping to reduce code duplication and improve maintainability.
#[generate_trait]
pub impl Verifier of VerifierTrait {
    /// Determines if the game has ended based on current state and configuration.
    ///
    /// This function checks multiple conditions to determine if the game is over:
    /// 1. All slots have been filled (level equals slot_count)
    /// 2. Game has not started yet (number is 0)
    /// 3. There is a valid empty slot for the next number
    /// 4. The last slot is filled (no more moves possible)
    ///
    /// # Arguments
    ///
    /// * `number` - The next number to be placed in the game.
    /// * `level` - The current level (number of slots filled).
    /// * `slot_count` - The total number of slots in the game.
    /// * `slots` - An array of u16 representing the current state of all slots (0 = empty).
    ///
    /// # Returns
    ///
    /// * `bool` - Returns `true` if the game is over, `false` otherwise.
    ///
    /// # Examples
    ///
    /// ```cairo
    /// // Game is over when all slots are filled
    /// let slots = array![10, 20, 30, 40, 50];
    /// assert(VerifierTrait::is_over(60, 5, 5, @slots) == true);
    ///
    /// // Game is not over when there's a valid empty slot
    /// let slots = array![10, 20, 0, 40, 50];
    /// assert(VerifierTrait::is_over(30, 4, 5, @slots) == false);
    /// ```
    #[inline]
    fn is_over(number: u16, level: u32, slot_count: u32, slots: @Array<u16>) -> bool {
        // [Check] All slots have been filled
        if level == slot_count {
            return true;
        }

        // [Check] Game is not started yet
        if number == 0 {
            return false;
        }

        // [Check] There is a valid empty slot for next number
        let max = slot_count - 1;
        let mut idx = 0;
        let mut slot = *slots.at(idx);
        let mut prev_number = 0;
        while idx < max {
            let next_slot = *slots.at(idx + 1);
            if slot == 0 && number <= next_slot && number >= prev_number {
                return false;
            }
            if slot != 0 && number < slot {
                return true;
            }
            prev_number = slot;
            slot = next_slot;
            idx += 1
        }

        // [Check] Over if last slot is not empty
        slot != 0
    }

    /// Validates that the slots array is in valid order (ascending or equal).
    ///
    /// This function checks if all filled slots are in ascending order.
    /// Empty slots (value 0) are ignored in the validation.
    ///
    /// # Arguments
    ///
    /// * `slots` - An array of u16 representing the current state of all slots (0 = empty).
    ///
    /// # Returns
    ///
    /// * `bool` - Returns `true` if slots are valid (ascending order), `false` otherwise.
    ///
    /// # Examples
    ///
    /// ```cairo
    /// // Valid: ascending order
    /// let slots = array![10, 20, 30, 40, 50];
    /// assert(VerifierTrait::is_valid(@slots) == true);
    ///
    /// // Invalid: not ascending
    /// let slots = array![10, 5, 30, 40, 50];
    /// assert(VerifierTrait::is_valid(@slots) == false);
    /// ```
    #[inline]
    fn is_valid(slots: @Array<u16>) -> bool {
        let len = slots.len();
        let mut idx = 0;
        while idx < (len - 1) {
            let current = *slots.at(idx);
            let next = *slots.at(idx + 1);
            if next != 0 && current > next {
                return false;
            }
            idx += 1;
        }
        true
    }

    /// Returns the largest streak of consecutive numbers in the game.
    ///
    /// This function calculates the longest sequence of consecutive non-zero numbers
    /// in the slots array. Empty slots (value 0) are skipped.
    ///
    /// # Arguments
    ///
    /// * `slots` - An array of u16 representing the current state of all slots (0 = empty).
    ///
    /// # Returns
    ///
    /// * `u8` - The length of the longest consecutive streak.
    ///
    /// # Examples
    ///
    /// ```cairo
    /// // Streak of 3: [1, 2, 3]
    /// let slots = array![1, 2, 3, 0, 0, 7, 8, 9];
    /// assert(VerifierTrait::streak(@slots) == 3);
    /// ```
    #[inline]
    fn streak(slots: @Array<u16>) -> u8 {
        let mut count = 0;
        let mut streak = 0;
        let mut previous_number = 0;
        let len = slots.len();
        let mut idx = 0;
        while idx < len {
            let slot = *slots.at(idx);
            if slot == 0 {
                idx += 1;
                continue;
            }
            if previous_number != 0 && slot == previous_number + 1 {
                count += 1;
            } else {
                if count > streak {
                    streak = count;
                }
                count = 1;
            }
            previous_number = slot;
            idx += 1;
        }
        if count > streak {
            return count;
        }
        streak
    }

    /// Determines if the game is rescuable based on the available powers.
    ///
    /// This function checks if any of the selected powers can rescue the game
    /// by finding a valid empty slot for the next number.
    ///
    /// # Arguments
    ///
    /// * `game` - A snapshot of the Game struct.
    /// * `slots` - An array of u16 representing the current state of all slots (0 = empty).
    ///
    /// # Returns
    ///
    /// * `bool` - Returns `true` if the game can be rescued, `false` otherwise.
    #[inline]
    fn is_rescuable(game: @Game, slots: @Array<u16>) -> bool {
        use crate::constants::POWER_SIZE;
        let powers: Array<u8> = Packer::unpack(*game.selected_powers, POWER_SIZE, 0);
        let mut index: u8 = 0;
        while index.into() < powers.len() {
            if Bitmap::get(*game.available_powers, index) != 0 {
                index += 1;
                continue;
            }
            let power: Power = (*powers.at(index.into())).into();
            if power.rescue(game, slots) {
                return true;
            }
            index += 1;
        }
        false
    }
}

#[cfg(test)]
mod tests {
    use crate::constants::{DEFAULT_MULTIPLIER, DEFAULT_SLOT_MAX, DEFAULT_SLOT_MIN, POWER_SIZE};
    use crate::helpers::packer::Packer;
    use crate::models::game::{Game, GameTrait};
    use crate::types::power::Power;
    use super::VerifierTrait;

    const DEFAULT_SLOT_COUNT: u8 = 20;
    const SUPPLY: u256 = 1;

    fn create_test_game() -> Game {
        GameTrait::new(
            1, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, SUPPLY,
        )
    }

    // Tests for is_over
    #[test]
    fn test_is_over_all_slots_filled() {
        let slots = array![10, 20, 30, 40, 50];
        assert_eq!(
            VerifierTrait::is_over(60, 5, 5, @slots), true, "Should be over when all slots filled",
        );
    }

    #[test]
    fn test_is_over_game_not_started() {
        let slots = array![0, 0, 0, 0, 0];
        assert_eq!(
            VerifierTrait::is_over(0, 0, 5, @slots),
            false,
            "Should not be over when game not started",
        );
    }

    #[test]
    fn test_is_over_empty_slot_at_end_can_fit() {
        let slots = array![10, 20, 30, 40, 0];
        assert_eq!(
            VerifierTrait::is_over(500, 4, 5, @slots),
            false,
            "Should not be over when can fit at end",
        );
    }

    #[test]
    fn test_is_over_empty_slot_at_end_cannot_fit() {
        let slots = array![10, 20, 30, 40, 50];
        assert_eq!(
            VerifierTrait::is_over(60, 4, 5, @slots), true, "Should be over when last slot filled",
        );
    }

    #[test]
    fn test_is_over_empty_slot_at_beginning_can_fit() {
        let slots = array![0, 20, 30, 40, 50];
        assert_eq!(
            VerifierTrait::is_over(5, 4, 5, @slots),
            false,
            "Should not be over when can fit at beginning",
        );
    }

    #[test]
    fn test_is_over_empty_slot_in_middle_can_fit() {
        let slots = array![10, 20, 0, 40, 50];
        assert_eq!(
            VerifierTrait::is_over(30, 4, 5, @slots),
            false,
            "Should not be over when can fit in middle",
        );
    }

    #[test]
    fn test_is_over_empty_slot_in_middle_cannot_fit() {
        // Number 35 can fit between 20 and 40, so game is not over
        let slots = array![10, 20, 0, 40, 50];
        assert_eq!(
            VerifierTrait::is_over(35, 4, 5, @slots),
            false,
            "Should not be over when number can fit in gap",
        );
        // Number 45 cannot fit in the gap (too large), so game is over
        let slots2 = array![10, 20, 0, 40, 50];
        assert_eq!(
            VerifierTrait::is_over(45, 4, 5, @slots2),
            true,
            "Should be over when number too large for gap",
        );
    }

    #[test]
    fn test_is_over_number_smaller_than_first() {
        let slots = array![10, 20, 30, 40, 50];
        assert_eq!(
            VerifierTrait::is_over(5, 5, 5, @slots),
            true,
            "Should be over when number smaller than first slot",
        );
    }

    #[test]
    fn test_is_over_gaps_between_numbers() {
        let slots = array![10, 50, 0, 100, 200];
        assert_eq!(
            VerifierTrait::is_over(75, 4, 5, @slots), false, "Should not be over with valid gap",
        );
    }

    #[test]
    fn test_is_over_only_one_slot_filled() {
        let slots = array![100, 0, 0, 0, 0];
        assert_eq!(
            VerifierTrait::is_over(500, 1, 5, @slots),
            false,
            "Should not be over with one slot filled",
        );
    }

    #[test]
    fn test_is_over_number_between_filled_slots() {
        let slots = array![10, 20, 30, 40, 50];
        assert_eq!(
            VerifierTrait::is_over(25, 5, 5, @slots),
            true,
            "Should be over when no empty slot available",
        );
    }

    #[test]
    fn test_is_over_multiple_empty_slots_valid() {
        let slots = array![10, 0, 0, 40, 50];
        assert_eq!(
            VerifierTrait::is_over(25, 3, 5, @slots),
            false,
            "Should not be over with multiple valid empty slots",
        );
    }

    // Tests for is_valid
    #[test]
    fn test_is_valid_single_element() {
        let slots = array![42];
        assert_eq!(VerifierTrait::is_valid(@slots), true, "Single element should be valid");
    }

    #[test]
    fn test_is_valid_empty_array() {
        let slots = array![0, 0, 0, 0, 0];
        assert_eq!(VerifierTrait::is_valid(@slots), true, "Empty array should be valid");
    }

    #[test]
    fn test_is_valid_ascending_order() {
        let slots = array![1, 5, 10, 15, 20];
        assert_eq!(VerifierTrait::is_valid(@slots), true, "Ascending order should be valid");
    }

    #[test]
    fn test_is_valid_not_ascending() {
        let slots = array![10, 5, 15, 20];
        assert_eq!(VerifierTrait::is_valid(@slots), false, "Not ascending should be invalid");
    }

    #[test]
    fn test_is_valid_equal_elements() {
        let slots = array![5, 5, 10, 15];
        assert_eq!(VerifierTrait::is_valid(@slots), true, "Equal elements should be valid");
    }

    #[test]
    fn test_is_valid_with_empty_slots() {
        let slots = array![10, 0, 30, 0, 50];
        assert_eq!(VerifierTrait::is_valid(@slots), true, "Slots with empty gaps should be valid");
    }

    #[test]
    fn test_is_valid_descending_order() {
        let slots = array![50, 40, 30, 20, 10];
        assert_eq!(VerifierTrait::is_valid(@slots), false, "Descending order should be invalid");
    }

    // Tests for streak
    #[test]
    fn test_streak_several() {
        let slots = array![1, 2, 3, 0, 0, 7, 8, 9, 0, 0, 12, 0, 14, 0, 16, 0, 18, 0, 20];
        assert_eq!(VerifierTrait::streak(@slots), 3, "Should find streak of 3 consecutive numbers");
    }

    #[test]
    fn test_streak_none() {
        let slots = array![1, 0, 3, 0, 5, 0, 7, 0, 9, 0, 11, 0, 13, 0, 15, 0, 17, 0, 19, 0];
        assert_eq!(VerifierTrait::streak(@slots), 1, "Should return 1 when no consecutive numbers");
    }

    #[test]
    fn test_streak_full() {
        let slots = array![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
        assert_eq!(
            VerifierTrait::streak(@slots), 20, "Should find full streak of 20 consecutive numbers",
        );
    }

    #[test]
    fn test_streak_single_number() {
        let slots = array![100, 0, 0, 0, 0];
        assert_eq!(VerifierTrait::streak(@slots), 1, "Single number should have streak of 1");
    }

    #[test]
    fn test_streak_multiple_streaks() {
        let slots = array![1, 2, 3, 0, 5, 6, 7, 8, 0, 10, 11];
        assert_eq!(VerifierTrait::streak(@slots), 4, "Should find longest streak of 4");
    }

    #[test]
    fn test_streak_empty_array() {
        let slots = array![0, 0, 0, 0, 0];
        assert_eq!(VerifierTrait::streak(@slots), 0, "Empty array should have streak of 0");
    }

    // Tests for is_rescuable
    #[test]
    fn test_is_rescuable_with_reroll() {
        let mut game = create_test_game();
        let powers: Array<u8> = array![Power::Reroll.into()];
        game.selected_powers = Packer::pack(powers, POWER_SIZE);
        game.available_powers = 0_u16;
        let slots = array![10, 20, 30, 40, 50];
        assert_eq!(
            VerifierTrait::is_rescuable(@game, @slots),
            true,
            "Should be rescuable with Reroll power",
        );
    }

    #[test]
    fn test_is_rescuable_no_powers() {
        let mut game = create_test_game();
        let powers: Array<u8> = array![];
        game.selected_powers = Packer::pack(powers, POWER_SIZE);
        game.available_powers = 0_u16;
        let slots = array![10, 20, 30, 40, 50];
        assert_eq!(
            VerifierTrait::is_rescuable(@game, @slots),
            false,
            "Should not be rescuable with no powers",
        );
    }

    #[test]
    fn test_is_rescuable_all_powers_available() {
        let mut game = create_test_game();
        let powers: Array<u8> = array![Power::Reroll.into()];
        game.selected_powers = Packer::pack(powers, POWER_SIZE);
        game.available_powers = 1_u16; // First power is available
        let slots = array![10, 20, 30, 40, 50];
        assert_eq!(
            VerifierTrait::is_rescuable(@game, @slots),
            false,
            "Should not be rescuable when all powers are already used",
        );
    }
}
