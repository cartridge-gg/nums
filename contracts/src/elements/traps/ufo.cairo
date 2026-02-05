use crate::elements::traps::interface::{Game, GameTrait, Packer, Random, RandomTrait, TrapTrait};

pub impl Ufo of TrapTrait {
    #[inline]
    fn apply(ref game: Game, slot_index: u8, ref rand: Random) {
        // [Effect] Push the nearest numbers away from slot_index
        let mut slots = game.slots();

        // [Compute] Find the nearest number to the left
        let mut index: u32 = slot_index.into();
        let mut left_index: u32 = index;
        while index > 0 {
            index -= 1;
            let slot = slots.at(index);
            if slot != @0 {
                break;
            } else {
                left_index = index;
            }
        }

        // [Compute] Find the nearest number to the right
        let mut index = slot_index.into();
        let mut right_index: u32 = index;
        let max = slots.len() - 1;
        while index < max {
            index += 1;
            let slot = slots.at(index);
            if slot != @0 {
                break;
            } else {
                right_index = index;
            };
        }

        // [Effect] Move the slot at slot_index somewhere between the nearest numbers
        let new_index: u32 = rand.between(left_index, right_index);
        game.move(slot_index, new_index.try_into().unwrap(), ref rand);
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
    fn test_ufo_basic_left() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game.force(array![0, 0, 0, 0, 0, 0, 0, 0, 0, 250, 300, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        Ufo::apply(ref game, 9, ref random);
        assert_eq!(
            game.slots(), array![0, 0, 0, 0, 0, 0, 0, 0, 0, 250, 300, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        );
    }

    #[test]
    fn test_ufo_no_position_available() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game.force(array![100, 250, 300, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500]);
        Ufo::apply(ref game, 1, ref random);
        assert_eq!(
            game.slots(),
            array![100, 250, 300, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500],
        );
    }

    #[test]
    fn test_ufo_slot_index_at_boundary_left_no_filled_left() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game.force(array![250, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500]);
        Ufo::apply(ref game, 0, ref random);
        assert_eq!(
            game.slots(), array![0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 250, 0, 0, 500],
        );
    }

    #[test]
    fn test_ufo_slot_index_at_boundary_left_with_filled_left() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game.force(array![250, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500]);
        Ufo::apply(ref game, 0, ref random);
        assert_eq!(
            game.slots(), array![250, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500],
        );
    }

    #[test]
    fn test_ufo_slot_index_at_boundary_right_no_filled_right() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game.force(array![100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 250]);
        Ufo::apply(ref game, 19, ref random);
        assert_eq!(
            game.slots(), array![100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 250, 0, 0],
        );
    }

    #[test]
    fn test_ufo_slot_index_at_boundary_right_with_filled_right() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game.force(array![100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 250]);
        Ufo::apply(ref game, 19, ref random);
        assert_eq!(
            game.slots(), array![100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 250],
        );
    }

    #[test]
    fn test_ufo_no_filled_slots() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game.force(array![0, 0, 0, 0, 0, 0, 0, 0, 0, 250, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        Ufo::apply(ref game, 9, ref random);
        assert_eq!(
            game.slots(), array![0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 250],
        );
    }

    #[test]
    fn test_ufo_only_filled_left() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game.force(array![100, 0, 0, 0, 0, 0, 0, 0, 0, 250, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        Ufo::apply(ref game, 9, ref random);
        assert_eq!(
            game.slots(), array![100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 250, 0, 0],
        );
    }

    #[test]
    fn test_ufo_only_filled_right() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game.force(array![0, 0, 0, 0, 0, 0, 0, 0, 0, 250, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500]);
        Ufo::apply(ref game, 9, ref random);
        assert_eq!(
            game.slots(), array![0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 250, 0, 0, 500],
        );
    }

    #[test]
    fn test_ufo_small_range() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game.force(array![0, 0, 0, 0, 0, 0, 0, 0, 100, 250, 500, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        Ufo::apply(ref game, 9, ref random);
        assert_eq!(
            game.slots(), array![0, 0, 0, 0, 0, 0, 0, 0, 100, 250, 500, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        );
    }

    #[test]
    fn test_ufo_large_range() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game.force(array![100, 0, 0, 0, 0, 0, 0, 0, 0, 250, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500]);
        Ufo::apply(ref game, 9, ref random);
        assert_eq!(
            game.slots(), array![100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 250, 500],
        );
    }
}
