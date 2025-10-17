/// Imports
use core::array::ArrayTrait;
pub use crate::models::index::Game;
use crate::random::{Random, RandomImpl};
use crate::types::game_config::{DefaultGameConfig, GameConfig};

/// Game-related error constants
pub mod errors {
    pub const GAME_DOES_NOT_EXIST: felt252 = 'Game: does not exist';
    pub const GAME_ALREADY_EXISTS: felt252 = 'Game: already exists';
    pub const GAME_SLOTS_NOT_VALID: felt252 = 'Game: slots not valid';
    pub const GAME_NUMBER_NOT_VALID: felt252 = 'Game: number not valid';
    pub const GAME_INDEX_NOT_VALID: felt252 = 'Game: index not valid';
    pub const GAME_HAS_EXPIRED: felt252 = 'Game: has expired';
    pub const GAME_ALREADY_STARTED: felt252 = 'Game: already started';
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
    fn new(id: u64, now: u64, number: u16, config: GameConfig) -> Game {
        // [Check] Number is valid
        GameAssert::assert_valid_number(number);

        // [Return] Game
        Game {
            game_id: id,
            level: 0,
            next_number: number,
            reward: 0,
            score: 0,
            tournament_id: 0,
            expires_at: now + config.game_duration,
            over: false,
            claimed: false,
        }
    }

    #[inline]
    fn start(ref self: Game, tournament_id: u64) {
        // [Check] Game has not started yet
        self.assert_not_started();
        // [Effect] Start game
        self.tournament_id = tournament_id;
    }

    /// Validates that the given array of numbers is in ascending order.
    fn is_valid(self: @Game, nums: @Array<u16>) -> bool {
        let len = nums.len();
        if len < 2 {
            return true;
        }

        let mut valid = true;
        let mut idx = 0;

        while idx < (len - 1) {
            if *nums.at(idx) >= *nums.at(idx + 1) {
                valid = false;
                break;
            }
            idx += 1;
        }

        valid
    }

    /// Validates that the given array of numbers is in ascending order.
    fn score(self: @Game, config: GameConfig, mut slots: Array<u16>) -> u32 {
        // [Check] Slots size is valid
        assert(slots.len() == config.max_slots.into(), errors::GAME_SLOTS_NOT_VALID);

        // [Compute] Difficulty score
        let step: u32 = (config.max_number - config.min_number).into()
            * SCALE_FACTOR
            / (config.max_slots + 1).into();

        let mut total = 0;
        let mut index = 0;
        let mut sum_r = 0;

        while let Option::Some(slot) = slots.pop_front() {
            index += 1;
            if slot == 0 {
                continue;
            }
            total += 1;

            // Rounding to the nearest integer to perfectly center
            let uniform: u32 = config.min_number.into()
                + (index * step + HALF_SCALE_FACTOR) / SCALE_FACTOR;

            let r = if slot.into() < uniform {
                uniform - slot.into()
            } else {
                slot.into() - uniform
            };

            sum_r += r * r;
        }

        let difficulty_score = sum_r / total;

        // [Compute] Base score
        let count: u32 = (config.max_number + config.min_number).into();
        let base_score = count * count * total;

        // [Return] Score
        difficulty_score + base_score
    }

    /// Checks if the game has expired based on the current block timestamp.
    #[inline]
    fn has_expired(self: @Game) -> bool {
        let time = *self.expires_at;
        time != 0 && starknet::get_block_timestamp() >= time
    }

    /// Determines if the game has ended based on current state and configuration.
    fn is_over(self: @Game, config: GameConfig, slots: @Array<u16>) -> bool {
        // [Check] Slots size is valid
        assert(slots.len() == config.max_slots.into(), errors::GAME_SLOTS_NOT_VALID);

        // [Check] All slots have been filled
        if *self.level == config.max_slots {
            return true;
        }

        // [Check] There is a valid empty slot for next number
        let max_slots: u32 = config.max_slots.into();
        let next_number = *self.next_number;
        let mut idx = 0;
        let mut slot = *slots.at(idx);
        let mut prev_number = 0;
        while idx < (max_slots - 1) {
            let next_slot = *slots.at(idx + 1);

            if slot == 0 && next_number < next_slot && next_number > prev_number {
                return false;
            }
            if slot != 0 && next_number < slot {
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
    fn next(ref rand: Random, mut nums: @Array<u16>, min: u16, max: u16) -> u16 {
        let random = rand.between::<u16>(min, max);
        let mut reroll = false;
        let mut idx = 0_u32;

        while idx < nums.len() {
            if *nums.at(idx) == random {
                reroll = true;
                break;
            }

            idx += 1;
        }

        match reroll {
            true => Self::next(ref rand, nums, min, max),
            false => random,
        }
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

    /// Updates the game state.
    #[inline]
    fn update(ref self: Game, ref rand: Random, nums: @Array<u16>, config: GameConfig) {
        self.score = self.score(config, nums.clone());
        self.reward();
        self.level_up();
        self.over = self.has_expired() || self.is_over(config, nums);
        if !self.over {
            self.next_number = Self::next(ref rand, nums, config.min_number, config.max_number);
        }
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
        assert(self.next_number != @0, errors::GAME_DOES_NOT_EXIST);
    }

    /// Asserts that the game does not exist (has not been initialized).
    #[inline]
    fn assert_not_exist(self: @Game) {
        assert(self.next_number == @0, errors::GAME_ALREADY_EXISTS);
    }

    /// Asserts that the given array of numbers is in valid ascending order.
    #[inline]
    fn assert_is_valid(self: @Game, nums: @Array<u16>) {
        assert(self.is_valid(nums), errors::GAME_SLOTS_NOT_VALID);
    }

    /// Asserts that the given number is valid.
    #[inline]
    fn assert_valid_number(number: u16) {
        assert(number != 0, errors::GAME_NUMBER_NOT_VALID);
    }

    /// Asserts that the given index is valid.
    #[inline]
    fn assert_valid_index(self: @Game, config: GameConfig, index: u8) {
        assert(index < config.max_slots, errors::GAME_INDEX_NOT_VALID);
    }

    /// Asserts that the game has not expired.
    #[inline]
    fn assert_not_expired(self: @Game) {
        assert(!self.has_expired(), errors::GAME_HAS_EXPIRED);
    }

    /// Asserts that the game has not started yet.
    #[inline]
    fn assert_not_started(self: @Game) {
        assert(self.tournament_id == @0, errors::GAME_ALREADY_STARTED);
    }
}

#[cfg(test)]
mod tests {
    use core::array::ArrayTrait;
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
        GameTrait::new(1, 1000, 10, test_game_config())
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
        let config = test_game_config();
        let now = 500;
        let first_number = 15;

        let game = GameTrait::new(1, now, first_number, config);

        assert(game.game_id == 1, 'Game ID should be 1');
        assert(game.level == 0, 'Initial level should be 0');
        assert(game.next_number == first_number, 'Next number should match input');
        assert(game.reward == 0, 'Initial reward should be 0');
        assert(game.tournament_id == 0, 'Initial jackpot ID should be 0');
        assert(game.expires_at == now + config.game_duration, 'Expiration time is incorrect');
        assert(!game.over, 'Game is over initially');
    }

    #[test]
    fn test_is_valid_single_element() {
        let game = create_test_game();
        let mut nums = ArrayTrait::<u16>::new();
        nums.append(42);

        assert(game.is_valid(@nums), 'Single element invalid');
    }

    #[test]
    fn test_is_valid_empty_array() {
        let game = create_test_game();
        let nums = ArrayTrait::<u16>::new();

        assert(game.is_valid(@nums), 'Empty array invalid');
    }

    #[test]
    fn test_is_valid_ascending_order() {
        let game = create_test_game();
        let mut nums = ArrayTrait::<u16>::new();
        nums.append(1);
        nums.append(5);
        nums.append(10);
        nums.append(15);

        assert(game.is_valid(@nums), 'Ascending order invalid');
    }

    #[test]
    fn test_is_valid_not_ascending() {
        let game = create_test_game();
        let mut nums = ArrayTrait::<u16>::new();
        nums.append(10);
        nums.append(5);
        nums.append(15);

        assert(!game.is_valid(@nums), 'Not ascending is valid');
    }

    #[test]
    fn test_is_valid_equal_elements() {
        let game = create_test_game();
        let mut nums = ArrayTrait::<u16>::new();
        nums.append(5);
        nums.append(5);

        assert(!game.is_valid(@nums), 'Equal elements valid');
    }

    #[test]
    fn test_has_expired() {
        let mut game = create_test_game();
        game.expires_at = 2000;

        // Note: In real tests, you'd need to mock starknet::get_block_timestamp()
        assert(!game.has_expired(), 'Game expired');
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
        game.next_number = 0; // Make it invalid

        GameAssert::assert_does_exist(@game);
    }

    #[test]
    fn test_assert_not_exist_valid() {
        let mut game = create_test_game();
        game.next_number = 0; // Make it not exist

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
        let game = create_test_game();
        let mut nums = ArrayTrait::<u16>::new();
        nums.append(1);
        nums.append(5);
        nums.append(10);

        // This should not panic
        GameAssert::assert_is_valid(@game, @nums);
    }

    #[test]
    #[should_panic(expected: ('Game: slots not valid',))]
    fn test_assert_is_valid_invalid_numbers() {
        let game = create_test_game();
        let mut nums = ArrayTrait::<u16>::new();
        nums.append(10);
        nums.append(5);
        nums.append(1);

        GameAssert::assert_is_valid(@game, @nums);
    }

    #[test]
    fn test_game_state_transitions() {
        let config = test_game_config();
        let mut game = GameTrait::new(1, 1000, 5, config);

        // Initial state
        assert(game.level == 0, 'Initial level should be 0');
        assert(!game.over, 'Game is over initially');

        // Simulate filling slots (this would normally be done through the store)
        game.level = 3;
        assert(game.level == 3, 'Level should be updated');

        // Game over when all slots filled
        game.level = config.max_slots;
        assert(game.level == 20, 'All 20 slots should be filled');
    }

    #[test]
    fn test_new_game_with_max_values() {
        let config = test_game_config();
        let now = 1000;
        let number = 999; // Max number

        let game = GameTrait::new(100, now, number, config);

        assert(game.game_id == 100, 'Game ID should be 100');
        assert(game.next_number == 999, 'Next number should be max');
        assert(game.level == 0, 'Level should be 0');
    }

    #[test]
    fn test_new_game_with_min_values() {
        let config = test_game_config();
        let now = 0;
        let number = 1; // Min number

        let game = GameTrait::new(1, now, number, config);

        assert(game.game_id == 1, 'Game ID should be 1');
        assert(game.next_number == 1, 'Next number should be min');
        assert(game.expires_at == config.game_duration, 'Expiration should be duration');
    }

    #[test]
    fn test_is_over_all_slots_filled() {
        let config = test_game_config();
        let mut game = create_test_game();
        game.level = 20; // All slots filled

        let numbers = array![
            10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190,
            200,
        ];
        let slots = create_slots(1, numbers, config.max_slots);

        assert(game.is_over(config, @slots), 'Not over with full slots');
    }

    #[test]
    fn test_is_over_empty_slot_at_end_can_fit() {
        let config = test_game_config();
        let mut game = create_test_game();
        game.level = 19;
        game.next_number = 500; // Can fit after 400

        let numbers = array![
            10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190,
        ];
        let slots = create_slots(1, numbers, config.max_slots);

        assert(!game.is_over(config, @slots), 'Over but can fit at end');
    }

    #[test]
    fn test_is_over_empty_slot_at_end_cannot_fit() {
        let config = test_game_config();
        let mut game = create_test_game();
        game.level = 19;
        game.next_number = 300; // Cannot fit - less than last (400)

        let numbers = array![
            10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190,
            400,
        ];
        let slots = create_slots(1, numbers, config.max_slots);

        assert(game.is_over(config, @slots), 'Not over but cannot fit');
    }

    #[test]
    fn test_is_over_empty_slot_at_beginning_can_fit() {
        let config = test_game_config();
        let mut game = create_test_game();
        game.level = 19;
        game.next_number = 5; // Can fit before 10

        let numbers = array![
            0, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190,
            200,
        ];
        let slots = create_slots(1, numbers, config.max_slots);

        assert(!game.is_over(config, @slots), 'Over but can fit at start');
    }

    #[test]
    fn test_is_over_empty_slot_in_middle_can_fit() {
        let config = test_game_config();
        let mut game = create_test_game();
        game.level = 5;
        game.next_number = 150; // Can fit between 100 and 200

        // Slots: 10, 20, 30, 100, 200, [empty], ..., [empty]
        let mut numbers = array![10, 20, 30, 100, 0, 0, 200];
        let slots = create_slots(1, numbers, config.max_slots);

        assert(!game.is_over(config, @slots), 'Over but can fit in middle');
    }

    #[test]
    fn test_is_over_empty_slot_in_middle_cannot_fit() {
        let config = test_game_config();
        let mut game = create_test_game();
        game.level = 5;
        game.next_number = 150; // Cannot fit - too large

        // Slots: 10, 20, 30, 100, 200, [empty], ..., [empty]
        let mut numbers = array![10, 20, 30, 100, 200];
        let slots = create_slots(1, numbers, config.max_slots);

        assert(game.is_over(config, @slots), 'Not over but too large');
    }

    #[test]
    fn test_is_over_next_number_smaller_than_first() {
        let config = test_game_config();
        let mut game = create_test_game();
        game.level = 3;
        game.next_number = 5; // Smaller than first filled slot (10)

        let numbers = array![10, 50, 100];
        let slots = create_slots(1, numbers, config.max_slots);

        assert(game.is_over(config, @slots), 'Not over with small number');
    }

    #[test]
    fn test_is_over_gaps_between_numbers() {
        let config = test_game_config();
        let mut game = create_test_game();
        game.level = 4;
        game.next_number = 75; // Fits between 50 and 100

        // Slots with gaps: 10, 50, 100, 500
        let numbers = array![10, 50, 0, 100, 500];
        let slots = create_slots(1, numbers, config.max_slots);

        assert(!game.is_over(config, @slots), 'Over with valid gap');
    }

    #[test]
    fn test_is_over_only_one_slot_filled() {
        let config = test_game_config();
        let mut game = create_test_game();
        game.level = 1;
        game.next_number = 500; // Can fit after 100

        let numbers = array![100];
        let slots = create_slots(1, numbers, config.max_slots);

        assert(!game.is_over(config, @slots), 'Over with one slot filled');
    }

    #[test]
    fn test_score_with_uniform_distribution() {
        let config = test_game_config();
        let mut game = create_test_game();
        let slots = array![
            47, 95, 142, 190, 238, 285, 333, 380, 428, 476, 523, 571, 619, 666, 714, 761, 809, 857,
            904, 952,
        ];
        let score = game.score(config, slots);
        assert(score == 20000000, 'Score should be 0');
    }

    #[test]
    fn test_score_with_non_uniform_distribution_symmetric() {
        let config = test_game_config();
        let mut game = create_test_game();
        let slots = array![
            980, 981, 982, 983, 984, 985, 986, 987, 988, 989, 990, 991, 992, 993, 994, 995, 996,
            997, 998, 999,
        ];
        let high_score = game.score(config, slots);
        let slots = array![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
        let low_score = game.score(config, slots);
        assert_eq!(high_score, low_score, "High and low scores should be equal");
    }

    #[test]
    fn test_score_with_highest_scores() {
        let config = test_game_config();
        let mut game = create_test_game();
        let slots = array![0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
        let low_score = game.score(config, slots);
        let slots = array![999, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let high_score = game.score(config, slots);
        assert_eq!(low_score, high_score, "Low and high scores should be equal");
    }
}
