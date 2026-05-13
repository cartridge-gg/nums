use core::num::traits::Zero;
use starknet::ContractAddress;
pub use crate::models::index::Bridge;

pub mod errors {
    pub const BRIDGE_INVALID_ADDRESS: felt252 = 'Bridge: invalid address';
}

#[generate_trait]
pub impl BridgeImpl of BridgeTrait {
    fn new(world_resource: felt252, address: ContractAddress) -> Bridge {
        // [Check] Parameters
        AssertTrait::assert_is_valid(address);
        // [Return] Bridge
        Bridge { world_resource: world_resource, address: address }
    }
}

#[generate_trait]
pub impl BridgeAssert of AssertTrait {
    #[inline]
    fn assert_is_valid(address: ContractAddress) {
        assert(address.is_non_zero(), errors::BRIDGE_INVALID_ADDRESS)
    }
}
