use crate::elements::powers::interface::{Game, GameTrait, PowerTrait, Random};

pub impl Foresight of PowerTrait {
    #[inline]
    fn apply(ref game: Game, ref rand: Random) {
        game.next_number = game.next(@game.slots(), ref rand);
    }

    #[inline]
    fn condition() -> u8 {
        6
    }
}
