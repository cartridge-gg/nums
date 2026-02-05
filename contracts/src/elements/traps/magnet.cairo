use crate::elements::traps::interface::{Game, GameTrait, Packer, Random, TrapTrait};

pub impl Magnet of TrapTrait {
    #[inline]
    fn apply(ref game: Game, slot_index: u8, ref rand: Random) {
        // [Effect] Take the nearest number and shuffle them
        let slots = game.slots();
        // [Compute] Find the nearest number to the left
        let mut index: u32 = slot_index.into();
        while index > 0 {
            index -= 1;
            let slot = *slots.at(index);
            if index + 1 == slot_index.into() && slot != 0 {
                break;
            } else if slot != 0 {
                let from: u8 = index.try_into().unwrap();
                game.move(from, from + 1, ref rand);
                break;
            }
        }
        // [Compute] Find the nearest number to the right
        let mut index: u32 = slot_index.into();
        let max = slots.len() - 1;
        while index < max {
            index += 1;
            let slot = *slots.at(index);
            if index - 1 == slot_index.into() && slot != 0 {
                break;
            } else if slot != 0 {
                let from: u8 = index.try_into().unwrap();
                game.move(from, from - 1, ref rand);
                break;
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::constants::{DEFAULT_MULTIPLIER, DEFAULT_SLOT_MAX, DEFAULT_SLOT_MIN};
    use crate::helpers::random::RandomImpl;
    use super::*;

    const DEFAULT_SLOT_COUNT: u8 = 20;

    #[test]
    fn test_magnet_basic_left() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game.force(array![100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        Magnet::apply(ref game, 9, ref random);
        assert_eq!(
            game.slots(), array![0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        );
    }

    #[test]
    fn test_magnet_basic_right() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game.force(array![0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500]);
        Magnet::apply(ref game, 9, ref random);
        assert_eq!(
            game.slots(), array![0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0],
        );
    }

    #[test]
    fn test_magnet_both_sides() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game.force(array![100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500]);
        Magnet::apply(ref game, 9, ref random);
        assert_eq!(
            game.slots(), array![0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0],
        );
    }

    #[test]
    fn test_magnet_no_slots() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game.force(array![0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        Magnet::apply(ref game, 9, ref random);
        assert_eq!(
            game.slots(), array![0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        );
    }

    #[test]
    fn test_magnet_already_close() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game.force(array![0, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500]);
        Magnet::apply(ref game, 9, ref random);
        // Left slot at 8 should move to 9, but can't (max is slot_index - 1 = 8), so doesn't move
        // Right slot at 19 should move towards 9 (min is slot_index + 1 = 10)
        assert_eq!(
            game.slots(), array![0, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0],
        );
    }

    #[test]
    fn test_magnet_no_empty_slots_between() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game
            .force(
                array![
                    100, 200, 300, 400, 500, 600, 700, 800, 900, 0, 1000, 1100, 1200, 1300, 1400,
                    1500, 1600, 1700, 1800, 1900,
                ],
            );
        Magnet::apply(ref game, 9, ref random);
        // slot_index 9 is empty, left slot (8, 900) can move to max 8 (slot_index - 1), so doesn't
        // move right slot (10, 1000) can move to min 10 (slot_index + 1), so doesn't move
        assert_eq!(
            game.slots(),
            array![
                100, 200, 300, 400, 500, 600, 700, 800, 900, 0, 1000, 1100, 1200, 1300, 1400, 1500,
                1600, 1700, 1800, 1900,
            ],
        );
    }

    #[test]
    fn test_magnet_at_boundary_left() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game.force(array![100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500]);
        Magnet::apply(ref game, 0, ref random);
        // slot_index is 0, left slot at 0 can't move (already at max slot_index - 1 = -1, invalid),
        // right should move towards 0 (min at slot_index + 1 = 1)
        assert_eq!(
            game.slots(), array![100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0],
        );
    }

    #[test]
    fn test_magnet_at_boundary_right() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game.force(array![100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500]);
        Magnet::apply(ref game, 19, ref random);
        // slot_index is 19, left should move towards 19 (max at slot_index - 1 = 18), right slot at
        // 19 can't move (min at slot_index + 1 = 20, invalid)
        assert_eq!(
            game.slots(), array![0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500],
        );
    }

    #[test]
    fn test_magnet_slot_index_occupied() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game.force(array![100, 0, 0, 0, 0, 0, 0, 0, 0, 250, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500]);
        Magnet::apply(ref game, 9, ref random);
        // slot_index 9 is occupied, left should move to first empty towards 9 (max at 8), right
        // should move to last empty before 9 (min at 10, but no empty after 9, so moves to 8)
        assert_eq!(
            game.slots(), array![0, 100, 0, 0, 0, 0, 0, 0, 0, 250, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0],
        );
    }

    #[test]
    fn test_magnet_left_at_slot_index_minus_one() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game.force(array![0, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500]);
        Magnet::apply(ref game, 9, ref random);
        // Left slot at 8 (slot_index - 1) should not move, right should move towards 9
        assert_eq!(
            game.slots(), array![0, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0],
        );
    }

    #[test]
    fn test_magnet_right_at_slot_index_plus_one() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game.force(array![100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        Magnet::apply(ref game, 9, ref random);
        // Right slot at 10 (slot_index + 1) should not move, left should move towards 9
        assert_eq!(
            game.slots(), array![0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        );
    }

    #[test]
    fn test_magnet_slot_index_first_with_both_sides() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game.force(array![0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500]);
        Magnet::apply(ref game, 0, ref random);
        assert_eq!(
            game.slots(), array![0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500],
        );
    }

    #[test]
    fn test_magnet_slot_index_last_with_both_sides() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(
            0, DEFAULT_MULTIPLIER, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0,
        );
        game.force(array![100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0]);
        Magnet::apply(ref game, 19, ref random);
        assert_eq!(
            game.slots(), array![100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0],
        );
    }
}
