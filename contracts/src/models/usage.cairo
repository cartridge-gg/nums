use core::num::traits::Pow;
use crate::constants::DEFAULT_POWER_COST;
use crate::helpers::bitmap::Bitmap;
use crate::helpers::heap::{Heap, HeapTrait, Item};
use crate::helpers::packer::Packer;
use crate::helpers::power::TwoPower;
pub use crate::models::index::Usage;
use crate::types::power::{POWER_COUNT, Power, PowerTrait};

const BOARD_SIZE: u64 = 2_u64.pow(32);
const NOT_LAST_MASK: u32 = ((BOARD_SIZE - 1) / 2).try_into().unwrap();
const ONE_HOUR: u64 = 60 * 60;

pub mod errors {
    pub const USAGE_CANNOT_UPDATE: felt252 = 'Usage: cannot update';
    pub const USAGE_POWERS_TOO_EXPENSIVE: felt252 = 'Usage: powers too expensive';
}

#[generate_trait]
pub impl UsageImpl of UsageTrait {
    #[inline]
    fn new(world_resource: felt252) -> Usage {
        // [Return] New reward
        Usage { world_resource: world_resource, last_update: 0, board: 0 }
    }

    #[inline]
    fn from(board: felt252) -> Usage {
        Usage { world_resource: 0, last_update: 0, board: board }
    }

    #[inline]
    fn insert(ref self: Usage, uses: u16) {
        // [Effect] Update usage
        let board: u256 = self.board.into();
        let mut usages: Array<u32> = Packer::unpack(board, BOARD_SIZE, POWER_COUNT.into());
        let mut new_usages: Array<u32> = array![];
        let mut index = 0;
        while let Option::Some(mut usage) = usages.pop_front() {
            usage = (usage & NOT_LAST_MASK) * 2 + Bitmap::get(uses, index).into();
            new_usages.append(usage);
            index += 1;
        }
        let board: u256 = Packer::pack(new_usages, BOARD_SIZE);
        self.board = board.try_into().unwrap();
    }

    #[inline]
    fn powers(self: @Usage) -> Array<Power> {
        // [Setup] Unpack usages
        let mut heap: Heap<Item> = HeapTrait::new();
        let board: u256 = (*self.board).into();
        let mut usages: Array<u32> = Packer::unpack(board, BOARD_SIZE, POWER_COUNT.into());
        // [Compute] Scores
        let mut index: u8 = 0;
        while let Option::Some(usage) = usages.pop_front() {
            let score: u8 = Bitmap::popcount(usage);
            let item: Item = Item { key: index, cost_a: score, cost_b: index };
            heap.add(item);
            index += 1;
        }
        // [Compute] Sort usages based on scores
        let mut powers: Array<Power> = array![];
        while let Option::Some(item) = heap.pop_front() {
            powers.append(PowerTrait::from(item.key));
        }
        powers
    }
}

#[generate_trait]
pub impl UsageAssert of AssertTrait {
    #[inline]
    fn assert_valid_powers(self: @Usage, powers: u16) {
        let mut sorted_powers = self.powers();
        let mut total_cost: u8 = 0;
        let mut rank = 0;
        while let Option::Some(power) = sorted_powers.pop_front() {
            total_cost += Bitmap::get(powers, power.index()) * power.cost(rank);
            rank += 1;
        }
        assert(total_cost <= DEFAULT_POWER_COST, errors::USAGE_POWERS_TOO_EXPENSIVE);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create() -> Usage {
        starknet::testing::set_block_timestamp(3600);
        UsageTrait::new(0)
    }

    #[test]
    fn test_usage_new() {
        let usage: Usage = create();
        assert_eq!(usage.board, 0);
    }

    #[test]
    fn test_usage_insert_single() {
        let mut usage: Usage = create();
        usage.insert(0b1010101);
        assert_eq!(
            usage.board,
            0b00000000000000000000000000000001_00000000000000000000000000000000_00000000000000000000000000000001_00000000000000000000000000000000_00000000000000000000000000000001_00000000000000000000000000000000_00000000000000000000000000000001,
        );
    }

    #[test]
    fn test_usage_insert_full() {
        let mut usage: Usage = create();
        let mut index: u8 = 0;
        while index < 50 {
            usage.insert(0b1010101);
            index += 1;
        }
        assert_eq!(
            usage.board,
            0b11111111111111111111111111111111_00000000000000000000000000000000_11111111111111111111111111111111_00000000000000000000000000000000_11111111111111111111111111111111_00000000000000000000000000000000_11111111111111111111111111111111,
        );
    }

    #[test]
    fn test_usage_powers_declaration_order() {
        let mut usage: Usage = create();
        usage.insert(0b1111111);
        usage.insert(0b0111111);
        usage.insert(0b0011111);
        usage.insert(0b0001111);
        usage.insert(0b0000111);
        usage.insert(0b0000011);
        usage.insert(0b0000001);
        let powers: Array<Power> = usage.powers();
        assert_eq!(*powers.at(0), Power::Reroll);
        assert_eq!(*powers.at(1), Power::High);
        assert_eq!(*powers.at(2), Power::Low);
        assert_eq!(*powers.at(3), Power::Foresight);
        assert_eq!(*powers.at(4), Power::DoubleUp);
        assert_eq!(*powers.at(5), Power::Halve);
        assert_eq!(*powers.at(6), Power::Mirror);
    }

    #[test]
    fn test_usage_powers_reverse_order() {
        let mut usage: Usage = create();
        usage.insert(0b1111111);
        usage.insert(0b1111110);
        usage.insert(0b1111100);
        usage.insert(0b1111000);
        usage.insert(0b1110000);
        usage.insert(0b1100000);
        usage.insert(0b1000000);
        let powers: Array<Power> = usage.powers();
        assert_eq!(*powers.at(0), Power::Mirror);
        assert_eq!(*powers.at(1), Power::Halve);
        assert_eq!(*powers.at(2), Power::DoubleUp);
        assert_eq!(*powers.at(3), Power::Foresight);
        assert_eq!(*powers.at(4), Power::Low);
        assert_eq!(*powers.at(5), Power::High);
        assert_eq!(*powers.at(6), Power::Reroll);
    }

    #[test]
    fn test_usage_assert_powers_valid() {
        let mut usage: Usage = create();
        usage.insert(0b1111111);
        usage.insert(0b1111110);
        usage.insert(0b1111100);
        usage.insert(0b1111000);
        usage.insert(0b1110000);
        usage.insert(0b1100000);
        usage.insert(0b1000000);
        UsageAssert::assert_valid_powers(@usage, 0b0001111);
        UsageAssert::assert_valid_powers(@usage, 0b1010000);
    }

    #[test]
    #[should_panic(expected: ('Usage: powers too expensive',))]
    fn test_usage_assert_powers_revert_too_expensive() {
        let mut usage: Usage = create();
        usage.insert(0b1111111);
        usage.insert(0b1111110);
        usage.insert(0b1111100);
        usage.insert(0b1111000);
        usage.insert(0b1110000);
        usage.insert(0b1100000);
        usage.insert(0b1000000);
        UsageAssert::assert_valid_powers(@usage, 0b1110000);
    }

    #[test]
    fn test_usage_powers_case_001() {
        let mut usage: Usage = create();
        usage.board = 340282367158622951006167620212400062465;
        let powers: Array<Power> = usage.powers();
        assert_eq!(*powers.at(0), Power::Foresight);
        assert_eq!(*powers.at(1), Power::DoubleUp);
        assert_eq!(*powers.at(2), Power::Reroll);
        assert_eq!(*powers.at(3), Power::Mirror);
        assert_eq!(*powers.at(4), Power::Halve);
        assert_eq!(*powers.at(5), Power::Low);
        assert_eq!(*powers.at(6), Power::High);
    }
}
