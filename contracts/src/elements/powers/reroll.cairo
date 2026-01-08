use crate::elements::powers::interface::{Game, GameTrait, PowerTrait, Random};

pub impl Reroll of PowerTrait {
    #[inline]
    fn apply(ref game: Game, ref rand: Random) {
        game.number = game.next(@game.slots(), ref rand);
    }

    #[inline]
    fn rescue(game: @Game, slots: @Array<u16>) -> bool {
        true
    }
}
