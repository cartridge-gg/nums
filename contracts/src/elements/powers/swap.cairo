use crate::elements::powers::interface::{Game, GameTrait, PowerTrait, Random};

pub impl Swap of PowerTrait {
    #[inline]
    fn apply(ref game: Game, ref rand: Random) {
        let (number, next) = swap(game.number, game.next_number);
        game.number = number;
        game.next_number = next;
    }

    #[inline]
    fn rescue(game: @Game, slots: @Array<u16>) -> bool {
        let mut game = *game;
        let (number, next) = swap(game.number, game.next_number);
        game.number = number;
        game.next_number = next;
        !game.is_over(slots)
    }
}

#[inline]
fn swap(number: u16, next: u16) -> (u16, u16) {
    (next, number)
}
