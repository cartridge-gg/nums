pub use crate::helpers::bitmap::Bitmap;
pub use crate::models::index::Tournament;
pub use crate::types::power::{POWER_COUNT, Power, PowerTrait};

pub mod errors {
    pub const TOURNAMENT_ALREADY_EXISTS: felt252 = 'Tournament: already exists';
    pub const TOURNAMENT_DOES_NOT_EXIST: felt252 = 'Tournament: does not exist';
    pub const TOURNAMENT_HAS_NOT_STARTED: felt252 = 'Tournament: has not started';
    pub const TOURNAMENT_IS_NOT_OVER: felt252 = 'Tournament: is not over';
    pub const TOURNAMENT_INVALID_TIME: felt252 = 'Tournament: invalid time';
}

// Constants

pub const FOUR_DAYS: u64 = 4 * 24 * 60 * 60;
pub const ONE_WEEK: u64 = 7 * 24 * 60 * 60;

#[generate_trait]
pub impl TournamentImpl of TournamentTrait {
    #[inline]
    fn new(id: u16) -> Tournament {
        // [Check] Times are valid
        let start_time = Self::start_time(id);
        let end_time = start_time + Self::duration(id);
        // [Return] New tournament
        Tournament { id: id, powers: 0, entry_count: 0, start_time: start_time, end_time: end_time }
    }

    #[inline]
    fn uuid() -> u16 {
        let now = starknet::get_block_timestamp();
        ((now + FOUR_DAYS) / ONE_WEEK).try_into().unwrap()
    }

    #[inline]
    fn start_time(id: u16) -> u64 {
        id.into() * ONE_WEEK - FOUR_DAYS
    }

    #[inline]
    fn duration(id: u16) -> u64 {
        ONE_WEEK
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
    #[inline]
    fn assert_not_exist(self: @Tournament) {
        assert(!self.exists(), errors::TOURNAMENT_ALREADY_EXISTS);
    }

    #[inline]
    fn assert_does_exist(self: @Tournament) {
        assert(self.exists(), errors::TOURNAMENT_DOES_NOT_EXIST);
    }

    #[inline]
    fn assert_has_started(self: @Tournament) {
        assert(self.has_started(), errors::TOURNAMENT_HAS_NOT_STARTED);
    }

    #[inline]
    fn assert_not_over(self: @Tournament) {
        assert(!self.is_over(), errors::TOURNAMENT_IS_NOT_OVER);
    }

    #[inline]
    fn assert_is_over(self: @Tournament) {
        assert(self.is_over(), errors::TOURNAMENT_IS_NOT_OVER);
    }

    #[inline]
    fn assert_valid_time(time: u64) {
        assert(time != 0, errors::TOURNAMENT_INVALID_TIME);
    }
}

#[cfg(test)]
mod tests {
    use starknet::testing::set_block_timestamp;
    use super::{TournamentAssert, TournamentTrait};

    pub const TOURNAMENT_ID: u16 = 1;

    #[test]
    fn test_tournament_has_started() {
        let tournament = TournamentTrait::new(TOURNAMENT_ID);
        set_block_timestamp(tournament.start_time - 1);
        assert_eq!(tournament.has_started(), false);
    }

    #[test]
    fn test_tournament_is_over() {
        let tournament = TournamentTrait::new(TOURNAMENT_ID);
        set_block_timestamp(tournament.end_time + 1);
        assert_eq!(tournament.is_over(), true);
    }

    #[test]
    fn test_tournament_assert_has_started() {
        let tournament = TournamentTrait::new(TOURNAMENT_ID);
        set_block_timestamp(tournament.start_time + 1);
        TournamentAssert::assert_has_started(@tournament);
    }

    #[test]
    fn test_tournament_assert_is_over() {
        let tournament = TournamentTrait::new(TOURNAMENT_ID);
        set_block_timestamp(tournament.end_time + 1);
        TournamentAssert::assert_is_over(@tournament);
    }

    #[test]
    fn test_tournament_assert_does_exist() {
        let tournament = TournamentTrait::new(TOURNAMENT_ID);
        TournamentAssert::assert_does_exist(@tournament);
    }

    #[test]
    fn test_tournament_assert_not_exist() {
        let mut tournament = TournamentTrait::new(TOURNAMENT_ID);
        tournament.end_time = 0;
        TournamentAssert::assert_not_exist(@tournament);
    }
}
