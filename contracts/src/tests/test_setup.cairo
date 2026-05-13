//! Setup contract smoke tests.
//!
//! Bridge-mode tests (default-zero invariants, EMA commutativity)
//! live in `test_bridge_mainnet.cairo`. This file holds the basic
//! spawn-and-default checks shared across the test suite.

use crate::StoreImpl;
use crate::tests::setup::setup::spawn_game;

#[test]
fn test_setup() {
    spawn_game();
}

/// Default-state regression: before `dojo_init` runs, the `Bridge` model
/// is unwritten and reads return zero. `dojo_init` writes a non-zero
/// messaging address (enforced by `BridgeTrait::new` /
/// `BridgeAssert::assert_is_valid`) in production deploys; `spawn_test_world`
/// here intentionally skips that step.
#[test]
fn test_bridge_config_fields_zero_by_default() {
    let (world, _systems, _ctx) = spawn_game();
    let store = StoreImpl::new(world);
    let bridge = store.bridge();
    let zero: starknet::ContractAddress = 0.try_into().unwrap();
    assert(bridge.address == zero, 'bridge addr should be zero');
}
