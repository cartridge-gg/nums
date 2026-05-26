use core::num::traits::Zero;
use starknet::ContractAddress;
pub use crate::models::index::Bridge;

pub mod errors {
    pub const BRIDGE_INVALID_ADDRESS: felt252 = 'Bridge: invalid address';
    pub const BRIDGE_PEER_NOT_SET: felt252 = 'Bridge: peer not set';
}

#[generate_trait]
pub impl BridgeImpl of BridgeTrait {
    fn new(
        world_resource: felt252, address: ContractAddress, peer: ContractAddress,
    ) -> Bridge {
        // [Check] Messaging address must be set on construction; peer may
        // be 0 at Setup.initialize time and filled in by Setup.set_bridge
        // once both chains have migrated.
        AssertTrait::assert_is_valid(address);
        // [Return] Bridge
        Bridge { world_resource: world_resource, address: address, peer: peer }
    }
}

#[generate_trait]
pub impl BridgeAssert of AssertTrait {
    #[inline]
    fn assert_is_valid(address: ContractAddress) {
        assert(address.is_non_zero(), errors::BRIDGE_INVALID_ADDRESS)
    }
}

/// Read `bridge.peer` and fail loudly if it hasn't been wired yet.
/// Every cross-chain send/receive site goes through this so a
/// misconfigured deploy errors with a clear message instead of
/// silently routing to address `0`.
#[inline]
pub fn assert_peer(bridge: Bridge) -> ContractAddress {
    assert(bridge.peer.is_non_zero(), errors::BRIDGE_PEER_NOT_SET);
    bridge.peer
}
