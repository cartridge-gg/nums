use crate::elements::traps::interface::{Game, Packer, Random, TrapTrait};
use crate::elements::traps::lucky::Lucky;

pub impl Slots of TrapTrait {
    #[inline]
    fn apply(ref game: Game, slot_index: u8, ref rand: Random) {
        Lucky::apply(ref game, slot_index, ref rand);
    }
}

#[cfg(test)]
mod tests {
    use crate::constants::{DEFAULT_MULTIPLIER, DEFAULT_SLOT_MAX, DEFAULT_SLOT_MIN};
    use crate::helpers::random::RandomImpl;
    use crate::models::game::GameTrait;
    use super::*;

    const DEFAULT_SLOT_COUNT: u8 = 20;

    #[test]
    fn test_slots_single() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game.force(array![0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        Slots::apply(ref game, 9, ref random);
        assert_eq!(
            game.slots(), array![0, 0, 0, 0, 0, 0, 0, 0, 0, 738, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        );
    }
}
