pub use crate::models::index::Slot;

pub mod errors {
    pub const SLOT_NUMBER_NOT_VALID: felt252 = 'Slot: number not valid';
}

#[generate_trait]
pub impl SlotImpl of SlotTrait {
    fn new(game_id: u64, index: u8, number: u16) -> Slot {
        Slot { game_id: game_id, index: index, number: number }
    }
}

#[generate_trait]
pub impl SlotAssert of AssertTrait {
    fn assert_valid_number(number: u16) {
        assert(number != 0, errors::SLOT_NUMBER_NOT_VALID);
    }
}

pub impl SlotPartialOrd of PartialOrd<Slot> {
    fn lt(lhs: Slot, rhs: Slot) -> bool {
        lhs.number < rhs.number
    }

    fn le(lhs: Slot, rhs: Slot) -> bool {
        lhs.number <= rhs.number
    }

    fn gt(lhs: Slot, rhs: Slot) -> bool {
        lhs.number > rhs.number
    }

    fn ge(lhs: Slot, rhs: Slot) -> bool {
        lhs.number >= rhs.number
    }
}

#[cfg(test)]
mod tests {
    use super::SlotAssert;

    #[test]
    fn test_assert_valid_number_valid() {
        SlotAssert::assert_valid_number(100);
    }

    #[test]
    #[should_panic(expected: ('Slot: number not valid',))]
    fn test_assert_valid_number_invalid() {
        SlotAssert::assert_valid_number(0);
    }
}
