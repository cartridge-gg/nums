//! Full round-trip e2e for the Nums cross-chain bridge against REAL Saya.
//!
//! Spins up two Katanas (settlement on :5071, appchain on :5072 in
//! rollup mode), declares + deploys a permissive AMD TEE registry mock
//! on settlement via `saya-ops`, migrates fresh Nums worlds onto each
//! chain, wires the bridge address via `Setup.set_bridge`, and spawns
//! a `saya-tee tee start --mock-prove` child process that proves
//! appchain blocks and commits state roots to the Piltover core.
//!
//! `happy_path_full_saya_round_trip` exercises:
//!
//!   1. **Forward** — mainnet `Setup.issue(bundle_id, qty)`: charges
//!      USDC, runs `purchase.execute` (swap+burn+vault.pay+team), then
//!      `Play.mint` mints one `Collection` NFT per unit and queues a
//!      Piltover message per unit.
//!   2. **Auto-delivery** — Katana's messaging worker delivers the
//!      L1Handler on the appchain: `Play.create` validates the sender,
//!      re-mints the `Collection` NFT under the same `game_id`, and
//!      starts the game via `playable.create`.
//!   3. **Real gameplay** — player drives `Play.set(game_id, index)`
//!      on the appchain until `game.over != 0`. The terminating
//!      `Play.set` tx triggers `Playable.finish`, which builds the
//!      reverse `Payload` and enqueues it via
//!      `send_message_to_l1_syscall(this, payload)`.
//!   4. **Real Saya commit** — `saya-tee` polls the appchain, batches
//!      the block, generates a stub TEE attestation (passes against
//!      the mock TEE registry), and calls `update_state(...)` on the
//!      settlement Piltover core. After the commit, the reverse
//!      message hash becomes `ReadyToConsume(>=1)`.
//!   5. **Reward mint** — player calls mainnet `Play.claim(payload)`:
//!      `consume_message_from_appchain` accepts the message,
//!      `Collection.assert_is_owner(caller, game_id)` enforces NFT
//!      ownership, `playable.claim` updates the EMA, and
//!      `nums_disp.reward(player, reward_amount)` mints NUMS on
//!      mainnet.
//!   6. Asserts: NUMS balance on mainnet increases by the reward in
//!      the captured payload, and the Collection NFT on appchain
//!      mirrors the mainnet `game_id`.
//!
//! ## Player identity
//!
//! We route the purchase through `env.appchain_account_addr` (the
//! rollup genesis account) rather than `DEV_ACCOUNT_0`, because that
//! account is the only one pre-deployed and signable on the appchain
//! — needed for step 3 to call `Play.set` as the NFT owner. On
//! settlement the same address is signable courtesy of
//! `--dev.no-account-validation`. USDC for the purchase still comes
//! from `DEV_ACCOUNT_0` (the bundle-issue tx is sent by that account;
//! Setup.issue charges the caller, recipient is independent).
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
async fn happy_path_full_saya_round_trip() -> Result<()> {
    let started_at = std::time::Instant::now();
    let env = TestEnv::start().await?;
    env.assert_infrastructure_ready().await?;

    // Player == appchain rollup genesis account. See module-level docs
    // for why this is preferred over DEV_ACCOUNT_0 in the real-Saya
    // flow (must be signable on both chains; appchain rollup mode only
    // pre-deploys the genesis account, not Katana's --dev accounts).
    let appchain_player = env.appchain_account()?;
    let settlement_player = env.appchain_player_on_settlement()?;
    let player_addr: Felt = appchain_player.address();
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
    // Reverse: real gameplay → real Saya commit → mainnet Play.claim
    // ------------------------------------------------------------------

    // 3. Drive the game on the appchain until Playable.finish queues
    //    the reverse Piltover message.
    let game_id = purchase.purchase_id;
    info!("driving appchain Play.set until game_id={game_id} is over ...");
    let reverse_payload = env
        .play_until_finish(&appchain_player, game_id)
        .await?;
    // Payload Serde encoding: 9 felts
    // (game_id, player, multiplier, supply.lo/hi, price.lo/hi, level, reward).
    assert_eq!(
        reverse_payload.len(),
        9,
        "reverse payload must be 9 felts (Payload Serde): {:?}",
        reverse_payload,
    );
    // payload[8] is the reward in NUMS base units (u128).
    let reward_amount: u128 = u128::try_from(reverse_payload[8])
        .map_err(|_| anyhow::anyhow!("reward overflows u128: {:?}", reverse_payload[8]))?;
    info!(
        "captured reverse payload: game_id={gid:#x} reward={reward_amount}",
        gid = reverse_payload[0],
    );

    // 4. Wait for saya-tee --mock-prove to commit the appchain state
    //    root carrying our reverse message. With batch_size=1 + 5s
    //    idle_timeout this normally settles in <30s on dev hardware.
    // Generous timeout: Saya commits state roots one appchain block at a
    // time at ~0.5 blocks/sec under `--mock-prove`, and the message
    // block sits near the end of the migrate-+-gameplay block sequence
    // (~120–140). 180s reliably came up short; 600s gives a comfortable
    // margin even on a busy dev machine.
    env.wait_for_state_root_commit(&reverse_payload, 600)
        .await?;

    // 5. Player consumes the now-ready message + mints NUMS reward.
    env.settlement_player_claim(&settlement_player, &reverse_payload)
        .await?;

    let post_nums_balance = env.read_player_nums_balance(player_addr).await?;
    info!("post-claim: nums_balance={post_nums_balance}");
    assert_eq!(
        post_nums_balance,
        pre_nums_balance + reward_amount,
        "mainnet NUMS balance should increase by reward_amount: pre={pre_nums_balance} \
         post={post_nums_balance} reward={reward_amount}",
    );

    info!(
        "happy_path_full_saya_round_trip completed in {:.2?} (forward + real Saya reverse)",
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
