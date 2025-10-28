use crate::elements::powers::interface::{Game, GameTrait, PowerTrait, Random};

pub impl Low of PowerTrait {
    #[inline]
    fn apply(ref game: Game, ref rand: Random) {
        let slot_max = game.slot_max;
        game.slot_max = game.slot_max / 2;
        game.number = game.next(@game.slots(), ref rand);
        game.slot_max = slot_max;
    }

    #[inline]
    fn condition() -> u8 {
        3
    }
}
