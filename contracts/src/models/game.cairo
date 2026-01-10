use core::array::ArrayTrait;
use crate::constants::{DEFAULT_DRAW_COUNT, DEFAULT_DRAW_STAGE, POWER_SIZE, SLOT_SIZE};
pub use crate::helpers::bitmap::Bitmap;
use crate::helpers::packer::Packer;
use crate::helpers::rewarder::Rewarder;
pub use crate::models::index::Game;
use crate::random::{Random, RandomImpl};
pub use crate::types::power::{POWER_COUNT, Power, PowerTrait};

/// Game-related error constants
pub mod errors {
    pub const GAME_DOES_NOT_EXIST: felt252 = 'Game: does not exist';
    pub const GAME_ALREADY_EXISTS: felt252 = 'Game: already exists';
    pub const GAME_SLOTS_NOT_VALID: felt252 = 'Game: slots not valid';
    pub const GAME_NUMBER_NOT_VALID: felt252 = 'Game: number not valid';
    pub const GAME_INDEX_NOT_VALID: felt252 = 'Game: index not valid';
    pub const GAME_IS_OVER: felt252 = 'Game: is over';
    pub const GAME_ALREADY_STARTED: felt252 = 'Game: already started';
    pub const GAME_SLOT_NOT_EMPTY: felt252 = 'Game: slot not empty';
    pub const GAME_POWER_NOT_AVAILABLE: felt252 = 'Game: power not available';
    pub const GAME_HAS_NOT_STARTED: felt252 = 'Game: has not started';
    pub const GAME_SLOTS_PACK_FAILED: felt252 = 'Game: slots pack failed';
    pub const GAME_INVALID_SELECTION: felt252 = 'Game: invalid power selection';
    pub const GAME_SELECTABLE_POWERS: felt252 = 'Game: power must be selected';
}

/// Implementation of core game logic and state management
#[generate_trait]
pub impl GameImpl of GameTrait {
    /// Creates a new game instance with the specified parameters.
    #[inline]
    fn new(id: u64, slot_count: u8, slot_min: u16, slot_max: u16, supply: u256) -> Game {
        // [Return] Game
        Game {
            id: id,
            over: false,
            claimed: false,
            level: 0,
            slot_count: slot_count,
            slot_min: slot_min,
            slot_max: slot_max,
            number: 0,
            next_number: 0,
            selectable_powers: 0,
            selected_powers: 0,
            available_powers: 0,
            reward: 0,
            slots: 0,
            supply: supply.try_into().unwrap(),
        }
    }

    #[inline]
    fn start(ref self: Game, number: u16, next: u16) {
        // [Check] Game has not started yet
        self.assert_not_started();
        // [Check] Numbers are valid
        GameAssert::assert_valid_number(number);
        GameAssert::assert_valid_number(next);
        // [Effect] Start game
        self.number = number;
        self.next_number = next;
    }

    #[inline]
    fn slots(self: @Game) -> Array<u16> {
        let slots: u256 = (*self.slots).into();
        let slot_count: u16 = (*self.slot_count).into();
        Packer::unpack(slots, SLOT_SIZE, slot_count)
    }

    /// Validates that the given array of numbers is in ascending order.
    fn is_valid(self: @Game) -> bool {
        let slots = self.slots();
        let len = slots.len();
        let mut valid = true;
        let mut idx = 0;
        while idx < (len - 1) {
            let current = slots.at(idx);
            let next = slots.at(idx + 1);
            if next != @0 && current > next {
                valid = false;
                break;
            }
            idx += 1;
        }
        valid
    }

    /// Returns the largest streak of consecutive numbers in the game.
    fn streak(ref slots: Array<u16>) -> u8 {
        let mut count = 0;
        let mut streak = 0;
        let mut previous_number = 0;
        while let Option::Some(slot) = slots.pop_front() {
            if slot == 0 {
                continue;
            }
            if previous_number != 0 && slot == previous_number + 1 {
                count += 1;
            } else if count > streak {
                streak = count;
                count = 1;
            } else {
                count = 1;
            }
            previous_number = slot;
        }
        if count > streak {
            return count;
        }
        streak
    }

    fn is_completed(self: @Game) -> bool {
        self.level == self.slot_count
    }

    /// Determines if the game has ended based on current state and configuration.
    fn is_over(self: @Game, slots: @Array<u16>) -> bool {
        // [Check] All slots have been filled
        if self.level == self.slot_count {
            return true;
        }

        // [Check] Game is not started yet
        if self.number == @0 {
            return false;
        }

        // [Check] There is a valid empty slot for next number
        let max_slots: u32 = (*self.slot_count).into();
        let number = *self.number;
        let mut idx = 0;
        let mut slot = *slots.at(idx);
        let mut prev_number = 0;
        while idx < (max_slots - 1) {
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

    /// Determines if the game is rescuable based on the available powers
    fn is_rescuable(self: @Game, slots: @Array<u16>) -> bool {
        let powers: Array<u8> = Packer::unpack(*self.available_powers, POWER_SIZE, 0);
        let mut index: u8 = 0;
        while index != POWER_COUNT {
            if (Bitmap::get(*self.available_powers, index) == 0) {
                index += 1;
                continue;
            }
            let power: Power = (*powers.at(index.into())).into();
            if power.rescue(self, slots) {
                return true;
            }
            index += 1;
        }
        false
    }

    /// Generates a random `u16` number between `min` and `max` that is not already present in the
    /// given array `nums`.
    fn next(ref self: Game, slots: @Array<u16>, ref rand: Random) -> u16 {
        // [Compute] Draw a random number between the min and max
        let min = self.slot_min;
        let max = self.slot_max;
        _next(min, max, slots, ref rand)
    }

    /// Rewards the game for the current level.
    #[inline]
    fn reward(ref self: Game, supply: u256, target: u256) -> u64 {
        let reward = Rewarder::amount(self.level, self.slot_count, supply, target);
        self.reward += reward;
        reward
    }

    /// Levels up the game.
    #[inline]
    fn level_up(ref self: Game) {
        self.level += 1;
    }

    #[inline]
    fn is_drawable(self: @Game) -> bool {
        *self.selectable_powers == 0
            && !self.is_completed()
            && (*self.level % DEFAULT_DRAW_STAGE) == 0
    }

    /// Place number
    #[inline]
    fn place(ref self: Game, index: u8) {
        // [Check] Index is valid
        self.assert_valid_index(index);
        // [Check] Target slot is empty
        let slots: u256 = self.slots.into();
        let slot_count: u16 = self.slot_count.into();
        let slot = Packer::get(slots, index, SLOT_SIZE, slot_count);
        assert(slot == 0, errors::GAME_SLOT_NOT_EMPTY);
        // [Effect] Place number
        self
            .slots = Packer::replace(slots, index, SLOT_SIZE, self.number, slot_count)
            .try_into()
            .expect(errors::GAME_SLOTS_PACK_FAILED);
    }

    /// Select a selectable power.
    #[inline]
    fn select(ref self: Game, index: u8) {
        // [Check] Power is selectable
        self.assert_is_selectable(index);
        // [Effect] Select power and add to selected powers
        let powers: Array<u8> = Packer::unpack(self.selectable_powers, POWER_SIZE, 0);
        let power: u8 = *powers.at(index.into());
        let mut selected: Array<u8> = Packer::unpack(self.selected_powers, POWER_SIZE, 0);
        selected.append(power);
        self.selected_powers = Packer::pack(selected, POWER_SIZE);
        // [Effect] Erase selectable powers
        self.selectable_powers = 0;
        // [Effect] Update game over
        let slots = self.slots();
        self.over = self.is_over(@slots) && !self.is_rescuable(@slots);
    }

    /// Applies a power to the game.
    #[inline]
    fn apply(ref self: Game, index: u8, ref rand: Random) {
        // [Check] Power is valid
        let powers: Array<u8> = Packer::unpack(self.selected_powers, POWER_SIZE, 0);
        let power: Power = (*powers
            .get(index.into())
            .expect(errors::GAME_POWER_NOT_AVAILABLE)
            .unbox())
            .into();
        assert(Bitmap::get(self.available_powers, index) == 0, errors::GAME_POWER_NOT_AVAILABLE);
        // [Effect] Update power availability
        self.available_powers = Bitmap::set(self.available_powers, index);
        // [Effect] Apply power
        power.apply(ref self, ref rand);
        // [Effect] Update game over
        let slots = self.slots();
        self.over = self.is_over(@slots) && !self.is_rescuable(@slots);
    }

    /// Updates the game state.
    #[inline]
    fn update(ref self: Game, ref rand: Random, target: u256) -> u64 {
        // [Effect] Level up
        self.level_up();
        // [Effect] Update numbers if the game is not completed
        let mut slots = self.slots();
        if !self.is_completed() {
            self.number = self.next_number;
            self.next_number = self.next(@slots, ref rand);
        }
        // [Effect] Draw new powers if possible
        if self.is_drawable() {
            let powers = PowerTrait::draw(rand.next_seed(), DEFAULT_DRAW_COUNT);
            self.selectable_powers = Packer::pack(powers, POWER_SIZE)
        }
        // [Effect] Assess game over
        // [Info] Game is over if:
        // - number cannot be placed
        // - powers cannot save the game
        // - no powers can be selected
        self.over = self.is_over(@slots)
            && !self.is_rescuable(@slots)
            && self.selectable_powers == 0;
        // [Return] Reward
        self.reward(self.supply.into(), target)
    }
}

/// Helper function to generate a random number between the min and max that is not already present
/// in the given array `slots`.
///
/// @param min - The minimum number to generate.
/// @param max - The maximum number to generate.
/// @param rand - The random number generator.
/// @param slots - The array of slots to check.
/// @return The next number.
fn _next(min: u16, max: u16, slots: @Array<u16>, ref rand: Random) -> u16 {
    // [Compute] Draw a random number between the min and max
    let random = rand.between::<u16>(min, max);
    // [Check] If the number is already in the slots
    let mut reroll = false;
    let mut idx = 0_u32;
    let len = slots.len();
    while idx < len {
        if *slots.at(idx) == random {
            reroll = true;
            break;
        }
        idx += 1;
    }
    // [Return] Reroll if the number is already in the slots
    match reroll {
        true => _next(min, max, slots, ref rand),
        false => random,
    }
}

/// Assertion methods for game state validation
///
/// These methods provide convenient ways to validate game state and throw
/// appropriate errors when validation fails.
#[generate_trait]
pub impl GameAssert of AssertTrait {
    /// Asserts that the game exists (has been properly initialized).
    #[inline]
    fn assert_does_exist(self: @Game) {
        assert(self.slot_count != @0, errors::GAME_DOES_NOT_EXIST);
    }

    /// Asserts that the game does not exist (has not been initialized).
    #[inline]
    fn assert_not_exist(self: @Game) {
        assert(self.slot_count == @0, errors::GAME_ALREADY_EXISTS);
    }

    /// Asserts that the given array of numbers is in valid ascending order.
    #[inline]
    fn assert_is_valid(self: @Game) {
        assert(self.is_valid(), errors::GAME_SLOTS_NOT_VALID);
    }

    /// Asserts that the given number is valid.
    #[inline]
    fn assert_valid_number(number: u16) {
        assert(number != 0 && number.into() < SLOT_SIZE, errors::GAME_NUMBER_NOT_VALID);
    }

    /// Asserts that the given index is valid.
    #[inline]
    fn assert_valid_index(self: @Game, index: u8) {
        assert(index < *self.slot_count, errors::GAME_INDEX_NOT_VALID);
    }

    /// Asserts that the given power is selectable.
    #[inline]
    fn assert_is_selectable(self: @Game, index: u8) {
        assert(
            self.selectable_powers != @0 && index < DEFAULT_DRAW_COUNT,
            errors::GAME_INVALID_SELECTION,
        );
    }

    #[inline]
    fn assert_not_selectable(self: @Game) {
        assert(self.selectable_powers == @0, errors::GAME_SELECTABLE_POWERS);
    }

    /// Asserts that the game has not started yet.
    #[inline]
    fn assert_not_started(self: @Game) {
        assert(self.number == @0, errors::GAME_ALREADY_STARTED);
    }

    /// Asserts game is not over.
    #[inline]
    fn assert_not_over(self: @Game) {
        assert(!*self.over, errors::GAME_IS_OVER);
    }

    /// Asserts that the game has started.
    #[inline]
    fn assert_has_started(self: @Game) {
        assert(self.number != @0, errors::GAME_HAS_NOT_STARTED);
    }
}

#[cfg(test)]
mod tests {
    use crate::constants::{
        DEFAULT_DRAW_COUNT, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MAX, DEFAULT_SLOT_MIN, POWER_SIZE,
        SLOT_SIZE,
    };
    use crate::helpers::packer::Packer;
    use super::{Game, GameAssert, GameTrait};

    const SUPPLY: u256 = 1;

    /// Helper function to create a test game instance
    fn create() -> Game {
        let mut game = GameTrait::new(
            1, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, SUPPLY,
        );
        game.start(1, 0b0000111);
        game
    }

    #[test]
    fn test_new_game_creation() {
        let game = GameTrait::new(
            1, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, SUPPLY,
        );
        assert(game.id == 1, 'Game ID should be 1');
        assert(game.level == 0, 'Initial level should be 0');
        assert(game.number == 0, 'Next number should match input');
        assert(game.reward == 0, 'Initial reward should be 0');
        assert(!game.over, 'Game is over initially');
    }

    #[test]
    fn test_is_valid_single_element() {
        let mut game = create();
        let slots: u256 = Packer::pack(array![42_u8], SLOT_SIZE);
        game.slots = slots.try_into().unwrap();
        assert(game.is_valid(), 'Single element invalid');
    }

    #[test]
    fn test_is_valid_empty_array() {
        let game = create();
        assert(game.is_valid(), 'Empty array invalid');
    }

    #[test]
    fn test_is_valid_ascending_order() {
        let mut game = create();
        let slots: u256 = Packer::pack(array![1_u8, 5, 10, 15], SLOT_SIZE);
        game.slots = slots.try_into().unwrap();
        assert(game.is_valid(), 'Ascending order invalid');
    }

    #[test]
    fn test_is_valid_not_ascending() {
        let mut game = create();
        let slots: u256 = Packer::pack(array![10_u8, 5, 15], SLOT_SIZE);
        game.slots = slots.try_into().unwrap();
        assert(!game.is_valid(), 'Not ascending is valid');
    }

    #[test]
    fn test_is_valid_equal_elements() {
        let mut game = create();
        let slots: u256 = Packer::pack(array![5_u8, 5], SLOT_SIZE);
        game.slots = slots.try_into().unwrap();
        assert(game.is_valid(), 'Equal elements invalid');
    }

    #[test]
    fn test_assert_does_exist_valid_game() {
        let game = create();
        // This should not panic
        GameAssert::assert_does_exist(@game);
    }

    #[test]
    #[should_panic(expected: ('Game: does not exist',))]
    fn test_assert_does_exist_invalid_game() {
        let mut game = create();
        game.slot_count = 0; // Make it invalid

        GameAssert::assert_does_exist(@game);
    }

    #[test]
    fn test_assert_not_exist_valid() {
        let mut game = create();
        game.slot_count = 0; // Make it not exist

        // This should not panic
        GameAssert::assert_not_exist(@game);
    }

    #[test]
    #[should_panic(expected: ('Game: already exists',))]
    fn test_assert_not_exist_invalid() {
        let game = create();

        GameAssert::assert_not_exist(@game);
    }

    #[test]
    fn test_assert_is_valid_valid_numbers() {
        let mut game = create();
        let slots: u256 = Packer::pack(array![1_u8, 5, 10], SLOT_SIZE);
        game.slots = slots.try_into().unwrap();
        GameAssert::assert_is_valid(@game);
    }

    #[test]
    #[should_panic(expected: ('Game: slots not valid',))]
    fn test_assert_is_valid_invalid_numbers() {
        let mut game = create();
        let slots: u256 = Packer::pack(array![10_u8, 5, 1], SLOT_SIZE);
        game.slots = slots.try_into().unwrap();
        GameAssert::assert_is_valid(@game);
    }

    #[test]
    fn test_is_over_all_slots_filled() {
        let mut game = create();
        game.level = 20; // All slots filled
        let slots: u256 = Packer::pack(
            array![
                10_u8, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180,
                190, 200,
            ],
            SLOT_SIZE,
        );
        game.slots = slots.try_into().unwrap();
        let slots = game.slots();
        assert(game.is_over(@slots), 'Not over with full slots');
    }

    #[test]
    fn test_is_over_empty_slot_at_end_can_fit() {
        let mut game = create();
        game.level = 19;
        game.number = 500;
        let slots: Array<u16> = array![
            10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 0,
        ];
        let pack: u256 = Packer::pack(slots.clone(), SLOT_SIZE);
        game.slots = pack.try_into().unwrap();
        assert(!game.is_over(@slots), 'Over but can fit at end');
    }

    #[test]
    fn test_is_over_empty_slot_at_end_cannot_fit() {
        let mut game = create();
        game.level = 19;
        game.number = 300;
        let slots: Array<u16> = array![
            10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190,
            400,
        ];
        let pack: u256 = Packer::pack(slots.clone(), SLOT_SIZE);
        game.slots = pack.try_into().unwrap();
        assert(game.is_over(@slots), 'Not over but cannot fit');
    }

    #[test]
    fn test_is_over_empty_slot_at_beginning_can_fit() {
        let mut game = create();
        game.level = 19;
        game.number = 5;
        let slots: Array<u16> = array![
            0, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190,
            200,
        ];
        let pack: u256 = Packer::pack(slots.clone(), SLOT_SIZE);
        game.slots = pack.try_into().unwrap();
        assert(!game.is_over(@slots), 'Over but can fit at start');
    }

    #[test]
    fn test_is_over_empty_slot_in_middle_can_fit() {
        let mut game = create();
        game.level = 5;
        game.number = 150;
        let slots: Array<u16> = array![10, 20, 30, 100, 0, 0, 200];
        let pack: u256 = Packer::pack(slots.clone(), SLOT_SIZE);
        game.slots = pack.try_into().unwrap();
        assert(!game.is_over(@slots), 'Over but can fit in middle');
    }

    #[test]
    fn test_is_over_empty_slot_in_middle_cannot_fit() {
        let mut game = create();
        game.level = 5;
        game.number = 150;
        let slots: Array<u16> = array![10, 20, 30, 100, 200];
        let pack: u256 = Packer::pack(slots.clone(), SLOT_SIZE);
        game.slots = pack.try_into().unwrap();
        assert(game.is_over(@game.slots()), 'Not over but too large');
    }

    #[test]
    fn test_is_over_number_smaller_than_first() {
        let mut game = create();
        game.level = 3;
        game.number = 5;
        let slots: Array<u16> = array![10, 50, 100];
        let pack: u256 = Packer::pack(slots.clone(), SLOT_SIZE);
        game.slots = pack.try_into().unwrap();
        assert(game.is_over(@slots), 'Not over with small number');
    }

    #[test]
    fn test_is_over_gaps_between_numbers() {
        let mut game = create();
        game.level = 4;
        game.number = 75; // Fits between 50 and 100
        let slots: Array<u16> = array![10, 50, 0, 100, 500];
        let pack: u256 = Packer::pack(slots.clone(), SLOT_SIZE);
        game.slots = pack.try_into().unwrap();
        assert(!game.is_over(@slots), 'Over with valid gap');
    }

    #[test]
    fn test_is_over_only_one_slot_filled() {
        let mut game = create();
        game.level = 1;
        game.number = 500;
        let slots: Array<u16> = array![100];
        let pack: u256 = Packer::pack(slots.clone(), SLOT_SIZE);
        game.slots = pack.try_into().unwrap();
        let slots = game.slots();
        assert(!game.is_over(@slots), 'Over with one slot filled');
    }

    #[test]
    fn test_game_streak_several() {
        let mut slots = array![1, 2, 3, 0, 0, 7, 8, 9, 0, 0, 12, 0, 14, 0, 16, 0, 18, 0, 20];
        assert_eq!(GameTrait::streak(ref slots), 3);
    }

    #[test]
    fn test_game_streak_none() {
        let mut slots = array![1, 0, 3, 0, 5, 0, 7, 0, 9, 0, 11, 0, 13, 0, 15, 0, 17, 0, 19, 0];
        assert_eq!(GameTrait::streak(ref slots), 1);
    }

    #[test]
    fn test_game_streak_full() {
        let mut slots = array![
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        ];
        assert_eq!(GameTrait::streak(ref slots), 20);
    }

    #[test]
    fn test_select_power_success() {
        let mut game = create();
        // Create selectable powers: [1, 2]
        let selectable_powers: Array<u8> = array![1_u8, 2];
        game.selectable_powers = Packer::pack(selectable_powers, POWER_SIZE);

        // Select power at index 0 (power 1)
        game.select(0);

        // Verify selectable_powers is cleared
        assert(game.selectable_powers == 0, 'selectable powers cleared');

        // Verify selected_powers contains the selected power
        let selected: Array<u8> = Packer::unpack(game.selected_powers, POWER_SIZE, 0);
        assert(selected.len() == 1, 'selected has one power');
        assert(*selected.at(0) == 1, 'selected power is 1');
    }

    #[test]
    fn test_select_power_multiple_selections() {
        let mut game = create();
        // Create selectable powers: [3, 5]
        let selectable_powers: Array<u8> = array![3_u8, 5];
        game.selectable_powers = Packer::pack(selectable_powers, POWER_SIZE);

        // Select power at index 1 (power 5)
        game.select(1);

        // Verify selected_powers contains power 5
        let selected: Array<u8> = Packer::unpack(game.selected_powers, POWER_SIZE, 0);
        assert(*selected.at(0) == 5, 'selected power is 5');

        // Add more selectable powers and select again
        let new_selectable: Array<u8> = array![7_u8, 9];
        game.selectable_powers = Packer::pack(new_selectable, POWER_SIZE);
        game.select(0);

        // Verify both powers are in selected_powers
        let selected_after: Array<u8> = Packer::unpack(game.selected_powers, POWER_SIZE, 0);
        assert(selected_after.len() == 2, 'has two');
        assert(*selected_after.at(0) == 5, 'first is 5');
        assert(*selected_after.at(1) == 7, 'second is 7');
    }

    #[test]
    #[should_panic(expected: ('Game: invalid power selection',))]
    fn test_select_power_no_selectable_powers() {
        let mut game = create();
        // No selectable powers set (default is 0)
        game.select(0);
    }

    #[test]
    #[should_panic(expected: ('Game: invalid power selection',))]
    fn test_select_power_invalid_index() {
        let mut game = create();
        // Create selectable powers: [1, 2] (only 2 powers, indices 0 and 1 are valid)
        let selectable_powers: Array<u8> = array![1_u8, 2];
        game.selectable_powers = Packer::pack(selectable_powers, POWER_SIZE);

        // Try to select with invalid index (>= DEFAULT_DRAW_COUNT which is 2)
        // Using index 2 which is >= DEFAULT_DRAW_COUNT (2)
        game.select(DEFAULT_DRAW_COUNT);
    }
}
