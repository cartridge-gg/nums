//! Setup contract smoke tests.
//!
//! NOTE: comprehensive bridge-mode and apply_game_claim_batch tests are added
//! in `test_setup_bridge.cairo` (Lane A, task #6). This file holds the basic
//! spawn-and-config-defaults checks shared across the test suite.

use crate::StoreImpl;
use crate::tests::setup::setup::spawn_game;

#[test]
fn test_setup() {
    spawn_game();
}

/// Mainnet regression: bridge-mode config fields default to zero, which is the
/// signal `BundleImpl::on_issue` uses to take the local (pure-Starknet) path.
/// If this ever flips, mainnet would silently switch to the bridge codepath.
#[test]
fn test_bridge_config_fields_zero_by_default() {
    let (world, _systems, _ctx) = spawn_game();
    let store = StoreImpl::new(world);
    let config = store.config();
    let zero: starknet::ContractAddress = 0.try_into().unwrap();
    assert(config.appchain_materializer == zero, 'mat not zero');
    assert(config.bridge_messaging == zero, 'msg not zero');
    assert(config.appchain_play == zero, 'play not zero');
    assert(config.mainnet_setup == zero, 'setup not zero');
}

/// PurchaseNonce monotonic counter: two consecutive calls return distinct
/// purchase_ids. Regression for replay-guard correctness (different purchases
/// must produce different Materializer storage entries).
#[test]
fn test_next_purchase_nonce_increments() {
    let (world, _systems, _ctx) = spawn_game();
    let mut store = StoreImpl::new(world);
    let initial = store.purchase_nonce();
    assert(initial.next == 0, 'initial not zero');
    let n1 = store.next_purchase_nonce();
    assert(n1 == 1, 'first nonce should be 1');
    let n2 = store.next_purchase_nonce();
    assert(n2 == 2, 'second nonce should be 2');
    assert(n1 != n2, 'consecutive equal');
}

/// PendingPurchase round-trip + status transition through the new states
/// (Pending → Materialized).
#[test]
fn test_pending_purchase_round_trip() {
    use crate::models::index::{PendingPurchase, PendingStatus};
    let (world, _systems, _ctx) = spawn_game();
    let mut store = StoreImpl::new(world);
    let player: starknet::ContractAddress = 'PLAYER_X'.try_into().unwrap();
    let purchase_id: u64 = 42;
    let pending = PendingPurchase {
        purchase_id,
        recipient: player,
        bundle_id: 3,
        quantity: 5,
        status: PendingStatus::Pending,
    };
    store.set_pending_purchase(@pending);
    let read = store.pending_purchase(purchase_id);
    assert(read.recipient == player, 'recipient roundtrip');
    assert(read.bundle_id == 3, 'bundle_id roundtrip');
    assert(read.quantity == 5, 'quantity roundtrip');
    assert(read.status == PendingStatus::Pending, 'status pending');

    // Materialize and verify.
    let materialized = PendingPurchase {
        purchase_id,
        recipient: read.recipient,
        bundle_id: read.bundle_id,
        quantity: read.quantity,
        status: PendingStatus::Materialized,
    };
    store.set_pending_purchase(@materialized);
    let after = store.pending_purchase(purchase_id);
    assert(after.status == PendingStatus::Materialized, 'status materialized');
}
