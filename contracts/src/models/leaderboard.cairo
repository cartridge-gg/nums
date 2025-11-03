pub use crate::models::index::{Game, Leaderboard};
pub use crate::store::{Store, StoreImpl};

pub mod errors {
    pub const LEADERBOARD_INVALID_COUNT: felt252 = 'Leaderboard: invalid count';
    pub const LEADERBOARD_INVALID_POSITION: felt252 = 'Leaderboard: invalid position';
    pub const LEADERBOARD_IS_NOT_EMPTY: felt252 = 'Leaderboard: is not empty';
}

#[generate_trait]
pub impl LeaderboardImpl of LeaderboardTrait {
    #[inline]
    fn new(tournament_id: u16, capacity: u32) -> Leaderboard {
        Leaderboard {
            tournament_id: tournament_id, capacity: capacity, requirement: 0, games: array![],
        }
    }

    #[inline]
    fn capacity(self: @Leaderboard, entry_count: u32) -> u32 {
        // Top 10% of entrants with specific criteria for low entry counts
        // https://www.wsoponline.com/how-to-play-poker/mtt-tournament-payouts/
        let entry_criteria = if entry_count < 3 {
            1
        } else if entry_count < 11 {
            2
        } else {
            (entry_count + 9) / 10
        };
        let games_criteria = core::cmp::min(*self.capacity, self.games.len());
        core::cmp::min(entry_criteria, games_criteria)
    }

    fn insert(ref self: Leaderboard, game: Game, ref store: Store) -> bool {
        // [Check] Game score matches requirement
        if game.score < self.requirement {
            return false;
        }

        // [Insert] Game into leaderboard
        let mut leaderboard = array![];
        let mut placed = false;
        let mut count = self.capacity;
        let mut index = 0;
        let mut position = 0;
        while count > 0 {
            index += 1;
            match self.games.pop_front() {
                Option::Some(gid) => {
                    let g = store.game(gid);
                    if g.score < game.score && !placed {
                        placed = true;
                        leaderboard.append(game.id);
                        self.requirement = game.score;
                        count -= 1;
                        position = index;
                    }
                    if count == 0 {
                        break;
                    }
                    if g.id == game.id {
                        continue;
                    }
                    leaderboard.append(g.id);
                    self.requirement = g.score;
                    count -= 1;
                },
                Option::None => {
                    leaderboard.append(game.id);
                    self.requirement = game.score;
                    position = index;
                    break;
                },
            }
        }

        // [Effect] Update leaderboard
        if leaderboard.len() < self.capacity {
            self.requirement = 0;
        }
        self.games = leaderboard;

        // [Return] Is new top score
        position == 1
    }

    #[inline]
    fn exists(self: @Leaderboard) -> bool {
        self.capacity != @0
    }
}

#[generate_trait]
pub impl LeaderboardAssert of AssertTrait {
    #[inline]
    fn assert_valid_count(max_count: u32) {
        assert(max_count != 0, errors::LEADERBOARD_INVALID_COUNT);
    }

    #[inline]
    fn assert_at_position(self: @Leaderboard, game_id: u64, position: u32) {
        assert(position != 0 && position <= self.games.len(), errors::LEADERBOARD_INVALID_POSITION);
        let game_position = self.games.at(position - 1);
        assert(game_id == *game_position, errors::LEADERBOARD_INVALID_POSITION);
    }

    #[inline]
    fn assert_is_empty(self: @Leaderboard) {
        assert(self.games.len() == 0, errors::LEADERBOARD_IS_NOT_EMPTY);
    }
}

#[cfg(test)]
mod tests {
    use super::{LeaderboardAssert, LeaderboardTrait};

    pub const TOURNAMENT_ID: u16 = 1;
    pub const MAX_CAPACITY: u32 = 5;

    #[test]
    fn test_leaderboard_capacity() {
        let mut leaderboard = LeaderboardTrait::new(TOURNAMENT_ID, MAX_CAPACITY);
        // No games
        leaderboard.games = array![];
        assert_eq!(leaderboard.capacity(0), 0);
        assert_eq!(leaderboard.capacity(1), 0);
        assert_eq!(leaderboard.capacity(5), 0);
        assert_eq!(leaderboard.capacity(10), 0);
        assert_eq!(leaderboard.capacity(30), 0);
        assert_eq!(leaderboard.capacity(40), 0);
        assert_eq!(leaderboard.capacity(41), 0);
        assert_eq!(leaderboard.capacity(100), 0);
        // One game
        leaderboard.games = array![1];
        assert_eq!(leaderboard.capacity(1), 1);
        assert_eq!(leaderboard.capacity(5), 1);
        assert_eq!(leaderboard.capacity(10), 1);
        assert_eq!(leaderboard.capacity(30), 1);
        assert_eq!(leaderboard.capacity(40), 1);
        assert_eq!(leaderboard.capacity(41), 1);
        assert_eq!(leaderboard.capacity(100), 1);
        // Five games
        leaderboard.games = array![1, 2, 3, 4, 5];
        assert_eq!(leaderboard.capacity(5), 2);
        assert_eq!(leaderboard.capacity(10), 2);
        assert_eq!(leaderboard.capacity(30), 3);
        assert_eq!(leaderboard.capacity(40), 4);
        assert_eq!(leaderboard.capacity(41), 5);
        assert_eq!(leaderboard.capacity(100), 5);
        // Ten games
        leaderboard.games = array![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        assert_eq!(leaderboard.capacity(10), 2);
        assert_eq!(leaderboard.capacity(30), 3);
        assert_eq!(leaderboard.capacity(40), 4);
        assert_eq!(leaderboard.capacity(41), 5);
        assert_eq!(leaderboard.capacity(100), 5);
    }
}
