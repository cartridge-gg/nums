use crate::elements::powers::interface::{Game, GameTrait, PowerTrait, Random};

pub impl DoubleUp of PowerTrait {
    #[inline]
    fn apply(ref game: Game, ref rand: Random) {
        game.number = double(game.number);
    }

    #[inline]
    fn rescue(game: @Game, slots: @Array<u16>) -> bool {
        let mut game = *game;
        game.number = double(game.number);
        !game.is_over(slots)
    }
}

#[inline]
fn double(number: u16) -> u16 {
    core::cmp::min(number * 2, 999)
}
