pub use crate::models::index::{Game, Leaderboard};
pub use crate::store::{Store, StoreImpl};

pub mod errors {
    pub const LEADERBOARD_INVALID_COUNT: felt252 = 'Leaderboard: invalid count';
}

#[generate_trait]
pub impl LeaderboardImpl of LeaderboardTrait {
    #[inline]
    fn new(tournament_id: u64, max_count: u32) -> Leaderboard {
        Leaderboard {
            tournament_id: tournament_id, max_count: max_count, requirement: 0, games: array![],
        }
    }

    #[inline]
    fn exists(self: @Leaderboard) -> bool {
        self.max_count != @0
    }

    fn insert(ref self: Leaderboard, game: Game, ref store: Store) -> bool {
        // [Check] Game score matches requirement
        if game.score < self.requirement {
            return false;
        }

        // [Insert] Game into leaderboard
        let mut leaderboard = array![];
        let mut placed = false;
        let mut count = self.max_count;
        let mut index = 0;
        let mut position = 0;
        while let Option::Some(gid) = self.games.pop_front() {
            index += 1;
            let g = store.game(gid);
            if g.score < game.score && !placed && count != 0 {
                placed = true;
                leaderboard.append(game);
                self.requirement = game.score;
                count -= 1;
                position = index;
            }
            if count == 0 {
                break;
            }
            leaderboard.append(g);
            self.requirement = game.score;
            count -= 1;
        }

        // [Return] Is new top score
        position == 1
    }
}

#[generate_trait]
pub impl LeaderboardAssert of AssertTrait {
    fn assert_valid_count(max_count: u32) {
        assert(max_count != 0, errors::LEADERBOARD_INVALID_COUNT);
    }
}
