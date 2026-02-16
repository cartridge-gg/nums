use core::array::ArrayTrait;
use crate::constants::{
    BASE_MULTIPLIER, DEFAULT_DRAW_COUNT, DEFAULT_DRAW_STAGE, DEFAULT_EXPIRATION, DEFAULT_MAX_DRAW,
    POWER_SIZE, SLOT_SIZE, TRAP_SIZE,
};
pub use crate::helpers::bitmap::Bitmap;
use crate::helpers::packer::Packer;
use crate::helpers::random::{Random, RandomImpl};
use crate::helpers::rewarder::Rewarder;
use crate::helpers::verifier::VerifierTrait;
pub use crate::models::index::Game;
pub use crate::types::power::{POWER_COUNT, Power, PowerTrait};
use crate::types::trap::{TRAP_COUNT, Trap, TrapTrait};

/// Game-related error constants
pub mod errors {
    pub const GAME_DOES_NOT_EXIST: felt252 = 'Game: does not exist';
    pub const GAME_ALREADY_EXISTS: felt252 = 'Game: already exists';
    pub const GAME_SLOTS_NOT_VALID: felt252 = 'Game: slots not valid';
    pub const GAME_NUMBER_NOT_VALID: felt252 = 'Game: number not valid';
    pub const GAME_INDEX_NOT_VALID: felt252 = 'Game: index not valid';
    pub const GAME_IS_OVER: felt252 = 'Game: is over';
    pub const GAME_NOT_OVER: felt252 = 'Game: not over';
    pub const GAME_HAS_EXPIRED: felt252 = 'Game: has expired';
    pub const GAME_NOT_CLAIMABLE: felt252 = 'Game: not claimable';
    pub const GAME_ALREADY_STARTED: felt252 = 'Game: already started';
    pub const GAME_SLOT_NOT_EMPTY: felt252 = 'Game: slot not empty';
    pub const GAME_POWER_NOT_AVAILABLE: felt252 = 'Game: power not available';
    pub const GAME_HAS_NOT_STARTED: felt252 = 'Game: has not started';
    pub const GAME_SLOTS_PACK_FAILED: felt252 = 'Game: slots pack failed';
    pub const GAME_INVALID_SELECTION: felt252 = 'Game: invalid power selection';
    pub const GAME_SELECTABLE_POWERS: felt252 = 'Game: power must be selected';
    pub const GAME_IS_CLAIMED: felt252 = 'Game: is claimed';
}

/// Implementation of core game logic and state management
#[generate_trait]
pub impl GameImpl of GameTrait {
    /// Creates a new game instance with the specified parameters.
    #[inline]
    fn new(
        id: u64, multiplier: u8, slot_count: u8, slot_min: u16, slot_max: u16, supply: u256,
    ) -> Game {
        // [Return] Game
        Game {
            id: id,
            claimed: false,
            multiplier: multiplier,
            level: 0,
            slot_count: slot_count,
            slot_min: slot_min,
            slot_max: slot_max,
            number: 0,
            next_number: 0,
            selectable_powers: 0,
            selected_powers: 0,
            enabled_powers: 0,
            disabled_traps: 0,
            reward: 0,
            over: 0,
            expiration: 0,
            traps: 0,
            slots: 0,
            supply: supply.try_into().unwrap(),
        }
    }

    #[inline]
    fn start(ref self: Game, ref rand: Random) {
        // [Check] Game has not started yet
        self.assert_not_started();
        // [Effect] Draw numbers
        let mut slots = self.slots();
        self.number = self.next(@slots, ref rand);
        slots.append(self.number);
        self.next_number = self.next(@slots, ref rand);
        // [Effect] Draw traps
        let traps = TrapTrait::generate(TRAP_COUNT, self.slot_count, ref rand);
        self.traps = Packer::pack(traps, TRAP_SIZE);
        // [Effect] Set expiration
        self.expiration = starknet::get_block_timestamp() + DEFAULT_EXPIRATION;
    }

    #[inline]
    fn slots(self: @Game) -> Array<u16> {
        let slots: u256 = (*self.slots).into();
        let slot_count: u16 = (*self.slot_count).into();
        Packer::unpack(slots, SLOT_SIZE, slot_count)
    }

    #[inline]
    fn traps(self: @Game) -> Array<u8> {
        Packer::unpack(*self.traps, TRAP_SIZE, TRAP_COUNT)
    }

    /// Validates that the given array of numbers is in ascending order.
    #[inline]
    fn is_valid(self: @Game) -> bool {
        VerifierTrait::is_valid(@self.slots())
    }

    /// Returns the largest streak of consecutive numbers in the game.
    #[inline]
    fn streak(ref slots: Array<u16>) -> u8 {
        VerifierTrait::streak(@slots)
    }

    fn is_completed(self: @Game) -> bool {
        self.level == self.slot_count
    }

    /// Determines if the game has ended based on current state and configuration.
    #[inline]
    fn is_over(self: @Game, slots: @Array<u16>) -> bool {
        VerifierTrait::is_over(*self.number, (*self.level).into(), (*self.slot_count).into(), slots)
            && self.selectable_powers == @0
            && self.enabled_powers == @0
    }

    /// Determines if the game has expired based on the current timestamp.
    #[inline]
    fn is_expired(self: @Game) -> bool {
        starknet::get_block_timestamp() >= *self.expiration
    }

    /// Generates a random `u16` number between `min` and `max` that is not already present in the
    /// given array `nums`.
    fn next(ref self: Game, slots: @Array<u16>, ref rand: Random) -> u16 {
        // [Compute] Draw a random number between the min and max
        let min = self.slot_min;
        let max = self.slot_max;
        rand.next_unique(min, max, slots)
    }

    /// Rewards the game for the current level.
    #[inline]
    fn reward(ref self: Game, supply: u256, target: u256) {
        let reward = Rewarder::amount(self.level, self.slot_count, supply, target);
        self.reward += reward;
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
            && *self.level < DEFAULT_MAX_DRAW
    }

    /// Place number
    #[inline]
    fn place(ref self: Game, number: u16, index: u8, ref rand: Random) {
        // [Check] Index is valid
        self.assert_valid_index(index);
        // [Check] Target slot is empty
        let slots: u256 = self.slots.into();
        let slot_count: u16 = self.slot_count.into();
        let slot = Packer::get(slots, index, SLOT_SIZE, slot_count);
        assert(slot == 0, errors::GAME_SLOT_NOT_EMPTY);
        // [Effect] Place number
        self.set(slots, index, number, slot_count);
        // [Effect] Trigger trap if available, disable it before to avoid infinite loops
        let trap: Trap = Packer::get(self.traps, index, TRAP_SIZE, self.slot_count).into();
        if Bitmap::get(self.disabled_traps, index) == 0 && trap != Trap::None {
            self.disabled_traps = Bitmap::set(self.disabled_traps, index);
            trap.apply(ref self, index, ref rand);
            return;
        }
    }

    #[inline]
    fn set(ref self: Game, slots: u256, index: u8, number: u16, len: u16) {
        // [Effect] Set number
        self
            .slots = Packer::replace(slots, index, SLOT_SIZE, number, len)
            .try_into()
            .expect(errors::GAME_SLOTS_PACK_FAILED);
    }

    #[inline]
    fn unset(ref self: Game, slots: u256, index: u8, len: u16) {
        // [Effect] Unset number
        self.set(slots, index, 0, len);
    }

    #[inline]
    fn shuffle(ref self: Game, index: u8, ref rand: Random) {
        // [Effect] Take the nearest number and shuffle them
        let slots = self.slots();
        // [Compute] Find the nearest number to the left
        let mut idx: u32 = index.into();
        let mut previous: u16 = self.slot_min;
        while idx > 0 {
            idx -= 1;
            let slot = *slots.at(idx);
            if slot != 0 {
                previous = slot;
                break;
            }
        }
        // [Compute] Find the nearest number to the right
        let mut idx: u32 = index.into();
        let mut next: u16 = self.slot_max;
        let max = slots.len() - 1;
        while idx < max {
            idx += 1;
            let slot = *slots.at(idx);
            if slot != 0 {
                next = slot;
                break;
            }
        }
        // [Effect] Shuffle the slot at index
        let slot = rand.between(previous, next);
        let slots: u256 = self.slots.into();
        self.set(slots, index, slot, self.slot_count.into());
    }

    #[inline]
    fn move(ref self: Game, from: u8, to: u8, ref rand: Random) {
        // [Check] Index is valid
        self.assert_valid_index(from);
        self.assert_valid_index(to);
        // [Effect] Move number
        let slots: u256 = self.slots.into();
        let slot = Packer::get(slots, from, SLOT_SIZE, self.slot_count.into());
        self.unset(slots, from, self.slot_count.into());
        self.place(slot, to, ref rand);
    }

    #[inline]
    fn force(ref self: Game, slots: Array<u16>) {
        let slots: u256 = Packer::pack(slots, SLOT_SIZE);
        self.slots = slots.try_into().expect(errors::GAME_SLOTS_PACK_FAILED);
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
        // [Effect] Update power availability
        let power_index = self.level / DEFAULT_DRAW_STAGE - 1;
        self.enabled_powers = Bitmap::set(self.enabled_powers, power_index);
        // [Effect] Update game over
        let slots = self.slots();
        self.over = if self.is_over(@slots) {
            starknet::get_block_timestamp()
        } else {
            self.over
        };
    }

    /// Applies a power to the game.
    #[inline]
    fn apply(ref self: Game, index: u8, ref rand: Random) {
        // [Check] Power is not selectable
        self.assert_not_selectable();
        // [Check] Power is valid
        let powers: Array<u8> = Packer::unpack(self.selected_powers, POWER_SIZE, 0);
        let power: Power = (*powers
            .get(index.into())
            .expect(errors::GAME_POWER_NOT_AVAILABLE)
            .unbox())
            .into();
        assert(Bitmap::get(self.enabled_powers, index) == 1, errors::GAME_POWER_NOT_AVAILABLE);
        // [Effect] Update power availability
        self.enabled_powers = Bitmap::unset(self.enabled_powers, index);
        // [Effect] Apply power
        power.apply(ref self, ref rand);
        // [Effect] Update game over
        let slots = self.slots();
        self.over = if self.is_over(@slots) {
            starknet::get_block_timestamp()
        } else {
            self.over
        };
    }

    /// Updates the game state.
    #[inline]
    fn update(ref self: Game, ref rand: Random, target: u256) {
        // [Check] Power is not selectable
        self.assert_not_selectable();
        // [Effect] Level up
        self.level_up();
        // [Effect] Update Reward
        self.reward(self.supply.into(), target);
        // [Effect] Update numbers if the game is not completed
        let slots = self.slots();
        if !self.is_completed() {
            // [Info] Artificially add the number to the slots to avoid pulling the same number
            let mut clone_slots = slots.clone();
            self.number = self.next_number;
            clone_slots.append(self.number);
            self.next_number = self.next(@clone_slots, ref rand);
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
        self.over = if self.is_over(@slots) {
            starknet::get_block_timestamp()
        } else {
            self.over
        };
    }

    /// Claims the game.
    #[inline]
    fn claim(ref self: Game) -> u64 {
        // [Effect] Claim game
        self.claimed = true;
        self.reward * self.multiplier.into() / BASE_MULTIPLIER.into()
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
        assert(self.over == @0, errors::GAME_IS_OVER);
    }

    /// Asserts that the game has not expired.
    #[inline]
    fn assert_not_expired(self: @Game) {
        assert(!self.is_expired(), errors::GAME_HAS_EXPIRED);
    }

    /// Asserts that the game is over.
    #[inline]
    fn assert_is_over(self: @Game) {
        assert(self.over != @0, errors::GAME_NOT_OVER);
    }

    /// Asserts is claimable.
    #[inline]
    fn assert_is_claimable(self: @Game) {
        assert(self.over != @0 || self.is_expired(), errors::GAME_NOT_CLAIMABLE);
    }

    /// Asserts that the game has started.
    #[inline]
    fn assert_has_started(self: @Game) {
        assert(self.number != @0, errors::GAME_HAS_NOT_STARTED);
    }

    /// Asserts that the game is not claimed.
    #[inline]
    fn assert_not_claimed(self: @Game) {
        assert(!*self.claimed, errors::GAME_IS_CLAIMED);
    }
}

#[cfg(test)]
mod tests {
    use crate::constants::{
        DEFAULT_DRAW_COUNT, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MAX,
        DEFAULT_SLOT_MIN, POWER_SIZE, SLOT_SIZE,
    };
    use crate::helpers::packer::Packer;
    use super::{Game, GameAssert, GameTrait, RandomImpl};

    const SUPPLY: u256 = 1;

    /// Helper function to create a test game instance
    fn create() -> Game {
        let mut game = GameTrait::new(
            1, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, SUPPLY,
        );
        let mut rand = RandomImpl::new(1);
        game.start(ref rand);
        game
    }

    #[test]
    fn test_new_game_creation() {
        let game = GameTrait::new(
            1, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, SUPPLY,
        );
        assert(game.id == 1, 'Game ID should be 1');
        assert(game.level == 0, 'Initial level should be 0');
        assert(game.number == 0, 'Next number should match input');
        assert(game.reward == 0, 'Initial reward should be 0');
        assert(game.over == 0, 'Game is over initially');
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

    #[test]
    fn test_apply_powers() {
        let mut game = create();
        let enabled_powers = 0b1100;
        game.enabled_powers = enabled_powers;
        game.level = 16;
        game.number = 725;
        game.next_number = 749;
        game.selected_powers = 0x3451;
        game.slots = 0x00003e70003212e228126e00023320f0001bd1b700013312f09b07d07001900e;
        let mut random = RandomImpl::new(0);
        game.apply(3, ref random);
        assert(game.enabled_powers == enabled_powers & 0b0111, 'Game: invalid powers');
        game.apply(2, ref random);
        assert(game.enabled_powers == enabled_powers & 0b0011, 'Game: invalid powers');
    }

    #[test]
    fn test_game_situation() {
        let mut game = create();
        game.enabled_powers = 0;
        game.level = 2;
        game.number = 0;
        game.next_number = 214;
        game.selected_powers = 0x0;
        game.force(array![1, 0, 0, 0, 11, 83, 234, 0, 0, 0, 0, 0, 0, 0, 0, 780, 0, 0, 0, 999]);
        let mut random = RandomImpl::new(0);
        starknet::testing::set_block_timestamp(1);
        game.update(ref random, 1);
        assert(game.over != 0, 'Game: not over');
    }
}

