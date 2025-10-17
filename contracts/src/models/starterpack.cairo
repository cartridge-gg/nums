pub use crate::models::index::Starterpack;

pub mod errors {
    pub const STARTERPACK_ALREADY_EXISTS: felt252 = 'Starterpack: already exists';
    pub const STARTERPACK_DOES_NOT_EXIST: felt252 = 'Starterpack: does not exist';
}

#[generate_trait]
pub impl StarterpackImpl of StarterpackTrait {
    #[inline]
    fn new(id: u32) -> Starterpack {
        // [Return] New starterpack
        Starterpack { id: id, active: true }
    }

    #[inline]
    fn remove(ref self: Starterpack) {
        self.active = false;
    }
}

#[generate_trait]
pub impl StarterpackAssert of AssertTrait {
    #[inline]
    fn assert_not_exist(self: @Starterpack) {
        assert(!*self.active, errors::STARTERPACK_ALREADY_EXISTS);
    }

    #[inline]
    fn assert_does_exist(self: @Starterpack) {
        assert(*self.active, errors::STARTERPACK_DOES_NOT_EXIST);
    }
}
