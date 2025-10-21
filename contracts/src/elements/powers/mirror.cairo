use crate::elements::powers::interface::{Game, PowerTrait, Random};

pub impl Mirror of PowerTrait {
    #[inline]
    fn apply(ref game: Game, ref rand: Random) {
        let amplitude = game.slot_max + game.slot_min;
        game.number = if game.number > amplitude {
            game.slot_min
        } else {
            amplitude - game.number
        }
    }

    #[inline]
    fn condition() -> u8 {
        4
    }
}
