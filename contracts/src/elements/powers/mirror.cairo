use crate::elements::powers::interface::{Game, GameTrait, PowerTrait, Random};

pub impl Mirror of PowerTrait {
    #[inline]
    fn apply(ref game: Game, ref rand: Random) {
        game.number = mirror(game.number, game.slot_min, game.slot_max);
    }

    #[inline]
    fn rescue(game: @Game, slots: @Array<u16>) -> bool {
        let mut game = *game;
        game.number = mirror(game.number, game.slot_min, game.slot_max);
        !game.is_over(slots)
    }
}

#[inline]
fn mirror(number: u16, slot_min: u16, slot_max: u16) -> u16 {
    let amplitude = slot_max + slot_min;
    if number > amplitude {
        slot_min
    } else {
        amplitude - number
    }
}
