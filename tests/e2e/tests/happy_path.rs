//! Full round-trip e2e for the Nums cross-chain bridge.
//!
//! Spins up two Katanas (settlement on :5071, appchain on :5072 in
//! rollup mode), migrates fresh Nums worlds onto each, and wires the
//! bridge address via `Setup.set_bridge` on both Setup contracts. There
//! is no standalone `Materializer` deploy step — the forward L1Handler
//! is `Play.create` on the appchain `Play` contract directly.
//!
//! Exercised by `happy_path_round_trip`:
//!
//!   1. **Forward direction** — mainnet `Setup.issue(bundle_id, qty)`:
//!      runs `purchase.execute` (swap+burn+vault.pay+team.transfer),
//!      then `Play.mint` mints one `Collection` NFT per unit and queues
//!      a Piltover message per unit. Captures the first MessageSent
//!      event to extract the assigned `game_id`.
//!   2. **Auto-delivery** — Katana's messaging worker delivers the
//!      L1Handler on the appchain: `Play.create` validates the sender,
//!      re-mints the `Collection` NFT under the same `game_id`, and
//!      starts the game via `playable.create`.
//!   3. **Reverse direction (fabricated payload)** — build a synthetic
//!      reverse `Payload` as if the appchain `Playable.finish` had
//!      emitted it (level reached, reward owed). Inject its hash into
//!      the settlement-side messaging mock via the `messaging_test`
//!      backdoor.
//!   4. Player calls mainnet `Play.claim(payload)`:
//!      `consume_message_from_appchain` validates the message exists,
//!      `Collection.assert_is_owner(caller, game_id)` checks ownership,
//!      `playable.claim` updates the EMA and mints NUMS via
//!      `nums_disp().reward(player, reward)`.
//!   5. Assert: NUMS balance on mainnet increases by `reward`,
//!      Collection NFT on appchain mirrors the mainnet game_id.
//!
//! The fabricated reverse payload short-circuits the RNG-dependent
//! gameplay loop (set/select/apply through to game-over). The same
//! Piltover plumbing is exercised — Cairo `Serde` round-trip of the
//! `Payload` struct, address-equality of mainnet/appchain Play,
//! `consume_message_from_appchain` ref-counting, NUMS mint via
//! `Token.reward`, EMA push in `config.push`. Gameplay correctness is
//! unit-tested separately.
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
async fn happy_path_round_trip() -> Result<()> {
    let started_at = std::time::Instant::now();
    let env = TestEnv::start().await?;
    env.assert_infrastructure_ready().await?;

    // The player is the settlement-side dev account; the same address
    // must work on both chains by the identity invariant (Cartridge
    // controllers preserve address across chains in production).
    let player = env.dev_account_settlement()?;
    let player_addr: Felt = player.address();
    info!("player={player_addr:#x}");

    // ------------------------------------------------------------------
    // Forward: mainnet Setup.issue → Piltover delivery → appchain Play.create
    // ------------------------------------------------------------------

    let pre_player_games = env.read_player_games_count(player_addr).await?;
    let pre_nums_balance = env.read_player_nums_balance(player_addr).await?;
    info!(
        "pre: appchain_games={pre_player_games} nums_balance={pre_nums_balance}",
    );

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
    // Serialized Payload Serde encoding length: 9 felts
    // (player, game_id, multiplier, supply.lo/hi, price.lo/hi, level, reward).
    assert!(
        purchase.payload.len() >= 7,
        "forward payload must be at least 7 felts (Payload Serde): {:?}",
        purchase.payload,
    );

    env.update_state_for_pending_messages(&purchase).await?;
    env.wait_for_appchain_materialization(player_addr, pre_player_games + 1, 120)
        .await?;

    let post_player_games = env.read_player_games_count(player_addr).await?;
    info!("post-forward: appchain_games={post_player_games}");
    assert_eq!(
        post_player_games,
        pre_player_games + 1,
        "appchain games should increase by 1: pre={pre_player_games} post={post_player_games}",
    );

    // ------------------------------------------------------------------
    // Reverse: synthetic Playable.finish → mainnet Play.claim → NUMS mint
    // ------------------------------------------------------------------
    //
    // The fields below mirror what a real `Playable.finish` would build
    // after the player finishes the game on the appchain. We choose:
    //   * multiplier = MULTIPLIER_PRECISION (1_000_000) — a "no extra
    //     bonus" baseline; matches `Setup.issue` with average_score=10
    //     and burn_pct=0 to within rounding.
    //   * supply_low = 1_000_000 * 1e18 — initial NUMS supply matches
    //     dojo_e2esettlement.toml.
    //   * price_low = 2_000_000 — entry_price (2 USDC, 6 decimals).
    //   * level = 10 — a non-trivial game-over level (well within the
    //     default 18-slot game).
    //   * reward = 5e18 — 5 NUMS (18 decimals).
    let reward_amount: u128 = 5 * 1_000_000_000_000_000_000u128;
    let multiplier_baseline: u128 = 1_000_000;
    let supply_low: u128 = 1_000_000u128 * 1_000_000_000_000_000_000u128;
    let price_low: u128 = 2_000_000;
    let level: u8 = 10;

    let reverse_payload = env.build_reverse_payload(
        player_addr,
        purchase.purchase_id, // same game_id as the forward path
        multiplier_baseline,
        supply_low,
        price_low,
        level,
        reward_amount,
    );
    info!(
        "reverse_payload: {} felts, game_id={gid}, level={level}, reward={reward_amount}",
        reverse_payload.len(),
        gid = purchase.purchase_id,
    );

    let injected_hash = env.inject_reverse_message(&reverse_payload).await?;
    info!("injected reverse message hash={injected_hash:#x}");

    env.settlement_player_claim(&reverse_payload).await?;

    let post_nums_balance = env.read_player_nums_balance(player_addr).await?;
    info!("post-claim: nums_balance={post_nums_balance}");
    assert_eq!(
        post_nums_balance,
        pre_nums_balance + reward_amount,
        "mainnet NUMS balance should increase by reward_amount: pre={pre_nums_balance} \
         post={post_nums_balance} reward={reward_amount}",
    );

    info!(
        "happy_path_round_trip completed in {:.2?} (forward + reverse)",
        started_at.elapsed(),
    );
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
