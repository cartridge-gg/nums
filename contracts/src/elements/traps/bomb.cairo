use crate::elements::traps::interface::{Game, GameTrait, Packer, Random, RandomTrait, TrapTrait};

pub impl Bomb of TrapTrait {
    #[inline]
    fn apply(ref game: Game, slot_index: u8, ref rand: Random) {
        // [Effect] Take the nearest number and shuffle them
        let slots = game.slots();
        // [Compute] Find the nearest number to the left
        let mut index: u32 = 0;
        let mut previous_index: u32 = 0;
        let mut previous_slot: u16 = game.slot_min;
        let mut previous_previous_slot: u16 = 0;
        while index < slot_index.into() {
            let slot = *slots.at(index);
            if slot != 0 {
                previous_previous_slot = previous_slot;
                previous_slot = slot;
                previous_index = index;
            }
            index += 1;
        }
        // [Compute] Find the nearest number to the right
        index = slots.len() - 1;
        let mut next_index: u32 = 0;
        let mut next_slot: u16 = game.slot_max;
        let mut next_next_slot = 0;
        while index > slot_index.into() {
            let slot = *slots.at(index);
            if slot != 0 {
                next_next_slot = next_slot;
                next_slot = slot;
                next_index = index;
            }
            index -= 1;
        }
        // [Effect] Shuffle the 2 nearest numbers
        let trap_slot = *slots.at(slot_index.into());
        let mut new_slots = array![];
        let mut index = 0;
        let max = slots.len();
        while index < max {
            let slot: u16 = if index == previous_index && previous_previous_slot != 0 {
                rand.between(previous_previous_slot, trap_slot)
            } else if index == next_index && next_next_slot != 0 {
                rand.between(trap_slot, next_next_slot)
            } else {
                *slots.at(index)
            };
            new_slots.append(slot);
            index += 1;
        }
        game.force(new_slots);
    }
}

#[cfg(test)]
mod tests {
    use crate::constants::{DEFAULT_MULTIPLIER, DEFAULT_SLOT_MAX, DEFAULT_SLOT_MIN};
    use crate::helpers::random::RandomImpl;
    use super::*;

    const DEFAULT_SLOT_COUNT: u8 = 20;

    #[test]
    fn test_bomb_large_range() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game.force(array![1, 0, 0, 0, 250, 0, 0, 0, 0, 500, 0, 0, 0, 0, 750, 0, 0, 0, 0, 999]);
        Bomb::apply(ref game, 9, ref random);
        assert_eq!(
            game.slots(),
            array![1, 0, 0, 0, 120, 0, 0, 0, 0, 500, 0, 0, 0, 0, 503, 0, 0, 0, 0, 999],
        );
    }

    #[test]
    fn test_bomb_small_range() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game.force(array![1, 0, 0, 0, 0, 0, 0, 100, 250, 500, 750, 900, 0, 0, 0, 0, 0, 0, 0, 999]);
        Bomb::apply(ref game, 9, ref random);
        assert_eq!(
            game.slots(),
            array![1, 0, 0, 0, 0, 0, 0, 100, 200, 500, 846, 900, 0, 0, 0, 0, 0, 0, 0, 999],
        );
    }

    #[test]
    fn test_bomb_at_boundary() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game.force(array![1, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 999]);
        Bomb::apply(ref game, 9, ref random);
        assert_eq!(
            game.slots(), array![120, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 503],
        );
    }

    #[test]
    fn test_bomb_even() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game.force(array![1, 0, 0, 0, 0, 0, 0, 500, 500, 500, 500, 500, 0, 0, 0, 0, 0, 0, 0, 999]);
        Bomb::apply(ref game, 9, ref random);
        assert_eq!(
            game.slots(),
            array![1, 0, 0, 0, 0, 0, 0, 500, 500, 500, 500, 500, 0, 0, 0, 0, 0, 0, 0, 999],
        );
    }

    #[test]
    fn test_bomb_almost_even() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game.force(array![1, 0, 0, 0, 0, 0, 0, 499, 499, 500, 501, 501, 0, 0, 0, 0, 0, 0, 0, 999]);
        Bomb::apply(ref game, 9, ref random);
        assert_eq!(
            game.slots(),
            array![1, 0, 0, 0, 0, 0, 0, 499, 500, 500, 501, 501, 0, 0, 0, 0, 0, 0, 0, 999],
        );
    }

    #[test]
    fn test_bomb_left_only() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game.force(array![0, 0, 0, 0, 0, 0, 0, 250, 0, 500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        Bomb::apply(ref game, 9, ref random);
        assert_eq!(
            game.slots(), array![0, 0, 0, 0, 0, 0, 0, 120, 0, 500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        );
    }

    #[test]
    fn test_bomb_right_only() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game.force(array![0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0, 0, 0, 0, 750, 0, 0, 0, 0, 0]);
        Bomb::apply(ref game, 9, ref random);
        assert_eq!(
            game.slots(), array![0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0, 0, 0, 0, 619, 0, 0, 0, 0, 0],
        );
    }
}
