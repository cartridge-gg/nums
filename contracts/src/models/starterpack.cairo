pub use crate::models::index::Starterpack;

pub mod errors {
    pub const STARTERPACK_ALREADY_EXISTS: felt252 = 'Starterpack: already exists';
    pub const STARTERPACK_DOES_NOT_EXIST: felt252 = 'Starterpack: does not exist';
}

#[generate_trait]
pub impl StarterpackImpl of StarterpackTrait {
    #[inline]
    fn new(
        id: u32, referral_percentage: u8, price: u256, payment_token: starknet::ContractAddress,
    ) -> Starterpack {
        // [Return] New starterpack
        Starterpack {
            id: id,
            referral_percentage: referral_percentage,
            price: price,
            payment_token: payment_token,
        }
    }

    #[inline]
    fn remove(ref self: Starterpack) {
        self.price = 0;
    }

    #[inline]
    fn exists(self: @Starterpack) -> bool {
        *self.price != 0
    }

    #[inline]
    fn amount(self: @Starterpack) -> u256 {
        let referral_fee_amount = *self.price * (*self.referral_percentage).into() / 100;
        *self.price - referral_fee_amount
    }
}

#[generate_trait]
pub impl StarterpackAssert of AssertTrait {
    #[inline]
    fn assert_not_exist(self: @Starterpack) {
        assert(!self.exists(), errors::STARTERPACK_ALREADY_EXISTS);
    }

    #[inline]
    fn assert_does_exist(self: @Starterpack) {
        assert(self.exists(), errors::STARTERPACK_DOES_NOT_EXIST);
    }
}
