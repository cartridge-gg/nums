use crate::elements::powers::interface::{Game, GameTrait, PowerTrait, Random};

pub impl High of PowerTrait {
    #[inline]
    fn apply(ref game: Game, ref rand: Random) {
        let slot_min = game.slot_min;
        game.slot_min = (game.slot_max + 1) / 2;
        game.number = game.next(@game.slots(), ref rand);
        game.slot_min = slot_min;
    }
}
