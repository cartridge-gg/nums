pub use crate::models::index::Prize;

// Constants

const PAYOUT_RATIOS: [u128; 10] = [1, 3, 6, 12, 24, 48, 96, 192, 384, 768];

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
    fn payout(self: @Prize, rank: u32, capacity: u32) -> u128 {
        PrizeAssert::assert_valid_capacity(capacity, PAYOUT_RATIOS.span());
        let prize: u128 = (*self.amount).into();
        let ratios = PAYOUT_RATIOS.span();
        let (payout, _) = _payout(prize, rank, capacity, ratios);
        payout
    }
}

/// Helper function to calculate the payout for a given rank and capacity.
///
/// # Arguments
///
/// * `prize` - The prize amount.
/// * `rank` - The rank of the winner.
/// * `capacity` - The capacity of the tournament.
/// * `ratios` - The payout ratios.
///
/// # Returns
///
/// A tuple containing the payout amount and the sum of the payouts.
pub fn _payout(prize: u128, rank: u32, capacity: u32, ratios: Span<u128>) -> (u128, u128) {
    if rank == 0 || rank > capacity {
        return (0, 0);
    }
    let ratio = *ratios.at(rank - 1);
    if (rank == capacity) {
        let payout = prize / ratio;
        return (payout, payout);
    }
    let (_, sum) = _payout(prize, rank + 1, capacity, ratios);
    let payout = (prize - sum) / ratio;
    (payout, payout + sum)
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
    use super::{PrizeAssert, PrizeTrait};

    // Constants

    pub const TOURNAMENT_ID: u16 = 1;
    pub const PRIZE_AMOUNT: u128 = 1_000_000_000_000_000_000;
    pub const PRIZE_ADDRESS: felt252 = 'PRIZE';
    pub const WINNER_COUNT: u32 = 5;

    #[test]
    fn test_payout_one_winner() {
        let capacity = 1;
        let prize = PrizeTrait::new(TOURNAMENT_ID, PRIZE_ADDRESS, PRIZE_AMOUNT);
        let payout = prize.payout(1, capacity);
        assert_eq!(payout, prize.amount.into());
    }

    #[test]
    fn test_payout_two_winners() {
        let capacity = 2;
        let prize = PrizeTrait::new(TOURNAMENT_ID, PRIZE_ADDRESS, PRIZE_AMOUNT);
        let second = prize.payout(2, capacity);
        assert_eq!(second, prize.amount.into() / 3);
        let first = prize.payout(1, capacity);
        assert_eq!(first, prize.amount.into() - second);
        assert_eq!(first + second, prize.amount.into());
    }

    #[test]
    fn test_payout_three_winners() {
        let capacity = 3;
        let prize = PrizeTrait::new(TOURNAMENT_ID, PRIZE_ADDRESS, PRIZE_AMOUNT);
        let third = prize.payout(3, capacity);
        assert_eq!(third, prize.amount.into() / 6);
        let second = prize.payout(2, capacity);
        assert_eq!(second, (prize.amount.into() - third) / 3);
        let first = prize.payout(1, capacity);
        assert_eq!(first, prize.amount.into() - second - third);
        assert_eq!(first + second + third, prize.amount.into());
    }

    #[test]
    fn test_payout_four_winners() {
        let capacity = 4;
        let prize = PrizeTrait::new(TOURNAMENT_ID, PRIZE_ADDRESS, PRIZE_AMOUNT);
        let fourth = prize.payout(4, capacity);
        assert_eq!(fourth, prize.amount.into() / 12);
        let third = prize.payout(3, capacity);
        assert_eq!(third, (prize.amount.into() - fourth) / 6);
        let second = prize.payout(2, capacity);
        assert_eq!(second, (prize.amount.into() - third - fourth) / 3);
        let first = prize.payout(1, capacity);
        assert_eq!(first, prize.amount.into() - second - third - fourth);
        assert_eq!(first + second + third + fourth, prize.amount.into());
    }

    #[test]
    fn test_payout_five_winners() {
        let capacity = 5;
        let prize = PrizeTrait::new(TOURNAMENT_ID, PRIZE_ADDRESS, PRIZE_AMOUNT);
        let fifth = prize.payout(5, capacity);
        assert_eq!(fifth, prize.amount.into() / 24);
        let fourth = prize.payout(4, capacity);
        assert_eq!(fourth, (prize.amount.into() - fifth) / 12);
        let third = prize.payout(3, capacity);
        assert_eq!(third, (prize.amount.into() - fourth - fifth) / 6);
        let second = prize.payout(2, capacity);
        assert_eq!(second, (prize.amount.into() - third - fourth - fifth) / 3);
        let first = prize.payout(1, capacity);
        assert_eq!(first, prize.amount.into() - second - third - fourth - fifth);
        assert_eq!(first + second + third + fourth + fifth, prize.amount.into());
    }
}
