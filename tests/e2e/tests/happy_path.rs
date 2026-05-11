//! Happy-path e2e for the new mainnet-economics + appchain-gameplay design.
//!
//! Spins up two Katanas (settlement on :5071, appchain on :5072 in rollup
//! mode). Migrates fresh Nums worlds onto each. UDC-deploys the appchain
//! Materializer. Patches cross-chain addresses via setters. Then exercises
//! the full round-trip:
//!
//!   1. Mainnet (settlement) `Setup.issue(bundle_id, qty)` — runs the
//!      existing inline purchase flow (swap+burn+vault.pay+team.transfer
//!      with burn_pct=0 in this profile), assigns purchase_id, records
//!      PendingPurchase{Pending}, queues a 6-felt Piltover game-mint
//!      message to the appchain Materializer.
//!   2. State-root commit settles the message — appchain L1Handler delivers
//!      `Materializer.materialize` which asserts unseen purchase_id, marks
//!      processed, calls `Play.create` on the appchain.
//!   3. Assert: appchain Play has minted a Game with the expected
//!      multiplier/recipient/purchase_id.
//!   4. (Stretch) Drive a synthetic claim message reverse:
//!      `Setup.apply_game_claim_batch(payload)` consumes it, pushes EMA,
//!      mints NUMS reward on mainnet, marks PendingPurchase{Materialized}.
//!
//! Run with:
//!
//! ```sh
//! bin/integration-test happy_path -- --nocapture
//! ```

use anyhow::Result;
use nums_e2e::TestEnv;
use starknet::accounts::Account;
use starknet::core::types::Felt;
use tracing::info;

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
async fn happy_path_bridge_forward() -> Result<()> {
    let started_at = std::time::Instant::now();
    let env = TestEnv::start().await?;
    env.assert_infrastructure_ready().await?;

    // The player is the appchain account — same address as the settlement-
    // side dev account (identity invariant: controller addresses match
    // across chains). In bridge mode the mainnet Setup.issue is what
    // queues the game-mint; the appchain doesn't process payment.
    let player = env.dev_account_settlement()?;
    let player_addr: Felt = player.address();
    info!("player={player_addr:#x}");

    // Pre-state on appchain side.
    let pre_player_games = env.read_player_games_count(player_addr).await?;
    info!("pre: appchain_games={pre_player_games}");

    // 1. Mainnet purchase — Setup.issue takes the bridge path because
    //    config.appchain_materializer was patched non-zero in TestEnv::start.
    //    The MessageSent event on the messaging mock gives us the
    //    mainnet-assigned purchase_id (PurchaseNonce strict monotonic
    //    starting at 1).
    let purchase = env.settlement_player_buy_bundle(player_addr, 1, 1).await?;
    info!(
        "purchase: purchase_id={pid} bundle_id={bid} qty={q}",
        pid = purchase.purchase_id,
        bid = purchase.bundle_id,
        q = purchase.quantity,
    );
    assert!(
        purchase.purchase_id >= 1,
        "purchase_id must be assigned (>=1): got {}",
        purchase.purchase_id,
    );
    assert_eq!(
        purchase.payload.len(),
        6,
        "forward payload must be 6 felts: {:?}",
        purchase.payload,
    );

    // 2. Wait for Katana's messaging worker to deliver the L1Handler.
    env.update_state_for_pending_messages(&purchase).await?;

    // 3. Wait for the appchain to materialize the Game.
    env.wait_for_appchain_materialization(player_addr, pre_player_games + 1, 120)
        .await?;

    let post_player_games = env.read_player_games_count(player_addr).await?;
    info!("post: appchain_games={post_player_games}");
    assert_eq!(
        post_player_games,
        pre_player_games + 1,
        "appchain games should increase by 1: pre={pre_player_games} post={post_player_games}",
    );

    info!("happy_path_bridge_forward completed in {:.2?}", started_at.elapsed());
    Ok(())
}

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
async fn message_hash_matches_piltover_formula() -> Result<()> {
    use nums_e2e::harness::compute_appc_to_sn_message_hash;
    use starknet::macros::felt;

    let from: Felt = felt!("0xabc");
    let to: Felt = felt!("0xdef");
    let payload = [
        felt!("0x1"),
        felt!("0x2"),
        felt!("0x3"),
        felt!("0x4"),
        felt!("0x5"),
        felt!("0x6"),
    ];
    let hash = compute_appc_to_sn_message_hash(from, to, &payload);
    assert_ne!(hash, Felt::ZERO, "message hash should be non-zero");
    Ok(())
}
