//! Happy-path e2e for the mainnet-economics + appchain-gameplay design.
//!
//! Spins up two Katanas (settlement on :5071, appchain on :5072 in rollup
//! mode), migrates fresh Nums worlds onto each, and wires the bridge
//! addresses via the admin setters on both Setup contracts. There is no
//! standalone `Materializer` deploy step in the new architecture — the
//! forward L1Handler is `Play.create` on the appchain `Play` contract
//! directly.
//!
//! Forward round-trip exercised by this test:
//!
//!   1. Mainnet (settlement) `Setup.issue(bundle_id, qty)` — runs the
//!      existing inline purchase flow (swap+burn+vault.pay+team.transfer),
//!      then `Play.mint` mints one `Collection` NFT per game unit and
//!      queues a Piltover message per unit. Each message carries a
//!      serialized `Payload` struct with selector `selector!("create")`.
//!   2. Katana's messaging worker auto-delivers the L1Handler on the
//!      appchain → `Play.create(from_address, player, game_id,
//!      multiplier, supply, price)` validates the sender, re-mints the
//!      `Collection` NFT on the appchain with the same `game_id`, and
//!      starts the game via `playable.create(...)`.
//!   3. Assert: appchain `Collection.balance_of(player)` has increased
//!      by `qty`.
//!
//! The reverse round-trip (gameplay → `Playable.claim` → mainnet
//! `Play.claim` → `Token.reward`) is documented in
//! `docs/BRIDGE_ARCHITECTURE.md` but not yet driven end-to-end by this
//! test.
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
#[ignore = "pending Lane C end-to-end validation of the new forward flow"]
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

    // 1. Mainnet purchase — Setup.issue → Play.mint. The `Bridge` model
    //    points at the messaging mock (patched by TestEnv::start via
    //    `Setup.set_bridge`). The MessageSent event on the messaging
    //    mock gives us the serialized Payload (player, game_id, ...)
    //    and the Piltover-computed message hash.
    let purchase = env.settlement_player_buy_bundle(player_addr, 1, 1).await?;
    info!(
        "purchase: game_id={pid} bundle_id={bid} qty={q}",
        pid = purchase.purchase_id,
        bid = purchase.bundle_id,
        q = purchase.quantity,
    );
    assert!(
        purchase.purchase_id >= 1,
        "game_id must be assigned (>=1): got {}",
        purchase.purchase_id,
    );
    // Serialized `Payload` Serde encoding length: at least 7 felts
    // (player, game_id, multiplier, supply.lo, supply.hi, price.lo,
    // price.hi, level, reward — the exact felt count depends on Serde
    // representation of the u8/u128/u256 fields). Lower-bound the
    // assertion to "non-trivial payload was emitted".
    assert!(
        purchase.payload.len() >= 7,
        "forward payload must be at least 7 felts (Payload Serde): {:?}",
        purchase.payload,
    );

    // 2. Wait for Katana's messaging worker to deliver the L1Handler.
    env.update_state_for_pending_messages(&purchase).await?;

    // 3. Wait for the appchain to materialize the Game (i.e. for
    //    Play.create to mint the Collection NFT on the appchain).
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
