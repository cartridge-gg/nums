use crate::elements::powers::interface::{Game, PowerTrait, Random};

pub impl DoubleUp of PowerTrait {
    #[inline]
    fn apply(ref game: Game, ref rand: Random) {
        game.number = game.number * 2;
    }
}
