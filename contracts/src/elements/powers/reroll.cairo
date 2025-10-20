use crate::elements::powers::interface::{Game, GameTrait, PowerTrait, Random};

pub impl Reroll of PowerTrait {
    #[inline]
    fn apply(ref game: Game, ref rand: Random) {
        game.number = game.next(@game.slots(), ref rand);
    }
}
