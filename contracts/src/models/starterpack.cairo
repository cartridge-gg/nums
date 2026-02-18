use starterpack::types::item::ItemTrait;
use starterpack::types::metadata::MetadataTrait;
pub use crate::constants::IMAGE;
use crate::models::index::Starterpack;

pub mod errors {
    pub const STARTERPACK_ALREADY_EXISTS: felt252 = 'Starterpack: already exists';
    pub const STARTERPACK_DOES_NOT_EXIST: felt252 = 'Starterpack: does not exist';
}

#[generate_trait]
pub impl StarterpackImpl of StarterpackTrait {
    #[inline]
    fn new(
        id: u32,
        reissuable: bool,
        referral_percentage: u8,
        price: u256,
        payment_token: starknet::ContractAddress,
        multiplier: u8,
    ) -> Starterpack {
        // [Return] New starterpack
        Starterpack {
            id: id,
            reissuable: reissuable,
            referral_percentage: referral_percentage,
            price: price,
            payment_token: payment_token,
            multiplier: multiplier,
        }
    }

    #[inline]
    fn remove(ref self: Starterpack) {
        self.payment_token = 0.try_into().unwrap();
    }

    #[inline]
    fn exists(self: @Starterpack) -> bool {
        *self.payment_token != 0.try_into().unwrap()
    }

    #[inline]
    fn amount(self: @Starterpack, quantity: u32) -> u256 {
        let base_price = *self.price * quantity.into();
        let fee = base_price * (*self.referral_percentage).into() / 100;
        base_price - fee
    }

    #[inline]
    fn metadata(payment_token: starknet::ContractAddress, multiplier: u8) -> ByteArray {
        let description: ByteArray = if multiplier == 1 {
            "A standard game playable on nums.gg"
        } else {
            format!("A standard game playable on nums.gg with a x{} reward multiplier", multiplier)
        };
        let item = ItemTrait::new(name: "Game", description: description, image_uri: IMAGE());
        let metadata = MetadataTrait::new(
            name: "Nums Starterpack",
            description: "This starterpack contains Nums games",
            image_uri: IMAGE(),
            items: array![item].span(),
            tokens: array![payment_token].span(),
        );
        metadata.jsonify()
    }

    #[inline]
    fn update(
        ref self: Starterpack,
        reissuable: bool,
        referral_percentage: u8,
        price: u256,
        payment_token: starknet::ContractAddress,
    ) {
        self.reissuable = reissuable;
        self.referral_percentage = referral_percentage;
        self.price = price;
        self.payment_token = payment_token;
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
