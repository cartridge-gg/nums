use crate::elements::traps::interface::{Game, GameTrait, Packer, Random, TrapTrait};

pub impl Windy of TrapTrait {
    #[inline]
    fn apply(ref game: Game, slot_index: u8, ref rand: Random) {
        // [Effect] Push the nearest numbers away from slot_index
        let slots = game.slots();

        // [Compute] Find the nearest number to the left
        let mut index: u32 = slot_index.into();
        while index > 1 {
            index -= 1;
            let slot = slots.at(index);
            if slot != @0 && slots.at(index - 1) == @0 {
                let from: u8 = index.try_into().unwrap();
                game.move(from, from - 1, ref rand);
                break;
            } else if slot != @0 {
                break;
            }
        }

        // [Compute] Find the nearest number to the right
        let mut index = slot_index.into();
        let max = slots.len() - 2;
        while index < max {
            index += 1;
            let slot = slots.at(index);
            if slot != @0 && slots.at(index + 1) == @0 {
                let from: u8 = index.try_into().unwrap();
                game.move(from, from + 1, ref rand);
                break;
            } else if slot != @0 {
                break;
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::constants::{DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MAX, DEFAULT_SLOT_MIN};
    use crate::helpers::random::RandomImpl;
    use super::*;

    #[test]
    fn test_windy_basic_left() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(0, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0);
        game.force(array![100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        Windy::apply(ref game, 9, ref random);
        // Left slot at 0 should move away from slot_index (9) to the left, but already at boundary
        assert_eq!(
            game.slots(), array![100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        );
    }

    #[test]
    fn test_windy_basic_right() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(0, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0);
        game.force(array![0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500]);
        Windy::apply(ref game, 9, ref random);
        // Right slot at 19 should move away from slot_index (9) to the right, but already at
        // boundary
        assert_eq!(
            game.slots(), array![0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500],
        );
    }

    #[test]
    fn test_windy_both_sides() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(0, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0);
        game.force(array![100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500]);
        Windy::apply(ref game, 9, ref random);
        // Left slot at 0 can't move (boundary), right slot at 19 can't move (boundary)
        assert_eq!(
            game.slots(), array![100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500],
        );
    }

    #[test]
    fn test_windy_move_left_away() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(0, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0);
        game.force(array![0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        Windy::apply(ref game, 9, ref random);
        // Left slot at 1 should move away from slot_index (9) to the left (to index 0)
        assert_eq!(
            game.slots(), array![100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        );
    }

    #[test]
    fn test_windy_move_right_away() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(0, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0);
        game.force(array![0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0]);
        Windy::apply(ref game, 9, ref random);
        // Right slot at 18 should move away from slot_index (9) to the right (to index 19)
        assert_eq!(
            game.slots(), array![0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500],
        );
    }

    #[test]
    fn test_windy_target_occupied() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(0, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0);
        game.force(array![200, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        Windy::apply(ref game, 9, ref random);
        // Left slot at 1 should move to 0, but 0 is occupied, so it doesn't move
        assert_eq!(
            game.slots(), array![200, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        );
    }

    #[test]
    fn test_windy_no_slots() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(0, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0);
        game.force(array![0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        Windy::apply(ref game, 9, ref random);
        assert_eq!(
            game.slots(), array![0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        );
    }

    #[test]
    fn test_windy_slot_index_occupied() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(0, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0);
        game.force(array![0, 100, 0, 0, 0, 0, 0, 0, 0, 250, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0]);
        Windy::apply(ref game, 9, ref random);
        // Left slot at 1 should move to 0, right slot at 18 should move to 19
        assert_eq!(
            game.slots(), array![100, 0, 0, 0, 0, 0, 0, 0, 0, 250, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500],
        );
    }

    #[test]
    fn test_windy_slot_index_first_with_right_slot() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(0, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0);
        game.force(array![0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500]);
        Windy::apply(ref game, 0, ref random);
        // slot_index is 0 (first), no left slot possible, right slot at 19 should move away from 0
        // to the right, but already at boundary
        assert_eq!(
            game.slots(), array![0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500],
        );
    }

    #[test]
    fn test_windy_slot_index_first_with_right_slot_close() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(0, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0);
        game.force(array![0, 500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        Windy::apply(ref game, 0, ref random);
        // slot_index is 0 (first), right slot at 1 should move away from 0 to the right (to index
        // 2)
        assert_eq!(
            game.slots(), array![0, 0, 500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        );
    }

    #[test]
    fn test_windy_slot_index_first_with_right_slot_target_occupied() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(0, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0);
        game.force(array![0, 500, 200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        Windy::apply(ref game, 0, ref random);
        // slot_index is 0 (first), right slot at 1 should move to 2, but 2 is occupied, so it
        // doesn't move
        assert_eq!(
            game.slots(), array![0, 500, 200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        );
    }

    #[test]
    fn test_windy_slot_index_last_with_left_slot() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(0, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0);
        game.force(array![100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        Windy::apply(ref game, 19, ref random);
        // slot_index is 19 (last), left slot at 0 should move away from 19 to the left, but already
        // at boundary
        assert_eq!(
            game.slots(), array![100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        );
    }

    #[test]
    fn test_windy_slot_index_last_with_left_slot_close() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(0, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0);
        game.force(array![0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 0]);
        Windy::apply(ref game, 19, ref random);
        // slot_index is 19 (last), left slot at 18 should move away from 19 to the left (to index
        // 17)
        assert_eq!(
            game.slots(), array![0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0],
        );
    }

    #[test]
    fn test_windy_slot_index_last_with_left_slot_target_occupied() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(0, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0);
        game.force(array![0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 100, 0]);
        Windy::apply(ref game, 19, ref random);
        // slot_index is 19 (last), left slot at 18 should move to 17, but 17 is occupied, so it
        // doesn't move
        assert_eq!(
            game.slots(), array![0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 100, 0],
        );
    }

    #[test]
    fn test_windy_slot_index_first_with_both_sides() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(0, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0);
        game.force(array![0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500]);
        Windy::apply(ref game, 0, ref random);
        // slot_index is 0 (first), left slot at 1 is actually to the right, so it should move right
        // to 2 Right slot at 19 should move away from 0 to the right, but already at boundary
        assert_eq!(
            game.slots(), array![0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500],
        );
    }

    #[test]
    fn test_windy_slot_index_last_with_both_sides() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(0, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0);
        game.force(array![100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0]);
        Windy::apply(ref game, 19, ref random);
        // slot_index is 19 (last), left slot at 0 should move away from 19 to the left, but already
        // at boundary Right slot at 18 should move to 17 (away from 19)
        assert_eq!(
            game.slots(), array![100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0, 0],
        );
    }
}
