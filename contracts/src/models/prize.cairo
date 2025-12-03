pub use crate::models::index::Prize;

// Constants

const PRECISION: u128 = 10_000;
const PAYOUTS: [[u128; 27]; 25] = [
    [10_000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [7000, 3000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [5000, 3000, 2000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [4000, 2500, 2000, 1500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [
        3700, 2500, 1500, 1200, 1100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0,
    ],
    [
        3500, 2200, 1500, 1100, 900, 800, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0,
    ],
    [
        3100, 2100, 1300, 1000, 850, 650, 550, 450, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0,
    ],
    [
        3000, 2000, 1200, 950, 800, 600, 500, 400, 300, 250, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0,
    ],
    [
        2800, 1700, 1060, 860, 760, 530, 430, 330, 270, 210, 210, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0,
    ],
    [
        2700, 1600, 1000, 800, 700, 490, 390, 290, 240, 190, 190, 130, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0,
    ],
    [
        2650, 1550, 980, 780, 680, 460, 360, 280, 220, 165, 165, 110, 100, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0,
    ],
    [
        2600, 1500, 960, 760, 660, 450, 350, 260, 210, 150, 150, 100, 90, 80, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0,
    ],
    [
        2550, 1475, 940, 740, 640, 440, 340, 240, 195, 140, 140, 95, 85, 75, 65, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0,
    ],
    [
        2500, 1450, 920, 720, 620, 430, 330, 230, 185, 140, 140, 90, 80, 70, 60, 55, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0,
    ],
    [
        2450, 1425, 900, 700, 600, 420, 320, 220, 165, 125, 125, 85, 75, 65, 55, 50, 40, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0,
    ],
    [
        2400, 1400, 880, 680, 580, 410, 310, 210, 150, 110, 110, 85, 75, 65, 55, 50, 37, 30, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
    ],
    [
        2350, 1375, 880, 680, 580, 410, 310, 210, 150, 110, 110, 75, 65, 55, 50, 45, 30, 27, 25, 0,
        0, 0, 0, 0, 0, 0, 0,
    ],
    [
        2300, 1350, 850, 650, 550, 390, 290, 190, 130, 100, 100, 70, 60, 50, 45, 40, 28, 24, 22, 21,
        0, 0, 0, 0, 0, 0, 0,
    ],
    [
        2250, 1325, 850, 650, 550, 390, 290, 190, 130, 100, 100, 70, 60, 50, 45, 40, 24, 20, 19, 15,
        14, 0, 0, 0, 0, 0, 0,
    ],
    [
        2200, 1300, 830, 630, 530, 380, 280, 180, 125, 95, 95, 65, 55, 45, 40, 35, 24, 20, 19, 15,
        14, 13, 0, 0, 0, 0, 0,
    ],
    [
        2175, 1275, 830, 630, 530, 380, 280, 180, 125, 95, 95, 55, 45, 40, 35, 30, 24, 20, 19, 15,
        13, 12, 11, 0, 0, 0, 0,
    ],
    [
        2150, 1250, 810, 610, 510, 370, 270, 170, 115, 85, 85, 55, 45, 40, 35, 30, 20, 19, 18, 15,
        13, 12, 11, 11, 0, 0, 0,
    ],
    [
        2100, 1225, 810, 610, 510, 370, 270, 170, 115, 85, 85, 55, 45, 40, 35, 30, 20, 19, 18, 13,
        12, 11, 10, 10, 9, 0, 0,
    ],
    [
        2075, 1200, 790, 590, 490, 360, 260, 160, 90, 75, 75, 55, 45, 40, 35, 30, 20, 19, 18, 13,
        12, 11, 10, 10, 9, 9, 0,
    ],
    [
        2050, 1175, 790, 590, 490, 360, 260, 160, 90, 75, 75, 50, 40, 35, 30, 25, 20, 18, 17, 13,
        12, 11, 10, 10, 9, 9, 8,
    ],
];

pub mod errors {
    pub const PRIZE_ALREADY_EXISTS: felt252 = 'Prize: already exists';
    pub const PRIZE_DOES_NOT_EXIST: felt252 = 'Prize: does not exist';
    pub const PRIZE_INVALID_CAPACITY: felt252 = 'Prize: invalid capacity';
    pub const PRIZE_INVALID_AMOUNT: felt252 = 'Prize: invalid amount';
}

#[generate_trait]
pub impl PrizeImpl of PrizeTrait {
    #[inline]
    fn new(tournament_id: u16, address: felt252, amount: u128) -> Prize {
        // [Check] Amount is valid
        PrizeAssert::assert_valid_amount(amount);
        // [Return] New prize
        Prize { tournament_id: tournament_id, address: address, amount: amount }
    }

    #[inline]
    fn sponsor(ref self: Prize, amount: u128) {
        self.amount += amount;
    }

    #[inline]
    fn exists(self: @Prize) -> bool {
        self.amount != @0
    }

    #[inline]
    fn clear(ref self: Prize) {
        self.amount = 0;
    }

    #[inline]
    fn payout(self: @Prize, rank: u8, entry_count: u32) -> u128 {
        let payouts = PAYOUTS.span();
        let row = _row(entry_count, payouts.len() - 1);
        let payouts = payouts[row].span();
        let col = _column(rank, payouts.len() - 1);
        let payout = payouts.get(col);
        let ratio = *(payout.unwrap_or(BoxTrait::new(@0)).unbox());
        *self.amount * ratio / PRECISION
    }
}

#[inline]
fn _row(entry_count: u32, max: u32) -> u32 {
    if entry_count == 0 {
        return max;
    } else if entry_count < 11 {
        return (7 + entry_count) / 10;
    } else if entry_count < 31 {
        return 2;
    } else if entry_count < 61 {
        return (entry_count - 1) / 10;
    } else if entry_count < 76 {
        return 2 + (entry_count - 1) / 15;
    } else if entry_count < 101 {
        return 4 + (entry_count - 1) / 25;
    } else if entry_count < 401 {
        return 6 + (entry_count - 1) / 50;
    } else if entry_count < 501 {
        return 10 + (entry_count - 1) / 100;
    } else if entry_count < 701 {
        return 15;
    } else if entry_count < 801 {
        return 16;
    } else if entry_count < 1001 {
        return 13 + (entry_count - 1) / 200;
    } else if entry_count < 2501 {
        return 14 + (entry_count - 1) / 250;
    }
    return max;
}

#[inline]
fn _column(rank: u8, max: u32) -> u32 {
    if rank == 0 {
        return max;
    } else if rank < 11 {
        return rank.into() - 1;
    } else if rank < 41 {
        return 8 + (rank.into() - 1) / 5;
    } else if rank < 61 {
        return 12 + (rank.into() - 1) / 10;
    } else if rank < 76 {
        return 14 + (rank.into() - 1) / 15;
    }
    16 + (rank.into() - 1) / 25
}

#[generate_trait]
pub impl PrizeAssert of AssertTrait {
    fn assert_not_exist(self: @Prize) {
        assert(!self.exists(), errors::PRIZE_ALREADY_EXISTS);
    }

    fn assert_does_exist(self: @Prize) {
        assert(self.exists(), errors::PRIZE_DOES_NOT_EXIST);
    }

    fn assert_valid_capacity(capacity: u32, ratios: Span<u128>) {
        assert(capacity != 0, errors::PRIZE_INVALID_CAPACITY);
        assert(capacity <= ratios.len(), errors::PRIZE_INVALID_CAPACITY);
    }

    fn assert_valid_amount(amount: u128) {
        assert(amount != 0, errors::PRIZE_INVALID_AMOUNT);
    }
}

#[cfg(test)]
mod tests {
    use super::{PAYOUTS, PRECISION, PrizeAssert, PrizeTrait, _column, _row};

    // Constants

    pub const TOURNAMENT_ID: u16 = 1;
    pub const PRIZE_AMOUNT: u128 = 1_000_000_000_000_000_000;
    pub const PRIZE_ADDRESS: felt252 = 'PRIZE';
    pub const WINNER_COUNT: u32 = 5;

    #[test]
    fn test_payout_one_winner() {
        let prize = PrizeTrait::new(TOURNAMENT_ID, PRIZE_ADDRESS, PRIZE_AMOUNT);
        let payout = prize.payout(1, 1);
        assert_eq!(payout, prize.amount.into());
    }

    #[test]
    fn test_payout_one_winners_last() {
        let prize = PrizeTrait::new(TOURNAMENT_ID, PRIZE_ADDRESS, PRIZE_AMOUNT);
        let payout = prize.payout(255, 1);
        assert_eq!(payout, 0);
    }

    #[test]
    fn test_payout_multiple_winners_first() {
        let prize = PrizeTrait::new(TOURNAMENT_ID, PRIZE_ADDRESS, PRIZE_AMOUNT);
        let payout = prize.payout(1, 10_000);
        assert_eq!(payout, 2050 * prize.amount.into() / PRECISION);
    }

    #[test]
    fn test_payout_multiple_winners_last() {
        let prize = PrizeTrait::new(TOURNAMENT_ID, PRIZE_ADDRESS, PRIZE_AMOUNT);
        let payout = prize.payout(255, 10_000);
        assert_eq!(payout, 8 * prize.amount.into() / PRECISION);
    }

    #[test]
    fn test_payout_total() {
        let prize = PrizeTrait::new(TOURNAMENT_ID, PRIZE_ADDRESS, PRIZE_AMOUNT);
        let mut entry_count: u32 = 1_000;
        let mut total: u128 = 0;
        let mut winner = entry_count / 10; // ~ 10% winners
        while winner > 0 {
            total += prize.payout(winner.try_into().unwrap(), entry_count);
            winner -= 1;
        }
        assert_eq!(total, prize.amount.into());
    }

    #[test]
    fn test_rank_into_column() {
        let max = PAYOUTS.span().at(0).span().len() - 1;
        assert_eq!(_column(1, max), 0);
        assert_eq!(_column(10, max), 9);
        assert_eq!(_column(11, max), 10);
        assert_eq!(_column(15, max), 10);
        assert_eq!(_column(16, max), 11);
        assert_eq!(_column(40, max), 15);
        assert_eq!(_column(41, max), 16);
        assert_eq!(_column(50, max), 16);
        assert_eq!(_column(51, max), 17);
        assert_eq!(_column(60, max), 17);
        assert_eq!(_column(61, max), 18);
        assert_eq!(_column(75, max), 18);
        assert_eq!(_column(250, max), 25);
        assert_eq!(_column(251, max), max);
        assert_eq!(_column(255, max), max);
    }

    #[test]
    fn test_rank_into_row() {
        let max = PAYOUTS.span().len() - 1;
        assert_eq!(_row(1, max), 0);
        assert_eq!(_row(2, max), 0);
        assert_eq!(_row(3, max), 1);
        assert_eq!(_row(10, max), 1);
        assert_eq!(_row(11, max), 2);
        assert_eq!(_row(30, max), 2);
        assert_eq!(_row(31, max), 3);
        assert_eq!(_row(40, max), 3);
        assert_eq!(_row(41, max), 4);
        assert_eq!(_row(50, max), 4);
        assert_eq!(_row(51, max), 5);
        assert_eq!(_row(60, max), 5);
        assert_eq!(_row(61, max), 6);
        assert_eq!(_row(75, max), 6);
        assert_eq!(_row(76, max), 7);
        assert_eq!(_row(100, max), 7);
        assert_eq!(_row(101, max), 8);
        assert_eq!(_row(150, max), 8);
        assert_eq!(_row(151, max), 9);
        assert_eq!(_row(200, max), 9);
        assert_eq!(_row(201, max), 10);
        assert_eq!(_row(250, max), 10);
        assert_eq!(_row(251, max), 11);
        assert_eq!(_row(300, max), 11);
        assert_eq!(_row(301, max), 12);
        assert_eq!(_row(350, max), 12);
        assert_eq!(_row(351, max), 13);
        assert_eq!(_row(400, max), 13);
        assert_eq!(_row(401, max), 14);
        assert_eq!(_row(500, max), 14);
        assert_eq!(_row(501, max), 15);
        assert_eq!(_row(700, max), 15);
        assert_eq!(_row(701, max), 16);
        assert_eq!(_row(800, max), 16);
        assert_eq!(_row(801, max), 17);
        assert_eq!(_row(1_000, max), 17);
        assert_eq!(_row(1_001, max), 18);
        assert_eq!(_row(1_250, max), 18);
        assert_eq!(_row(1_251, max), 19);
        assert_eq!(_row(1_500, max), 19);
        assert_eq!(_row(1_501, max), 20);
        assert_eq!(_row(1_750, max), 20);
        assert_eq!(_row(1_751, max), 21);
        assert_eq!(_row(2_000, max), 21);
        assert_eq!(_row(2_001, max), 22);
        assert_eq!(_row(2_250, max), 22);
        assert_eq!(_row(2_251, max), 23);
        assert_eq!(_row(2_500, max), 23);
        assert_eq!(_row(2_501, max), max);
        assert_eq!(_row(2_750, max), max);
        assert_eq!(_row(2_751, max), max);
        assert_eq!(_row(3_000, max), max);
        assert_eq!(_row(3_001, max), max);
        assert_eq!(_row(3_500, max), max);
        assert_eq!(_row(4_000, max), max);
        assert_eq!(_row(4_500, max), max);
        assert_eq!(_row(5_000, max), max);
        assert_eq!(_row(5_500, max), max);
        assert_eq!(_row(10_000, max), max);
        assert_eq!(_row(100_000, max), max);
    }
}
