pub use crate::models::index::Tournament;

pub mod errors {
    pub const TOURNAMENT_ALREADY_EXISTS: felt252 = 'Tournament: already exists';
    pub const TOURNAMENT_DOES_NOT_EXIST: felt252 = 'Tournament: does not exist';
}

#[generate_trait]
pub impl TournamentImpl of TournamentTrait {
    #[inline]
    fn new(uuid: u64, id: u64) -> Tournament {
        Tournament { uuid: uuid, id: id }
    }

    #[inline]
    fn exists(self: @Tournament) -> bool {
        self.id != @0
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
}
