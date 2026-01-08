use crate::elements::powers::interface::{Game, GameTrait, PowerTrait, Random};

pub impl Halve of PowerTrait {
    #[inline]
    fn apply(ref game: Game, ref rand: Random) {
        game.number = halve(game.number);
    }

    #[inline]
    fn rescue(game: @Game, slots: @Array<u16>) -> bool {
        let mut game = *game;
        game.number = halve(game.number);
        !game.is_over(slots)
    }
}

#[inline]
fn halve(number: u16) -> u16 {
    number / 2
}
