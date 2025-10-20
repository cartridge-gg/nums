pub use crate::models::game::{Game, GameTrait};
pub use crate::random::Random;

pub trait PowerTrait {
    fn apply(ref game: Game, ref rand: Random);
}
