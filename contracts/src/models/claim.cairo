pub use crate::models::index::Claim;

pub mod errors {
    pub const CLAIM_ALREADY_CLAIMED: felt252 = 'Claim: already claimed';
}

#[generate_trait]
pub impl ClaimImpl of ClaimTrait {
    #[inline]
    fn new(player: felt252, starterpack_id: u32) -> Claim {
        // [Return] New reward
        Claim { player: player, starterpack_id: starterpack_id, claimed: false }
    }

    #[inline]
    fn claim(ref self: Claim) {
        // [Check] Claim has not been claimed yet
        self.assert_not_claimed();
        // [Effect] Claim starterpack
        self.claimed = true;
    }
}

#[generate_trait]
pub impl ClaimAssert of AssertTrait {
    fn assert_not_claimed(self: @Claim) {
        assert(!*self.claimed, errors::CLAIM_ALREADY_CLAIMED);
    }
}
