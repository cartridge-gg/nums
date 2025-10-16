pub use crate::models::index::Tournament;

pub mod errors {
    pub const TOURNAMENT_ALREADY_EXISTS: felt252 = 'Tournament: already exists';
    pub const TOURNAMENT_DOES_NOT_EXIST: felt252 = 'Tournament: does not exist';
    pub const TOURNAMENT_HAS_NOT_STARTED: felt252 = 'Tournament: has not started';
    pub const TOURNAMENT_IS_NOT_OVER: felt252 = 'Tournament: is not over';
    pub const TOURNAMENT_INVALID_TIME: felt252 = 'Tournament: invalid time';
}

#[generate_trait]
pub impl TournamentImpl of TournamentTrait {
    #[inline]
    fn new(id: u64, start_time: u64, duration: u64) -> Tournament {
        // [Check] Times are valid
        TournamentAssert::assert_valid_time(start_time);
        let end_time = start_time + duration;
        // [Return] New tournament
        Tournament { id: id, entry_count: 0, start_time: start_time, end_time: end_time }
    }

    #[inline]
    fn has_started(self: @Tournament) -> bool {
        starknet::get_block_timestamp() >= *self.start_time
    }

    #[inline]
    fn is_over(self: @Tournament) -> bool {
        starknet::get_block_timestamp() > *self.end_time
    }

    #[inline]
    fn exists(self: @Tournament) -> bool {
        self.end_time != @0
    }

    #[inline]
    fn enter(ref self: Tournament) {
        // [Effect] Increment entry count
        self.entry_count += 1;
    }
}

#[generate_trait]
pub impl TournamentAssert of AssertTrait {
    fn assert_not_exist(self: @Tournament) {
        assert(!self.exists(), errors::TOURNAMENT_ALREADY_EXISTS);
    }

    fn assert_does_exist(self: @Tournament) {
        assert(self.exists(), errors::TOURNAMENT_DOES_NOT_EXIST);
    }

    fn assert_has_started(self: @Tournament) {
        assert(self.has_started(), errors::TOURNAMENT_HAS_NOT_STARTED);
    }

    fn assert_is_over(self: @Tournament) {
        assert(self.is_over(), errors::TOURNAMENT_IS_NOT_OVER);
    }

    fn assert_valid_time(time: u64) {
        assert(time != 0, errors::TOURNAMENT_INVALID_TIME);
    }
}

#[cfg(test)]
mod tests {
    use starknet::testing::set_block_timestamp;
    use super::{TournamentAssert, TournamentTrait};

    pub const TOURNAMENT_ID: u64 = 1;
    pub const START_TIME: u64 = 1000;
    pub const DURATION: u64 = 1000;

    #[test]
    fn test_tournament_has_started() {
        set_block_timestamp(START_TIME - 1);
        let tournament = TournamentTrait::new(TOURNAMENT_ID, START_TIME, DURATION);
        assert_eq!(tournament.has_started(), false);
    }

    #[test]
    fn test_tournament_is_over() {
        set_block_timestamp(DURATION + 1);
        let tournament = TournamentTrait::new(TOURNAMENT_ID, START_TIME, DURATION);
        assert_eq!(tournament.is_over(), true);
    }

    #[test]
    fn test_tournament_assert_has_started() {
        let tournament = TournamentTrait::new(TOURNAMENT_ID, START_TIME, DURATION);
        TournamentAssert::assert_has_started(@tournament);
    }

    #[test]
    fn test_tournament_assert_is_over() {
        let tournament = TournamentTrait::new(TOURNAMENT_ID, START_TIME, DURATION);
        TournamentAssert::assert_is_over(@tournament);
    }

    #[test]
    fn test_tournament_assert_does_exist() {
        let tournament = TournamentTrait::new(TOURNAMENT_ID, START_TIME, DURATION);
        TournamentAssert::assert_does_exist(@tournament);
    }

    #[test]
    fn test_tournament_assert_not_exist() {
        let mut tournament = TournamentTrait::new(TOURNAMENT_ID, START_TIME, DURATION);
        tournament.end_time = 0;
        TournamentAssert::assert_not_exist(@tournament);
    }
}
