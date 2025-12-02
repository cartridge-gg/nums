use crate::helpers::bitmap::Bitmap;
pub use crate::models::index::Tournament;

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
    fn new(id: u16, usage: felt252) -> Tournament {
        // [Check] Times are valid
        let start_time = Self::start_time(id);
        let end_time = start_time + Self::duration(id);
        // [Return] New tournament
        Tournament {
            id: id,
            powers: 0,
            entry_count: 0,
            start_time: start_time,
            end_time: end_time,
            usage: usage,
        }
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

    #[inline]
    fn capacity(self: @Tournament, games_len: u32, max: u8) -> u32 {
        // Top 10% of entrants with specific criteria for low entry counts
        // https://www.wsoponline.com/how-to-play-poker/mtt-tournament-payouts/
        let entry_count = *self.entry_count;
        let entry_criteria = if entry_count < 3 {
            1
        } else if entry_count < 11 {
            2
        } else {
            (entry_count + 9) / 10
        };
        let games_criteria = core::cmp::min(games_len, max.into());
        core::cmp::min(entry_criteria, games_criteria)
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
    pub const USAGE: felt252 = 12345;
    pub const MAX_CAPACITY: u8 = 5;

    #[test]
    fn test_tournament_has_started() {
        let tournament = TournamentTrait::new(TOURNAMENT_ID, USAGE);
        set_block_timestamp(tournament.start_time - 1);
        assert_eq!(tournament.has_started(), false);
    }

    #[test]
    fn test_tournament_is_over() {
        let tournament = TournamentTrait::new(TOURNAMENT_ID, USAGE);
        set_block_timestamp(tournament.end_time + 1);
        assert_eq!(tournament.is_over(), true);
    }

    #[test]
    fn test_tournament_assert_has_started() {
        let tournament = TournamentTrait::new(TOURNAMENT_ID, USAGE);
        set_block_timestamp(tournament.start_time + 1);
        TournamentAssert::assert_has_started(@tournament);
    }

    #[test]
    fn test_tournament_assert_is_over() {
        let tournament = TournamentTrait::new(TOURNAMENT_ID, USAGE);
        set_block_timestamp(tournament.end_time + 1);
        TournamentAssert::assert_is_over(@tournament);
    }

    #[test]
    fn test_tournament_assert_does_exist() {
        let tournament = TournamentTrait::new(TOURNAMENT_ID, USAGE);
        TournamentAssert::assert_does_exist(@tournament);
    }

    #[test]
    fn test_tournament_assert_not_exist() {
        let mut tournament = TournamentTrait::new(TOURNAMENT_ID, USAGE);
        tournament.end_time = 0;
        TournamentAssert::assert_not_exist(@tournament);
    }

    #[test]
    fn test_tournament_capacity() {
        let mut tournament = TournamentTrait::new(TOURNAMENT_ID, USAGE);
        // No games
        tournament.entry_count = 0;
        assert_eq!(tournament.capacity(0, MAX_CAPACITY), 0);
        tournament.entry_count = 1;
        assert_eq!(tournament.capacity(0, MAX_CAPACITY), 0);
        tournament.entry_count = 5;
        assert_eq!(tournament.capacity(0, MAX_CAPACITY), 0);
        tournament.entry_count = 10;
        assert_eq!(tournament.capacity(0, MAX_CAPACITY), 0);
        tournament.entry_count = 30;
        assert_eq!(tournament.capacity(0, MAX_CAPACITY), 0);
        tournament.entry_count = 40;
        assert_eq!(tournament.capacity(0, MAX_CAPACITY), 0);
        tournament.entry_count = 41;
        assert_eq!(tournament.capacity(0, MAX_CAPACITY), 0);
        tournament.entry_count = 100;
        assert_eq!(tournament.capacity(0, MAX_CAPACITY), 0);
        // One game
        tournament.entry_count = 1;
        assert_eq!(tournament.capacity(1, MAX_CAPACITY), 1);
        tournament.entry_count = 5;
        assert_eq!(tournament.capacity(1, MAX_CAPACITY), 1);
        tournament.entry_count = 10;
        assert_eq!(tournament.capacity(1, MAX_CAPACITY), 1);
        tournament.entry_count = 30;
        assert_eq!(tournament.capacity(1, MAX_CAPACITY), 1);
        tournament.entry_count = 40;
        assert_eq!(tournament.capacity(1, MAX_CAPACITY), 1);
        tournament.entry_count = 41;
        assert_eq!(tournament.capacity(1, MAX_CAPACITY), 1);
        tournament.entry_count = 100;
        assert_eq!(tournament.capacity(1, MAX_CAPACITY), 1);
        // Five games
        tournament.entry_count = 5;
        assert_eq!(tournament.capacity(5, MAX_CAPACITY), 2);
        tournament.entry_count = 10;
        assert_eq!(tournament.capacity(5, MAX_CAPACITY), 2);
        tournament.entry_count = 30;
        assert_eq!(tournament.capacity(5, MAX_CAPACITY), 2);
        tournament.entry_count = 40;
        assert_eq!(tournament.capacity(5, MAX_CAPACITY), 2);
        tournament.entry_count = 41;
        assert_eq!(tournament.capacity(5, MAX_CAPACITY), 2);
        tournament.entry_count = 100;
        assert_eq!(tournament.capacity(5, MAX_CAPACITY), 2);
        // Ten games
        tournament.entry_count = 10;
        assert_eq!(tournament.capacity(10, MAX_CAPACITY), 2);
        tournament.entry_count = 30;
        assert_eq!(tournament.capacity(10, MAX_CAPACITY), 2);
        tournament.entry_count = 40;
        assert_eq!(tournament.capacity(10, MAX_CAPACITY), 2);
        tournament.entry_count = 41;
        assert_eq!(tournament.capacity(10, MAX_CAPACITY), 2);
        tournament.entry_count = 100;
        assert_eq!(tournament.capacity(10, MAX_CAPACITY), 2);
    }
}
