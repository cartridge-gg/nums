use crate::elements::powers::interface::{Game, PowerTrait, Random};

pub impl Halve of PowerTrait {
    #[inline]
    fn apply(ref game: Game, ref rand: Random) {
        game.number = game.number / 2;
    }

    #[inline]
    fn condition() -> u8 {
        4
    }
}
