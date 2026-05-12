use crate::elements::traps::interface::{Game, Packer, Random, Trap, TrapTrait};
use crate::elements::traps::lucky::Lucky;

pub impl Slots of TrapTrait {
    #[inline]
    fn apply(ref game: Game, slot_index: u8, ref rand: Random, ref traps: Array<Trap>) {
        Lucky::apply(ref game, slot_index, ref rand, ref traps);
    }
}

#[cfg(test)]
mod tests {
    use crate::helpers::random::RandomImpl;
    use crate::models::game::GameTrait;
    use super::*;

    const DEFAULT_SLOT_COUNT: u8 = 18;
    const DEFAULT_MULTIPLIER: u128 = 1;

    #[test]
    fn test_slots_single() {
        let mut traps = array![];
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(0, DEFAULT_MULTIPLIER, 0, 0);
        game.force(array![0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0, 0, 0, 0, 0, 0, 0, 0]);
        Slots::apply(ref game, 9, ref random, ref traps);
        assert_eq!(game.slots(), array![0, 0, 0, 0, 0, 0, 0, 0, 0, 738, 0, 0, 0, 0, 0, 0, 0, 0]);
    }
}
