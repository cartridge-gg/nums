pub use crate::models::index::{Game, Jackpot};
pub use crate::store::{Store, StoreImpl};

pub mod errors {
    pub const JACKPOT_INVALID_COUNT: felt252 = 'Jackpot: invalid count';
}

#[generate_trait]
pub impl JackpotImpl of JackpotTrait {
    #[inline]
    fn new(tournament_id: u64, max_count: u32) -> Jackpot {
        Jackpot {
            tournament_id: tournament_id, max_count: max_count, requirement: 0, games: array![],
        }
    }

    #[inline]
    fn exists(self: @Jackpot) -> bool {
        self.max_count != @0
    }

    fn insert(ref self: Jackpot, game: Game, ref store: Store) -> bool {
        // [Check] Game score matches requirement
        if game.score < self.requirement {
            return false;
        }

        // [Insert] Game into jackpot
        let mut jackpot = array![];
        let mut placed = false;
        let mut count = self.max_count;
        let mut index = 0;
        let mut position = 0;
        while let Option::Some(gid) = self.games.pop_front() {
            index += 1;
            let g = store.game(gid);
            if g.score < game.score && !placed && count != 0 {
                placed = true;
                jackpot.append(game);
                self.requirement = game.score;
                count -= 1;
                position = index;
            }
            if count == 0 {
                break;
            }
            jackpot.append(g);
            self.requirement = game.score;
            count -= 1;
        }

        // [Return] Is new top score
        position == 1
    }
}

#[generate_trait]
pub impl JackpotAssert of AssertTrait {
    fn assert_valid_count(max_count: u32) {
        assert(max_count != 0, errors::JACKPOT_INVALID_COUNT);
    }
}
