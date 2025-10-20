/// Imports
use core::array::ArrayTrait;
use crate::constants::SLOT_SIZE;
pub use crate::helpers::bitmap::Bitmap;
use crate::helpers::deck::DeckTrait;
use crate::helpers::packer::Packer;
pub use crate::models::index::Game;
use crate::random::{Random, RandomImpl};
use crate::types::game_config::{DefaultGameConfig, GameConfig};
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
}

pub const REWARD_LEVELS: [u32; 21] = [
    0, 1, 4, 10, 20, 35, 60, 100, 160, 225, 300, 600, 900, 1800, 2500, 4000, 6500, 8000, 10000,
    20000, 42000,
];

pub const SCALE_FACTOR: u32 = 100;
pub const HALF_SCALE_FACTOR: u32 = 50;

/// Implementation of core game logic and state management
#[generate_trait]
pub impl GameImpl of GameTrait {
    /// Creates a new game instance with the specified parameters.
    #[inline]
    fn new(id: u64, config: GameConfig) -> Game {
        // [Return] Game
        Game {
            game_id: id,
            over: false,
            claimed: false,
            level: 0,
            slot_count: config.max_slots,
            slot_min: config.min_number,
            slot_max: config.max_number,
            number: 0,
            next_number: 0,
            powers: 0,
            reward: 0,
            score: 0,
            tournament_id: 0,
            slots: 0,
        }
    }

    #[inline]
    fn powers(tournament_id: u16) -> u16 {
        let mut deck = DeckTrait::new(tournament_id.into(), POWER_COUNT.into());
        let power: Power = deck.draw().into();
        let bitmap = Bitmap::set(0, power.index());
        let power: Power = deck.draw().into();
        let bitmap = Bitmap::set(bitmap, power.index());
        let power: Power = deck.draw().into();
        Bitmap::set(bitmap, power.index())
    }

    #[inline]
    fn start(ref self: Game, tournament_id: u16, number: u16) {
        // [Check] Game has not started yet
        self.assert_not_started();
        // [Check] Number is valid
        GameAssert::assert_valid_number(number);
        // [Effect] Start game
        self.tournament_id = tournament_id;
        self.powers = Self::powers(tournament_id);
        self.number = number;
    }

    #[inline]
    fn slots(self: @Game) -> Array<u16> {
        let slots: u256 = (*self.slots).into();
        Packer::unpack(slots, SLOT_SIZE, *self.slot_count)
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
            if next != @0 && current >= next {
                valid = false;
                break;
            }
            idx += 1;
        }
        valid
    }

    /// Validates that the given array of numbers is in ascending order.
    fn score(self: @Game, ref slots: Array<u16>) -> u32 {
        // [Compute] Difficulty score
        let step: u32 = (*self.slot_max - *self.slot_min).into()
            * SCALE_FACTOR
            / (*self.slot_count + 1).into();

        let mut total = 0;
        let mut index = 0;
        let mut sum_r = 0;
        let slot_min: u32 = (*self.slot_min).into();
        let slot_max: u32 = (*self.slot_max).into();
        while let Option::Some(slot) = slots.pop_front() {
            index += 1;
            if slot == 0 {
                continue;
            }
            total += 1;
            // Rounding to the nearest integer to perfectly center
            let uniform: u32 = slot_min + (index * step + HALF_SCALE_FACTOR) / SCALE_FACTOR;
            let r = if slot.into() < uniform {
                uniform - slot.into()
            } else {
                slot.into() - uniform
            };
            sum_r += r * r;
        }

        let difficulty_score = sum_r / total;

        // [Compute] Base score
        let count = slot_max + slot_min;
        let base_score = count * count * total;

        // [Return] Score
        difficulty_score + base_score
    }

    /// Determines if the game has ended based on current state and configuration.
    fn is_over(self: @Game, slots: Array<u16>) -> bool {
        // [Check] All slots have been filled
        if self.level == self.slot_count {
            return true;
        }

        // [Check] There is a valid empty slot for next number
        let max_slots: u32 = (*self.slot_count).into();
        let number = *self.number;
        let mut idx = 0;
        let mut slot = *slots.at(idx);
        let mut prev_number = 0;
        while idx < (max_slots - 1) {
            let next_slot = *slots.at(idx + 1);

            if slot == 0 && number < next_slot && number > prev_number {
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

    /// Generates a random `u16` number between `min` and `max` that is not already present in the
    /// given array `nums`.
    fn next(ref self: Game, slots: @Array<u16>, ref rand: Random) -> u16 {
        // [Check] Next number is set
        if self.next_number != 0 {
            let number = self.next_number;
            self.next_number = 0;
            return number;
        }
        // [Compute] Draw a random number between the min and max
        let min = self.slot_min;
        let max = self.slot_max;
        _next(min, max, slots, ref rand)
    }

    /// Rewards the game for the current level.
    #[inline]
    fn reward(ref self: Game) {
        self.reward = *REWARD_LEVELS.span().at(self.level.into());
    }

    /// Levels up the game.
    #[inline]
    fn level_up(ref self: Game) {
        self.level += 1;
    }

    /// Place number
    fn place(ref self: Game, index: u8) {
        // [Check] Index is valid
        self.assert_valid_index(index);
        // [Check] Target slot is empty
        let slots: u256 = self.slots.into();
        let slot = Packer::get(slots, index, SLOT_SIZE, self.slot_count);
        assert(slot == 0, errors::GAME_SLOT_NOT_EMPTY);
        // [Effect] Place number
        self
            .slots = Packer::replace(slots, index, SLOT_SIZE, self.number, self.slot_count)
            .try_into()
            .unwrap();
    }

    /// Updates the game state.
    #[inline]
    fn update(ref self: Game, ref rand: Random) {
        self.reward();
        self.level_up();
        let mut slots = self.slots();
        self.over = self.is_over(slots.clone());
        if !self.over {
            self.number = self.next(@slots, ref rand);
        }
        self.score = self.score(ref slots);
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
        assert(self.number != @0, errors::GAME_DOES_NOT_EXIST);
    }

    /// Asserts that the game does not exist (has not been initialized).
    #[inline]
    fn assert_not_exist(self: @Game) {
        assert(self.number == @0, errors::GAME_ALREADY_EXISTS);
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

    /// Asserts that the game has not started yet.
    #[inline]
    fn assert_not_started(self: @Game) {
        assert(self.tournament_id == @0, errors::GAME_ALREADY_STARTED);
    }

    /// Asserts game is not over.
    #[inline]
    fn assert_not_over(self: @Game) {
        assert(!*self.over, errors::GAME_IS_OVER);
    }
}

#[cfg(test)]
mod tests {
    use core::array::ArrayTrait;
    use crate::constants::SLOT_SIZE;
    use crate::helpers::packer::Packer;
    use crate::types::game_config::GameConfig;
    use super::{Game, GameAssert, GameTrait};

    /// Helper function to create a test game configuration
    /// Uses realistic production values: 20 slots, numbers from 1-999
    fn test_game_config() -> GameConfig {
        GameConfig {
            max_slots: 20,
            max_number: 999,
            min_number: 1,
            entry_cost: 1000,
            game_duration: 300 // 5 minutes
        }
    }

    /// Helper function to create a test game instance
    fn create_test_game() -> Game {
        let mut game = GameTrait::new(1, test_game_config());
        game.start(1, 10);
        game
    }

    /// Helper to create slots array
    fn create_slots(game_id: u64, mut numbers: Array<u16>, size: u8) -> Array<u16> {
        let mut slots = array![];
        let mut index: u8 = 0;
        while let Option::Some(number) = numbers.pop_front() {
            slots.append(number);
            index += 1;
        }
        while index < size {
            slots.append(0);
            index += 1;
        }
        slots
    }

    #[test]
    fn test_new_game_creation() {
        let game = GameTrait::new(1, test_game_config());
        assert(game.game_id == 1, 'Game ID should be 1');
        assert(game.level == 0, 'Initial level should be 0');
        assert(game.number == 0, 'Next number should match input');
        assert(game.reward == 0, 'Initial reward should be 0');
        assert(game.tournament_id == 0, 'Initial jackpot ID should be 0');
        assert(!game.over, 'Game is over initially');
    }

    #[test]
    fn test_is_valid_single_element() {
        let mut game = create_test_game();
        let slots: u256 = Packer::pack(array![42], SLOT_SIZE);
        game.slots = slots.try_into().unwrap();
        assert(game.is_valid(), 'Single element invalid');
    }

    #[test]
    fn test_is_valid_empty_array() {
        let game = create_test_game();
        assert(game.is_valid(), 'Empty array invalid');
    }

    #[test]
    fn test_is_valid_ascending_order() {
        let mut game = create_test_game();
        let slots: u256 = Packer::pack(array![1, 5, 10, 15], SLOT_SIZE);
        game.slots = slots.try_into().unwrap();
        assert(game.is_valid(), 'Ascending order invalid');
    }

    #[test]
    fn test_is_valid_not_ascending() {
        let mut game = create_test_game();
        let slots: u256 = Packer::pack(array![10, 5, 15], SLOT_SIZE);
        game.slots = slots.try_into().unwrap();
        assert(!game.is_valid(), 'Not ascending is valid');
    }

    #[test]
    fn test_is_valid_equal_elements() {
        let mut game = create_test_game();
        let slots: u256 = Packer::pack(array![5, 5], SLOT_SIZE);
        game.slots = slots.try_into().unwrap();
        assert(!game.is_valid(), 'Equal elements valid');
    }

    #[test]
    fn test_assert_does_exist_valid_game() {
        let game = create_test_game();
        // This should not panic
        GameAssert::assert_does_exist(@game);
    }

    #[test]
    #[should_panic(expected: ('Game: does not exist',))]
    fn test_assert_does_exist_invalid_game() {
        let mut game = create_test_game();
        game.number = 0; // Make it invalid

        GameAssert::assert_does_exist(@game);
    }

    #[test]
    fn test_assert_not_exist_valid() {
        let mut game = create_test_game();
        game.number = 0; // Make it not exist

        // This should not panic
        GameAssert::assert_not_exist(@game);
    }

    #[test]
    #[should_panic(expected: ('Game: already exists',))]
    fn test_assert_not_exist_invalid() {
        let game = create_test_game();

        GameAssert::assert_not_exist(@game);
    }

    #[test]
    fn test_assert_is_valid_valid_numbers() {
        let mut game = create_test_game();
        let slots: u256 = Packer::pack(array![1, 5, 10], SLOT_SIZE);
        game.slots = slots.try_into().unwrap();
        GameAssert::assert_is_valid(@game);
    }

    #[test]
    #[should_panic(expected: ('Game: slots not valid',))]
    fn test_assert_is_valid_invalid_numbers() {
        let mut game = create_test_game();
        let slots: u256 = Packer::pack(array![10, 5, 1], SLOT_SIZE);
        game.slots = slots.try_into().unwrap();
        GameAssert::assert_is_valid(@game);
    }

    #[test]
    fn test_is_over_all_slots_filled() {
        let mut game = create_test_game();
        game.level = 20; // All slots filled
        let slots: u256 = Packer::pack(
            array![
                10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180,
                190, 200,
            ],
            SLOT_SIZE,
        );
        game.slots = slots.try_into().unwrap();
        let slots = game.slots();
        assert(game.is_over(slots), 'Not over with full slots');
    }

    #[test]
    fn test_is_over_empty_slot_at_end_can_fit() {
        let mut game = create_test_game();
        game.level = 19;
        game.number = 500;
        let slots: Array<u16> = array![
            10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 0,
        ];
        let pack: u256 = Packer::pack(slots.clone(), SLOT_SIZE);
        game.slots = pack.try_into().unwrap();
        assert(!game.is_over(slots), 'Over but can fit at end');
    }

    #[test]
    fn test_is_over_empty_slot_at_end_cannot_fit() {
        let mut game = create_test_game();
        game.level = 19;
        game.number = 300;
        let slots: Array<u16> = array![
            10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190,
            400,
        ];
        let pack: u256 = Packer::pack(slots.clone(), SLOT_SIZE);
        game.slots = pack.try_into().unwrap();
        assert(game.is_over(slots), 'Not over but cannot fit');
    }

    #[test]
    fn test_is_over_empty_slot_at_beginning_can_fit() {
        let mut game = create_test_game();
        game.level = 19;
        game.number = 5;
        let slots: Array<u16> = array![
            0, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190,
            200,
        ];
        let pack: u256 = Packer::pack(slots.clone(), SLOT_SIZE);
        game.slots = pack.try_into().unwrap();
        assert(!game.is_over(slots), 'Over but can fit at start');
    }

    #[test]
    fn test_is_over_empty_slot_in_middle_can_fit() {
        let mut game = create_test_game();
        game.level = 5;
        game.number = 150;
        let slots: Array<u16> = array![10, 20, 30, 100, 0, 0, 200];
        let pack: u256 = Packer::pack(slots.clone(), SLOT_SIZE);
        game.slots = pack.try_into().unwrap();
        assert(!game.is_over(slots), 'Over but can fit in middle');
    }

    #[test]
    fn test_is_over_empty_slot_in_middle_cannot_fit() {
        let mut game = create_test_game();
        game.level = 5;
        game.number = 150;
        let slots: Array<u16> = array![10, 20, 30, 100, 200];
        let pack: u256 = Packer::pack(slots.clone(), SLOT_SIZE);
        game.slots = pack.try_into().unwrap();
        assert(game.is_over(game.slots()), 'Not over but too large');
    }

    #[test]
    fn test_is_over_number_smaller_than_first() {
        let mut game = create_test_game();
        game.level = 3;
        game.number = 5;
        let slots: Array<u16> = array![10, 50, 100];
        let pack: u256 = Packer::pack(slots.clone(), SLOT_SIZE);
        game.slots = pack.try_into().unwrap();
        assert(game.is_over(slots), 'Not over with small number');
    }

    #[test]
    fn test_is_over_gaps_between_numbers() {
        let mut game = create_test_game();
        game.level = 4;
        game.number = 75; // Fits between 50 and 100
        let slots: Array<u16> = array![10, 50, 0, 100, 500];
        let pack: u256 = Packer::pack(slots.clone(), SLOT_SIZE);
        game.slots = pack.try_into().unwrap();
        assert(!game.is_over(slots), 'Over with valid gap');
    }

    #[test]
    fn test_is_over_only_one_slot_filled() {
        let mut game = create_test_game();
        game.level = 1;
        game.number = 500;
        let slots: Array<u16> = array![100];
        let pack: u256 = Packer::pack(slots.clone(), SLOT_SIZE);
        game.slots = pack.try_into().unwrap();
        let slots = game.slots();
        assert(!game.is_over(slots), 'Over with one slot filled');
    }

    #[test]
    fn test_score_with_uniform_distribution() {
        let mut game = create_test_game();
        let mut slots = array![
            47, 95, 142, 190, 238, 285, 333, 380, 428, 476, 523, 571, 619, 666, 714, 761, 809, 857,
            904, 952,
        ];
        let pack: u256 = Packer::pack(slots.clone(), SLOT_SIZE);
        game.slots = pack.try_into().unwrap();
        let score = game.score(ref slots);
        assert(score == 20000000, 'Score should be 0');
    }

    #[test]
    fn test_score_with_non_uniform_distribution_symmetric() {
        let mut game = create_test_game();
        let mut slots = array![
            980, 981, 982, 983, 984, 985, 986, 987, 988, 989, 990, 991, 992, 993, 994, 995, 996,
            997, 998, 999,
        ];
        let pack: u256 = Packer::pack(slots.clone(), SLOT_SIZE);
        game.slots = pack.try_into().unwrap();
        let high_score = game.score(ref slots);
        let mut slots = array![
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        ];
        let pack: u256 = Packer::pack(slots.clone(), SLOT_SIZE);
        game.slots = pack.try_into().unwrap();
        let low_score = game.score(ref slots);
        assert_eq!(high_score, low_score, "High and low scores should be equal");
    }

    #[test]
    fn test_score_with_highest_scores() {
        let mut game = create_test_game();
        let mut slots = array![0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
        let pack: u256 = Packer::pack(slots.clone(), SLOT_SIZE);
        game.slots = pack.try_into().unwrap();
        let low_score = game.score(ref slots);
        let mut slots = array![999, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let pack: u256 = Packer::pack(slots.clone(), SLOT_SIZE);
        game.slots = pack.try_into().unwrap();
        let high_score = game.score(ref slots);
        assert_eq!(low_score, high_score, "Low and high scores should be equal");
    }
}
