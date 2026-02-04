use crate::elements::traps::interface::{Game, GameTrait, Packer, Random, TrapTrait};

pub impl Lucky of TrapTrait {
    #[inline]
    fn apply(ref game: Game, slot_index: u8, ref rand: Random) {
        game.shuffle(slot_index, ref rand);
    }
}

#[cfg(test)]
mod tests {
    use crate::constants::{DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MAX, DEFAULT_SLOT_MIN};
    use crate::helpers::random::RandomImpl;
    use super::*;

    #[test]
    fn test_lucky_single() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(0, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0);
        game.force(array![0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        Lucky::apply(ref game, 9, ref random);
        assert_eq!(
            game.slots(), array![0, 0, 0, 0, 0, 0, 0, 0, 0, 738, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        );
    }

    #[test]
    fn test_lucky_full_large() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(0, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0);
        game
            .force(
                array![
                    1, 2, 3, 4, 5, 6, 7, 8, 9, 500, 990, 991, 992, 993, 994, 995, 996, 997, 998,
                    999,
                ],
            );
        Lucky::apply(ref game, 9, ref random);
        assert_eq!(
            game.slots(),
            array![
                1, 2, 3, 4, 5, 6, 7, 8, 9, 814, 990, 991, 992, 993, 994, 995, 996, 997, 998, 999,
            ],
        );
    }

    #[test]
    fn test_lucky_full_tight() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(0, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0);
        game
            .force(
                array![
                    491, 492, 493, 494, 495, 496, 497, 498, 499, 500, 501, 502, 503, 504, 505, 506,
                    507, 508, 509, 510,
                ],
            );
        Lucky::apply(ref game, 9, ref random);
        assert_eq!(
            game.slots(),
            array![
                491, 492, 493, 494, 495, 496, 497, 498, 499, 501, 501, 502, 503, 504, 505, 506, 507,
                508, 509, 510,
            ],
        );
    }

    #[test]
    fn test_lucky_full_even() {
        let mut random = RandomImpl::new(0);
        let mut game = GameTrait::new(0, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, 0);
        game
            .force(
                array![
                    500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500,
                    500, 500, 500, 500,
                ],
            );
        Lucky::apply(ref game, 9, ref random);
        assert_eq!(
            game.slots(),
            array![
                500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500,
                500, 500, 500,
            ],
        );
    }
}
