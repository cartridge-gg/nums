pub use crate::helpers::random::Random;
pub use crate::models::game::{Game, GameTrait};

pub trait PowerTrait {
    fn apply(ref game: Game, ref rand: Random);
    fn rescue(game: @Game, slots: @Array<u16>) -> bool;
}
