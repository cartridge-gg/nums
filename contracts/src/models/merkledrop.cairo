pub use crate::models::index::Merkledrop;

pub mod errors {
    pub const MERKLEDROP_ALREADY_EXISTS: felt252 = 'Merkledrop: already exists';
    pub const MERKLEDROP_DOES_NOT_EXIST: felt252 = 'Merkledrop: does not exist';
    pub const MERKLEDROP_IS_OVER: felt252 = 'Merkledrop: is over';
    pub const MERKLEDROP_IS_NOT_ACTIVE: felt252 = 'Merkledrop: is not active';
}

#[generate_trait]
pub impl MerkledropImpl of MerkledropTrait {
    #[inline]
    fn new(id: felt252, end: u64) -> Merkledrop {
        // [Return] New merkledrop
        Merkledrop { id: id, active: true, end: end }
    }

    #[inline]
    fn is_over(self: @Merkledrop) -> bool {
        starknet::get_block_timestamp() > *self.end
    }

    #[inline]
    fn disable(ref self: Merkledrop) {
        self.active = false;
    }
}

#[generate_trait]
pub impl MerkledropAssert of AssertTrait {
    #[inline]
    fn assert_not_exist(self: @Merkledrop) {
        assert(!*self.active, errors::MERKLEDROP_ALREADY_EXISTS);
    }

    #[inline]
    fn assert_does_exist(self: @Merkledrop) {
        assert(*self.active, errors::MERKLEDROP_DOES_NOT_EXIST);
    }

    #[inline]
    fn assert_not_over(self: @Merkledrop) {
        assert(!self.is_over(), errors::MERKLEDROP_IS_OVER);
    }

    #[inline]
    fn assert_is_active(self: @Merkledrop) {
        assert(*self.active, errors::MERKLEDROP_IS_NOT_ACTIVE);
    }
}
