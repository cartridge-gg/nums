//! End-to-end test harness for the mainnet-economics + appchain-gameplay
//! bridge architecture.
//!
//! Owns:
//!   * Both Katana child processes (`settlement` + `appchain` in rollup mode).
//!   * Two `sozo migrate`-deployed Nums worlds, one on each chain.
//!   * The Piltover messaging_mock (upgraded to the `messaging_test`
//!     class for the appchain→settlement back-door).
//!
//! No standalone `Materializer` contract is deployed: in the current
//! architecture the forward L1Handler is `Play.create` on the appchain
//! `Play` contract directly. See `docs/BRIDGE_ARCHITECTURE.md` for the
//! full flow.
//!
//! ## Load-bearing invariants enforced by this harness
//!
//! 1. **Address equality:** mainnet `Play` contract address must equal
//!    appchain `Play` contract address. Both forward and reverse
//!    directions assert this (`from_address == this` in `Play.create`,
//!    `consume_message_from_appchain(this, ...)` in `Play.claim`).
//!    Satisfied by:
//!    a. Same `seed` in both dojo profiles (`nums-e2e-shared-v1`) so
//!       both worlds compute the same address.
//!    b. `force_play_artifacts_match` copies the settlement `Play` class
//!       artifact to the appchain profile, working around a Sierra-level
//!       non-determinism in sozo's per-profile builds (only `Play`
//!       diverges; all other contracts match across profiles).
//!
//! 2. **Bridge address symmetry:** both Setup contracts hold the same
//!    Piltover messaging contract address. Set via `Setup.set_bridge`
//!    post-migrate (production deploys pass `bridge_messaging` directly
//!    to `dojo_init`).
//!
//! 3. **Cairo `Payload` Serde field order:** `Payload` struct field
//!    declaration order in `events/index.cairo` is `(game_id, player,
//!    multiplier, supply, price, level, reward)`. Both the L1Handler
//!    `Play.create` signature and the harness's reverse-payload builder
//!    must match this order exactly (Cairo's strict L1Handler
//!    deserialization rejects mismatches).
//!
//! ## Test-driven contract additions
//!
//! Three Cairo contracts include test-driven deployer-admin grants
//! (`Token`, `Play`, `Setup`) that let the harness mutate access-control
//! state without going through Treasury timelock. Marked clearly in each
//! contract; production-safe because the deployer IS the
//! Treasury-controlled account on real chains.
//!
//! ## Deployment order
//!
//!   1. `init_rollup` declares + deploys the Piltover Appchain core on
//!      settlement, writes chain config for the appchain Katana.
//!   2. Upgrade Appchain core to the `messaging_test` class so we can
//!      inject Appchain→Settlement message hashes manually for the
//!      reverse direction.
//!   3. Build both dojo profiles serially. Copy `Play` artifacts across
//!      profiles to force class-hash equality.
//!   4. Migrate both worlds in parallel.
//!   5. Wire bridge addresses via `Setup.set_bridge` on both chains.
//!   6. Seed Vault shares (non-zero `total_shares` required by
//!      `Rewardable::pay`).
//!
//! Production deploys pass `bridge_messaging` directly to `dojo_init`,
//! so the post-deploy `set_bridge` call is dev-only.

use std::path::{Path, PathBuf};
use std::time::Duration;

use anyhow::{anyhow, bail, Context, Result};
use starknet::accounts::{Account, ConnectedAccount, SingleOwnerAccount};
use starknet::core::types::{
    BlockId, BlockTag, Call, Felt, FunctionCall, TransactionReceipt,
};
use starknet::core::utils::get_selector_from_name;
use starknet::macros::selector;
use starknet::providers::jsonrpc::HttpTransport;
use starknet::providers::{JsonRpcClient, Provider};
use starknet::signers::LocalWallet;
use tracing::{debug, info, warn};

use crate::constants::{
    APPCHAIN_CHAIN_ID_STR, DEV_ACCOUNT_0_ADDRESS, DEV_ACCOUNT_0_PRIVKEY,
};
use crate::katana::{assert_dev_account_matches, KatanaNode};
use crate::messaging::{add_messages_hashes_from_appchain, build_account, wait_for_tx_success};
use crate::rollup::{
    assert_test_backdoor_present, init_rollup, upgrade_appchain_to_test_class,
    write_appchain_profile_toml,
};
use crate::sozo::{
    assert_sozo_runnable, build as sozo_build, migrate as sozo_migrate, read_manifest,
    DeployedWorld,
};

/// PendingPurchase status on settlement. Matches the on-chain enum.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PendingStatus {
    Pending,
    Materialized,
    Cancelled,
}

impl PendingStatus {
    pub fn from_felt(f: Felt) -> Self {
        if f == Felt::ZERO {
            Self::Pending
        } else if f == Felt::ONE {
            Self::Materialized
        } else {
            Self::Cancelled
        }
    }
}

/// Handle to a purchase initiated on mainnet (settlement) `Setup.issue`
/// in bridge mode. In the current architecture there is no
/// `PendingPurchase` link from mainnet to appchain — instead, the
/// `game_id` minted by mainnet `Collection.new` is reused as-is on the
/// appchain by `Play.create`, and ERC721 token-id uniqueness on
/// `Collection.mint` is the replay guard.
///
/// `purchase_id` is kept on this handle for backwards compatibility with
/// the previous flow; tests that no longer care about it can ignore it.
/// In practice it's the `game_id` of the first NFT minted by the bundle
/// (subsequent units within the same `Setup.issue` call get sequential
/// ids).
#[derive(Debug, Clone)]
pub struct PurchaseHandle {
    pub purchase_id: u64,
    /// Forward (game-mint) payload sent mainnet → appchain.
    /// Layout: serialized `Payload` struct (Cairo `Serde`):
    /// `(player, game_id, multiplier, supply.lo, supply.hi, price.lo,
    /// price.hi, level=0, reward=0)`. The exact felt count depends on
    /// `Serde` encoding of `u256` fields.
    pub payload: Vec<Felt>,
    pub bundle_id: u32,
    pub quantity: u32,
    /// Piltover-computed message hash for the forward direction. Used by
    /// the state-root commit back-door.
    pub message_hash: Felt,
}

pub struct TestEnv {
    pub settlement: KatanaNode,
    pub appchain: KatanaNode,
    pub messaging_mock: Felt,
    pub temp: tempfile::TempDir,
    pub repo_root: PathBuf,

    pub settlement_world: DeployedWorld,
    pub appchain_world: DeployedWorld,

    settlement_account_addr: Felt,
    settlement_account_priv: Felt,
    settlement_chain_id: Felt,

    appchain_account_addr: Felt,
    appchain_account_priv: Felt,
    appchain_chain_id: Felt,
}

impl TestEnv {
    pub async fn start() -> Result<Self> {
        let _ = tracing_subscriber::fmt()
            .with_env_filter(
                tracing_subscriber::EnvFilter::try_from_default_env()
                    .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info,nums_e2e=info")),
            )
            .with_target(false)
            .try_init();

        assert_sozo_runnable()
            .await
            .context("sozo binary check failed")?;

        let temp = tempfile::tempdir().context("create harness tempdir")?;
        info!("Harness scratch dir: {}", temp.path().display());

        let repo_root = repo_root()?;
        info!("Repo root: {}", repo_root.display());

        // 1. Settlement Katana (--dev, optionally forks Cartridge mainnet).
        let settlement = KatanaNode::start_settlement(None).await?;
        assert_dev_account_matches(&settlement.rpc_url(), DEV_ACCOUNT_0_ADDRESS).await?;

        let settlement_chain_id = Self::provider(&settlement.rpc_url())?
            .chain_id()
            .await
            .context("read settlement chain_id")?;
        let settlement_account_addr = DEV_ACCOUNT_0_ADDRESS;
        let settlement_account_priv = DEV_ACCOUNT_0_PRIVKEY;
        info!("Settlement chain_id: {settlement_chain_id:#x}");

        // 2. `katana init rollup` — declares + deploys the Piltover Appchain
        //    core contract on settlement, configures program_info /
        //    facts_registry, writes config.toml + genesis.json into
        //    `<tmp>/chain/`. Output is the chain spec the appchain Katana
        //    boots with via `--chain`.
        let chain_dir = temp.path().join("chain");
        std::fs::create_dir_all(&chain_dir).context("create chain config dir")?;
        let rollup = init_rollup(
            APPCHAIN_CHAIN_ID_STR,
            &settlement.rpc_url(),
            settlement_account_addr,
            settlement_account_priv,
            Felt::ONE, // facts_registry placeholder
            &chain_dir,
        )
        .await
        .context("katana init rollup")?;
        let messaging_mock = rollup.core_contract;
        info!(
            "katana init rollup: core_contract={messaging_mock:#x}, deployed_block={}, genesis_account={addr:#x}",
            rollup.deployed_block,
            addr = rollup.appchain_account.address,
        );

        // 3. Upgrade Appchain core to the `messaging_test` class so we can
        //    inject Appchain→Settlement message hashes manually.
        let provider = Self::provider(&settlement.rpc_url())?;
        let settlement_acct = build_account(
            provider,
            settlement_chain_id,
            settlement_account_addr,
            settlement_account_priv,
        );
        let appchain_with_test_artifact = artifact_path("appchain_with_test.contract_class.json");
        if !appchain_with_test_artifact.exists() {
            bail!(
                "missing artifact at {} — run bin/integration-test-setup",
                appchain_with_test_artifact.display()
            );
        }
        upgrade_appchain_to_test_class(
            &settlement_acct,
            &appchain_with_test_artifact,
            messaging_mock,
        )
        .await
        .context("upgrade Piltover Appchain to messaging_test class")?;
        assert_test_backdoor_present(settlement_acct.provider(), messaging_mock).await?;
        info!("messaging_test back-door confirmed on core_contract={messaging_mock:#x}");

        // 4. Render the appchain dojo profile from its template.
        write_appchain_profile_toml(
            &repo_root,
            "dojo_e2eappchain.template.toml",
            "dojo_e2eappchain.toml",
            &rollup.appchain_account,
        )
        .context("render dojo_e2eappchain.toml")?;

        // 5. Start the appchain Katana as a `ChainSpec::Rollup` (is_l3=true).
        let appchain = KatanaNode::start_appchain_rollup(&chain_dir).await?;

        let appchain_chain_id = chain_id_felt(APPCHAIN_CHAIN_ID_STR)?;
        let appchain_account_addr = rollup.appchain_account.address;
        let appchain_account_priv = rollup.appchain_account.private_key;

        // 6. Build profiles serially (target/ races otherwise).
        info!("sozo build (e2eappchain) ...");
        sozo_build(&repo_root, "e2eappchain")
            .await
            .context("build e2eappchain")?;
        info!("sozo build (e2esettlement) ...");
        sozo_build(&repo_root, "e2esettlement")
            .await
            .context("build e2esettlement")?;

        // Force identical Play class hashes on both chains so the
        // address-equality invariant holds (mainnet Play addr ==
        // appchain Play addr). Sozo's per-profile Sierra output is
        // non-deterministic for Play specifically (only Play; Setup /
        // Token / Vault / Collection all match across profiles), likely
        // from one of the achievement / quest / leaderboard / collection
        // dependencies. Until upstream determinism is fixed, copy the
        // settlement-profile Play artifacts over the appchain-profile
        // ones so both `sozo migrate` calls declare the same class hash.
        force_play_artifacts_match(&repo_root)
            .context("force Play artifact equality across profiles")?;

        // 7. Migrate both worlds in parallel.
        info!("sozo migrate (parallel: appchain + settlement) ...");
        let repo_root_a = repo_root.clone();
        let repo_root_b = repo_root.clone();
        let appchain_fut = tokio::spawn(async move {
            sozo_migrate(&repo_root_a, "e2eappchain").await
        });
        let settlement_fut = tokio::spawn(async move {
            sozo_migrate(&repo_root_b, "e2esettlement").await
        });
        let (a_res, s_res) = tokio::join!(appchain_fut, settlement_fut);
        a_res.context("appchain migrate task panicked")??;
        s_res.context("settlement migrate task panicked")??;
        let appchain_world = read_manifest(&repo_root, "e2eappchain")?;
        let settlement_world = read_manifest(&repo_root, "e2esettlement")?;
        info!(
            "Appchain world @ {:#x} ({} contracts), settlement world @ {:#x} ({} contracts)",
            appchain_world.world_address,
            appchain_world.contracts.len(),
            settlement_world.world_address,
            settlement_world.contracts.len(),
        );

        // 8. (Removed in the current architecture.) The previous design
        //    UDC-deployed a standalone `Materializer` contract on the
        //    appchain. In the new flow, the forward L1Handler is
        //    `Play.create` on the appchain `Play` contract directly,
        //    so no separate contract deployment is required.

        let env = Self {
            settlement,
            appchain,
            messaging_mock,
            temp,
            repo_root: repo_root.clone(),
            settlement_world,
            appchain_world,
            settlement_account_addr,
            settlement_account_priv,
            settlement_chain_id,
            appchain_account_addr,
            appchain_account_priv,
            appchain_chain_id,
        };

        // 9. Wire cross-chain addresses via the bridge setters on both
        //    Setup contracts. After this, bridge mode is active on both
        //    sides.
        env.wire_cross_chain_addresses().await?;

        // 10. (Removed.) `MINTER_ROLE` no longer needs to be granted to
        //     mainnet Setup — reward minting now happens through mainnet
        //     `Play.claim → Playable.claim → nums_disp.reward`, and
        //     `Play` already holds `MINTER_ROLE` from the default deploy.

        // 10b. (Removed.) No standalone `Materializer` exists, so there
        //      is no extra `CREATOR_ROLE` grant on appchain `Play` to
        //      perform. The default `dojo_init` grant to appchain Setup
        //      + `Play` itself is sufficient for the new flow.

        // 11. Seed the settlement Vault with NUMS shares so vault.pay's
        //     rewardable.pay doesn't trip 'Rewardable: vault is empty'.
        //     Dev account 0 holds 1M NUMS from the Token mint at migrate
        //     time. We deposit 1 NUMS (18-decimal); just needs
        //     total_shares != 0.
        env.seed_vault_shares(1_000_000_000_000_000_000_u128).await?;

        Ok(env)
    }

    pub fn provider(rpc_url: &str) -> Result<JsonRpcClient<HttpTransport>> {
        let url = url::Url::parse(rpc_url).context("parse rpc url")?;
        Ok(JsonRpcClient::new(HttpTransport::new(url)))
    }

    pub fn settlement_account(
        &self,
    ) -> Result<SingleOwnerAccount<JsonRpcClient<HttpTransport>, LocalWallet>> {
        Ok(build_account(
            Self::provider(&self.settlement.rpc_url())?,
            self.settlement_chain_id,
            self.settlement_account_addr,
            self.settlement_account_priv,
        ))
    }

    pub fn appchain_account(
        &self,
    ) -> Result<SingleOwnerAccount<JsonRpcClient<HttpTransport>, LocalWallet>> {
        Ok(build_account(
            Self::provider(&self.appchain.rpc_url())?,
            self.appchain_chain_id,
            self.appchain_account_addr,
            self.appchain_account_priv,
        ))
    }

    /// The settlement-side dev account; same address acts as the player
    /// in the bridge flow (identity invariant — controller addresses
    /// match across chains).
    pub fn dev_account_settlement(
        &self,
    ) -> Result<SingleOwnerAccount<JsonRpcClient<HttpTransport>, LocalWallet>> {
        self.settlement_account()
    }

    // ------------------------------------------------------------------
    // Wiring & setup
    // ------------------------------------------------------------------

    async fn wire_cross_chain_addresses(&self) -> Result<()> {
        let setup_settlement = self.settlement_world.contract("NUMS-Setup")?;
        let setup_appchain = self.appchain_world.contract("NUMS-Setup")?;

        // The `Bridge` model carries a single field — the Piltover
        // messaging contract used by `Play.mint` (forward, via
        // `send_message_to_appchain`) and by `Play.claim` (reverse, via
        // `consume_message_from_appchain`). Both directions reuse the
        // settlement messaging mock in the e2e harness.
        let settlement_acct = self.settlement_account()?;
        let tx = settlement_acct
            .execute_v3(vec![Call {
                to: setup_settlement,
                selector: selector!("set_bridge"),
                calldata: vec![self.messaging_mock],
            }])
            .gas_estimate_multiplier(2.0)
            .send()
            .await
            .context("settlement Setup.set_bridge")?;
        wait_for_tx_success(settlement_acct.provider(), tx.transaction_hash).await?;
        info!(
            "Settlement Setup wired: bridge.address={msg:#x}",
            msg = self.messaging_mock,
        );

        // Symmetric write on the appchain Setup. The appchain bridge
        // address is read only for diagnostics today (the reverse
        // message is queued via the native `send_message_to_l1_syscall`
        // in `Playable.finish`), but `BridgeTrait::new` requires a
        // non-zero address, so we still set it.
        let appchain_acct = self.appchain_account()?;
        let tx = appchain_acct
            .execute_v3(vec![Call {
                to: setup_appchain,
                selector: selector!("set_bridge"),
                calldata: vec![self.messaging_mock],
            }])
            .gas_estimate_multiplier(2.0)
            .send()
            .await
            .context("appchain Setup.set_bridge")?;
        wait_for_tx_success(appchain_acct.provider(), tx.transaction_hash).await?;
        info!(
            "Appchain Setup wired: bridge.address={msg:#x}",
            msg = self.messaging_mock,
        );

        Ok(())
    }

    /// Deposit a small amount of NUMS into the settlement Vault so its
    /// `total_shares` is non-zero before any `vault.pay` call.
    ///
    /// Failure mode without this: `Setup.issue → purchase.execute →
    /// vault.pay(...)` calls into `RewardableComponent` which asserts
    /// `total_shares != 0` (panic message: 'Rewardable: vault is empty').
    /// On a fresh test world there are no stakers yet, so `total_shares`
    /// is 0 by default.
    ///
    /// The Token mint at migrate time gives dev account 0 1M NUMS (per
    /// `dojo_e2esettlement.toml`); we deposit 1 NUMS (18-decimal) into
    /// the vault here. The amount doesn't matter — anything > 0 satisfies
    /// the assert. We don't bother with reward-share accounting because
    /// the test only exercises the bridge path, not vault-yield claims.
    async fn seed_vault_shares(&self, nums_amount_low: u128) -> Result<()> {
        let token = self.settlement_world.contract("NUMS-Token")?;
        let vault = self.settlement_world.contract("NUMS-Vault")?;
        let acct = self.settlement_account()?;
        let amount_lo = Felt::from(nums_amount_low);
        let approve = Call {
            to: token,
            selector: selector!("approve"),
            calldata: vec![vault, amount_lo, Felt::ZERO],
        };
        let deposit = Call {
            to: vault,
            selector: selector!("deposit"),
            calldata: vec![amount_lo, Felt::ZERO, DEV_ACCOUNT_0_ADDRESS],
        };
        let tx = acct
            .execute_v3(vec![approve, deposit])
            .gas_estimate_multiplier(2.0)
            .send()
            .await
            .context("vault.deposit (seed)")?;
        wait_for_tx_success(acct.provider(), tx.transaction_hash).await?;
        info!("Seeded Vault with {nums_amount_low} NUMS shares");
        Ok(())
    }

    // Role grants for `Materializer`-mediated forward flow and for
    // `Setup.apply_game_claim_batch`-mediated reverse flow have been
    // removed: in the current architecture the forward L1Handler is
    // `Play.create` (which uses `Play`'s existing access control) and
    // the reverse path mints rewards through mainnet `Play.claim`
    // (which already holds `MINTER_ROLE` from the default deploy).

    // ------------------------------------------------------------------
    // Read primitives
    // ------------------------------------------------------------------

    /// The settlement world's PurchaseNonce.next value. Legacy from
    /// the previous architecture; in the current flow `PurchaseNonce`
    /// is no longer load-bearing (the appchain `game_id` mints are
    /// driven by mainnet `Collection.new`, not by a separate counter),
    /// but the model is still present in the world for diagnostic
    /// purposes.
    pub async fn read_purchase_nonce(&self) -> Result<u64> {
        let world_addr = self.settlement_world.world_address;
        let provider = Self::provider(&self.settlement.rpc_url())?;
        let _ = world_addr;
        let _ = provider;
        Ok(0)
    }

    /// Legacy: in the previous architecture this read
    /// `PendingPurchase{purchase_id}.status` from mainnet. In the
    /// current flow there is no `PendingPurchase` write on the forward
    /// path — game ownership on the mainnet `Collection` NFT is the
    /// source of truth instead. Kept as a no-op stub for source-compat.
    pub async fn read_pending_status(&self, purchase_id: u64) -> Result<PendingStatus> {
        let _ = purchase_id;
        Ok(PendingStatus::Pending)
    }

    /// Count games owned by `player` on the appchain Collection (each
    /// `play.create` mints an NFT to the player; balanceOf is the count).
    pub async fn read_player_games_count(&self, player: Felt) -> Result<u64> {
        let collection = self.appchain_world.contract("NUMS-Collection")?;
        let provider = Self::provider(&self.appchain.rpc_url())?;
        let res = provider
            .call(
                FunctionCall {
                    contract_address: collection,
                    entry_point_selector: selector!("balance_of"),
                    calldata: vec![player],
                },
                BlockId::Tag(BlockTag::PreConfirmed),
            )
            .await
            .context("collection.balance_of")?;
        // balance_of returns u256 (two felts: lo, hi). Games count fits in u64.
        let lo = res.first().ok_or_else(|| anyhow!("empty balance_of result"))?;
        felt_to_u64(*lo)
    }

    // ------------------------------------------------------------------
    // Scenario primitives — forward path (mainnet → appchain)
    // ------------------------------------------------------------------

    /// Player calls settlement `Setup.issue` in bridge mode. `Setup.issue`
    /// delegates to mainnet `Play.mint`, which for each game unit:
    ///   1. Mints a `Collection` NFT on mainnet (`Collection.new`).
    ///   2. Sends a Piltover message to the appchain `Play` with
    ///      selector `selector!("create")` carrying a serialized
    ///      `Payload` (`player, game_id, multiplier, supply, price,
    ///      0, 0`).
    ///
    /// This harness method captures the first `MessageSent` event
    /// emitted by `messaging_mock` during the call and returns its
    /// payload + Piltover-computed message hash. The first felt of the
    /// payload is the `player` field; the second is the assigned
    /// `game_id`, which doubles as the legacy `purchase_id` for the
    /// `PurchaseHandle` (see the struct docs).
    ///
    /// NOTE: Forward (mainnet→appchain) Piltover messages are NOT
    /// represented as L2→L1 messages in the tx receipt. Piltover's
    /// `send_message_to_appchain` is a contract method, not a Cairo
    /// `send_message_to_l1_syscall`. The message lives in the messaging
    /// mock's storage + a `MessageSent` event; Katana's messaging worker
    /// polls that storage and delivers an L1Handler tx on the appchain.
    pub async fn settlement_player_buy_bundle(
        &self,
        player_addr: Felt,
        bundle_id: u32,
        quantity: u32,
    ) -> Result<PurchaseHandle> {
        let setup = self.settlement_world.contract("NUMS-Setup")?;
        let faucet = self.settlement_world.contract("NUMS-Faucet")?;
        let acct = self.settlement_account()?;

        // Approve Setup to spend Faucet (mock USDC) for the purchase.
        let approve = Call {
            to: faucet,
            selector: selector!("approve"),
            calldata: vec![setup, Felt::from(100_000_000_u128), Felt::ZERO],
        };
        // Setup.issue calldata layout (matches IBundle::issue):
        let issue = Call {
            to: setup,
            selector: selector!("issue"),
            calldata: vec![
                player_addr,
                Felt::from(bundle_id),
                Felt::from(quantity),
                Felt::ONE, // referrer = None
                Felt::ONE, // referrer_group = None
                Felt::ONE, // client = None
                Felt::ZERO, // client_percentage = 0
                Felt::ONE, // voucher_key = None
                Felt::ONE, // signature = None
            ],
        };

        let tx = acct
            .execute_v3(vec![approve, issue])
            .gas_estimate_multiplier(2.0)
            .send()
            .await
            .context("issue tx")?;
        let receipt = wait_for_tx_success(acct.provider(), tx.transaction_hash).await?;

        let events: Vec<starknet::core::types::Event> = match &receipt.receipt {
            TransactionReceipt::Invoke(r) => r.events.clone(),
            _ => bail!("issue: unexpected receipt variant"),
        };

        // Find Piltover's MessageSent event emitted by messaging_mock during
        // send_message_to_appchain. Why a tx event rather than the receipt's
        // `messages_sent` field: Piltover's `send_message_to_appchain` is a
        // CONTRACT METHOD that stores the message in messaging_mock storage
        // and emits MessageSent. It is NOT a Cairo `send_message_to_l1`
        // syscall, so the receipt's `messages_sent` array is empty for the
        // forward direction. (The reverse direction is the other way around
        // — `Playable.finish` uses `send_message_to_l1_syscall` and the
        // receipt's `messages_sent` is the source of truth.)
        //
        // piltover/messaging/component.cairo defines MessageSent as:
        //   { #[key] message_hash, #[key] from, #[key] to,
        //     selector: felt252, nonce: u64, payload: Span<felt252> }
        // Starknet event layout (auto-derive groups #[key] fields into keys,
        // non-key fields into data; Span<T> serializes as [len, items...]):
        //   keys = [selector("MessageSent"), message_hash, from, to]
        //   data = [selector_arg, nonce, payload_len, payload...]
        //
        // The payload offset of 3 below (data[3..3+len]) skips the selector
        // (data[0]), the nonce (data[1]), and the Span length prefix
        // (data[2]). Getting this offset wrong was Run 5 of the Lane C
        // debugging — symptoms were spurious "missing field" / "wrong felt"
        // errors because the parser thought the player address was the
        // game_id.
        let ms_sel = get_selector_from_name("MessageSent")
            .map_err(|e| anyhow!("compute MessageSent selector: {e}"))?;
        let ms_event = events
            .iter()
            .find(|e| {
                e.from_address == self.messaging_mock
                    && e.keys.first() == Some(&ms_sel)
            })
            .ok_or_else(|| anyhow!("issue: no MessageSent event on messaging_mock"))?;

        // Extract payload from event data at offset 2 (skip selector + nonce).
        if ms_event.data.len() < 3 {
            bail!(
                "MessageSent event data too short: {} felts",
                ms_event.data.len()
            );
        }
        let payload_len: usize = felt_to_usize(ms_event.data[2])?;
        if ms_event.data.len() < 3 + payload_len {
            bail!(
                "MessageSent payload truncated: data_len={}, expected payload_len={}",
                ms_event.data.len(),
                payload_len
            );
        }
        let payload: Vec<Felt> = ms_event.data[3..3 + payload_len].to_vec();

        // Piltover-computed message hash is event.keys[1].
        let message_hash = ms_event
            .keys
            .get(1)
            .copied()
            .ok_or_else(|| anyhow!("MessageSent missing message_hash key"))?;

        // Payload struct field order (Cairo Serde, matches the
        // declaration order in `events/index.cairo`):
        //   [0]: game_id u64        ← #[key]
        //   [1]: player ContractAddress (felt252)  ← #[key]
        //   [2]: multiplier u128
        //   [3,4]: supply.low/high
        //   [5,6]: price.low/high
        //   [7]: level u8 (zero on forward)
        //   [8]: reward u128 (zero on forward)
        let purchase_id: u64 = payload
            .first()
            .map(|f| felt_to_u64(*f))
            .transpose()?
            .ok_or_else(|| anyhow!("game_id (payload[0]) missing from payload"))?;

        debug!(
            "settlement_player_buy_bundle: game_id={purchase_id}, payload_len={plen}, msg_hash={mh:#x}",
            plen = payload.len(),
            mh = message_hash,
        );

        Ok(PurchaseHandle {
            purchase_id,
            payload,
            bundle_id,
            quantity,
            message_hash,
        })
    }

    /// Drive Piltover's settlement→appchain state-root commit for the
    /// given purchase's message. On the settlement-side Katana, the
    /// messaging poller picks up the SN→Appchain message and delivers
    /// the L1Handler tx on the appchain.
    ///
    /// Implementation note: Katana's settlement→appchain messaging flows
    /// AUTOMATICALLY when both nodes are wired correctly (via the rollup
    /// chain spec). This method's job is therefore mostly to WAIT for
    /// delivery — the messaging_mock state-root commit is internal to
    /// Katana's polling loop. We poll for the L1Handler tx to appear on
    /// the appchain.
    pub async fn update_state_for_pending_messages(
        &self,
        purchase: &PurchaseHandle,
    ) -> Result<()> {
        // For SN→Appchain direction, Katana's messaging worker picks up
        // the MsgToL1 from settlement and submits an L1Handler on
        // appchain. We don't need the messaging_test backdoor here (that
        // was for the REVERSE direction). The state-root commit happens
        // implicitly via Piltover's `Appchain.update_state` over time.
        //
        // For e2e timing we simply wait a few seconds for the poller
        // and trust the rollup-mode chain spec to deliver the message.
        let _ = purchase;
        tokio::time::sleep(Duration::from_secs(3)).await;
        Ok(())
    }

    /// Poll appchain until `player` has at least `expected_count` games.
    /// Returns Ok when condition is met, Err on timeout.
    pub async fn wait_for_appchain_materialization(
        &self,
        player: Felt,
        expected_count: u64,
        timeout_secs: u64,
    ) -> Result<()> {
        let start = std::time::Instant::now();
        let deadline = Duration::from_secs(timeout_secs);
        loop {
            match self.read_player_games_count(player).await {
                Ok(n) if n >= expected_count => {
                    info!("appchain materialization observed: player has {n} games");
                    return Ok(());
                }
                Ok(n) => debug!("wait_for_materialization: {n}/{expected_count}"),
                Err(e) => debug!("read_player_games_count err: {e:#}"),
            }
            if start.elapsed() > deadline {
                self.dump_l1handler_receipts().await.ok();
                bail!(
                    "materialization timeout: player={player:#x} expected>={expected_count} after {timeout_secs}s"
                );
            }
            tokio::time::sleep(Duration::from_millis(500)).await;
        }
    }

    // ------------------------------------------------------------------
    // Scenario primitives — reverse path (appchain → mainnet)
    // ------------------------------------------------------------------

    /// Build a synthetic reverse `Payload` as it would be emitted by the
    /// appchain `Playable.finish` when a game ends. Captures the typical
    /// fields a real game would have at game-over: `level` reached,
    /// `reward` owed (denominated in NUMS, 18-decimal).
    ///
    /// Serialized to match Cairo's `Serde` derive for `Payload`. Field
    /// order matches the struct declaration in `events/index.cairo`:
    ///   game_id: u64             → 1 felt   #[key]
    ///   player: ContractAddress  → 1 felt   #[key]
    ///   multiplier: u128         → 1 felt
    ///   supply: u256             → 2 felts (low, high)
    ///   price: u256              → 2 felts (low, high)
    ///   level: u8                → 1 felt
    ///   reward: u128             → 1 felt
    /// Total: 9 felts.
    pub fn build_reverse_payload(
        &self,
        player: Felt,
        game_id: u64,
        multiplier: u128,
        supply_low: u128,
        price_low: u128,
        level: u8,
        reward: u128,
    ) -> Vec<Felt> {
        vec![
            Felt::from(game_id),     // payload[0]: game_id u64
            player,                   // payload[1]: player ContractAddress
            Felt::from(multiplier),  // payload[2]: multiplier u128
            Felt::from(supply_low),  // payload[3]: supply.low
            Felt::ZERO,              // payload[4]: supply.high
            Felt::from(price_low),   // payload[5]: price.low
            Felt::ZERO,              // payload[6]: price.high
            Felt::from(level),       // payload[7]: level u8
            Felt::from(reward),      // payload[8]: reward u128
        ]
    }

    /// Inject a reverse Piltover message into the settlement-side
    /// messaging mock, mimicking what would arrive after the appchain's
    /// `Playable.finish → send_message_to_l1_syscall(this, payload)` was
    /// settled by a Piltover state-root commit.
    ///
    /// ## Why a backdoor injection rather than driving real gameplay
    ///
    /// The real reverse flow requires playing a game to completion on the
    /// appchain (set/select/apply through to game-over). This is
    /// RNG-dependent and hard to script deterministically in an
    /// integration test — the test would have to make placements that
    /// happen to land in the right slot order given whatever sequence of
    /// random numbers the VRF mock produces.
    ///
    /// Instead, the test exercises the cross-chain PLUMBING end-to-end:
    /// Piltover hash computation, `consume_message_from_appchain`
    /// ref-counting, Cairo `Serde` round-trip of the `Payload` struct,
    /// NUMS mint via `Token.reward`, EMA push in `config.push`. The
    /// gameplay logic itself is covered by unit tests.
    ///
    /// ## Address-equality enforcement
    ///
    /// The Piltover appchain→starknet hash is computed over
    /// `(from_address, to_address, payload)` with NO nonce. Per the
    /// address-equality invariant (see `force_play_artifacts_match` and
    /// the architecture doc), `from = to = mainnet_play_address` for
    /// reverse messages. The pre-check below catches a broken invariant
    /// before the harness misleadingly times out on materialization.
    pub async fn inject_reverse_message(&self, payload: &[Felt]) -> Result<Felt> {
        let mainnet_play = self.settlement_world.contract("NUMS-Play")?;
        // appc->sn hash uses (from, to, payload). Address equality means
        // from = to = mainnet_play. Verify by reading appchain Play addr
        // as a defense against the invariant breaking silently.
        let appchain_play = self.appchain_world.contract("NUMS-Play")?;
        if appchain_play != mainnet_play {
            bail!(
                "address-equality invariant broken: mainnet_play={mainnet_play:#x} \
                 appchain_play={appchain_play:#x}. Both directions of the bridge \
                 expect these to match.",
            );
        }
        let hash = compute_appc_to_sn_message_hash(mainnet_play, mainnet_play, payload);
        debug!(
            "inject_reverse_message: hash={hash:#x}, payload_len={plen}",
            plen = payload.len(),
        );
        let acct = self.settlement_account()?;
        add_messages_hashes_from_appchain(&acct, self.messaging_mock, &[hash])
            .await
            .context("add_messages_hashes_from_appchain")?;
        Ok(hash)
    }

    /// Player calls mainnet `Play.claim(payload)`. Consumes the injected
    /// reverse Piltover message and mints NUMS reward + updates EMA.
    ///
    /// In production this is what a real player calls after the appchain
    /// `Playable.finish` queues a reverse message and the state-root
    /// commit settles. The player retrieves the payload bytes
    /// (off-chain — typically from a Torii event index) and submits this
    /// call. Ownership of the NFT corresponding to `payload.game_id` is
    /// checked via `Collection.assert_is_owner` inside `Play.claim`, so
    /// only the rightful owner can collect the reward.
    pub async fn settlement_player_claim(&self, payload: &[Felt]) -> Result<()> {
        let play = self.settlement_world.contract("NUMS-Play")?;
        let acct = self.settlement_account()?;
        // `Play.claim` takes `payload: Span<felt252>` as its argument.
        // Cairo Serde for Span<T> serializes as [len, items...], so the
        // calldata is prefixed with the felt count.
        let mut calldata = vec![Felt::from(payload.len() as u64)];
        calldata.extend_from_slice(payload);
        let call = Call {
            to: play,
            selector: selector!("claim"),
            calldata,
        };
        let tx = acct
            .execute_v3(vec![call])
            .gas_estimate_multiplier(2.0)
            .send()
            .await
            .context("Play.claim tx")?;
        wait_for_tx_success(acct.provider(), tx.transaction_hash).await?;
        info!("Play.claim consumed reverse message");
        Ok(())
    }

    /// Read the settlement-side NUMS balance for `player`. Used to assert
    /// the reward mint after `Play.claim` settles.
    ///
    /// Why u128: NUMS supply caps at 1M * 1e18 = `0xD3C21BCECCEDA1000000`
    /// which fits comfortably in u128. The on-chain ERC-20 `balance_of`
    /// returns a u256 (two felts: low + high) but the high felt is always
    /// zero in practice, so we read only the low felt and reinterpret as
    /// u128 for ergonomics.
    pub async fn read_player_nums_balance(&self, player: Felt) -> Result<u128> {
        let token = self.settlement_world.contract("NUMS-Token")?;
        let provider = Self::provider(&self.settlement.rpc_url())?;
        let res = provider
            .call(
                FunctionCall {
                    contract_address: token,
                    entry_point_selector: selector!("balance_of"),
                    calldata: vec![player],
                },
                BlockId::Tag(BlockTag::PreConfirmed),
            )
            .await
            .context("token.balance_of")?;
        // balance_of returns u256 (lo, hi). NUMS rewards fit comfortably
        // in u128 for any practical test scenario.
        let lo = res.first().ok_or_else(|| anyhow!("empty balance_of result"))?;
        let bytes = lo.to_bytes_be();
        let mut buf = [0u8; 16];
        buf.copy_from_slice(&bytes[16..32]);
        Ok(u128::from_be_bytes(buf))
    }

    /// Dump recent L1Handler tx receipts on the appchain — diagnostic
    /// for materialization failures.
    pub async fn dump_l1handler_receipts(&self) -> Result<()> {
        use starknet::core::types::{
            ExecutionResult, MaybePreConfirmedBlockWithTxHashes, TransactionReceipt,
            TransactionReceiptWithBlockInfo,
        };
        let provider = Self::provider(&self.appchain.rpc_url())?;
        let latest = provider
            .block_hash_and_number()
            .await
            .context("appchain block_hash_and_number")?;
        let head = latest.block_number;
        let from = head.saturating_sub(20);
        info!("probing appchain blocks {from}..={head} for L1Handler txs");
        for block_n in from..=head {
            let block = provider
                .get_block_with_tx_hashes(BlockId::Number(block_n))
                .await
                .map_err(|e| anyhow!("get_block({block_n}): {e}"))?;
            let tx_hashes = match block {
                MaybePreConfirmedBlockWithTxHashes::Block(b) => b.transactions,
                _ => continue,
            };
            for tx_hash in tx_hashes {
                let receipt: TransactionReceiptWithBlockInfo = provider
                    .get_transaction_receipt(tx_hash)
                    .await
                    .map_err(|e| anyhow!("receipt({tx_hash:#x}): {e}"))?;
                if let TransactionReceipt::L1Handler(r) = &receipt.receipt {
                    let exec = match &r.execution_result {
                        ExecutionResult::Succeeded => "SUCCEEDED".to_string(),
                        ExecutionResult::Reverted { reason } => {
                            format!("REVERTED: {reason}")
                        }
                    };
                    info!(
                        "L1Handler tx {tx_hash:#x} (block {block_n}): {exec}; events={ec}",
                        ec = r.events.len()
                    );
                }
            }
        }
        Ok(())
    }

    pub async fn assert_infrastructure_ready(&self) -> Result<()> {
        let s = Self::provider(&self.settlement.rpc_url())?
            .chain_id()
            .await
            .context("settlement chain_id")?;
        if s != self.settlement_chain_id {
            return Err(anyhow!(
                "settlement chain_id mismatch: got {s:#x}, want {:#x}",
                self.settlement_chain_id
            ));
        }
        let a = Self::provider(&self.appchain.rpc_url())?
            .chain_id()
            .await
            .context("appchain chain_id")?;
        if a != self.appchain_chain_id {
            return Err(anyhow!(
                "appchain chain_id mismatch: got {a:#x}, want {:#x}",
                self.appchain_chain_id
            ));
        }
        Ok(())
    }
}

// ---------------------------------------------------------------------
// Local helpers
// ---------------------------------------------------------------------

/// Copy the settlement-profile `Play` artifacts over the appchain-profile
/// ones so both `sozo migrate` declarations use the same class hash.
///
/// ## Why this is necessary
///
/// The new bridge architecture rests on an **address-equality invariant**:
/// the mainnet `Play` contract must be deployed at the same address as
/// the appchain `Play` contract. Both directions of the cross-chain
/// message flow depend on it:
///
///   * Forward: mainnet `Play.mint` sends `send_message_to_appchain(this, ...)`
///     where `this` is the mainnet Play address. The appchain L1Handler
///     `Play.create` asserts `from_address == this` (appchain Play
///     address). Same address → match.
///   * Reverse: appchain `Playable.finish` queues `send_message_to_l1_syscall(this, ...)`
///     where `this` is the appchain Play address. Mainnet `Play.claim`
///     calls `consume_message_from_appchain(this, payload)` where
///     `this` is the mainnet Play address. Same address → match.
///
/// Dojo contract addresses are deterministic on
/// `(world_address, class_hash, namespace, contract_name)`. With both
/// profiles using the same `seed`, the world addresses match. With
/// identical Cairo source, `Setup`, `Token`, `Vault`, and `Collection`
/// all produce the same class hash on both chains. **But `Play` alone**
/// produces a different `sierra_program` between the two `sozo build
/// --profile X` invocations even though the source is identical (the
/// `abi` and `entry_points_by_type` JSON keys remain bit-identical).
///
/// Plausible cause: one of `achievement`, `quest`, `leaderboard`, or
/// `collection` Dojo deps that Play uses produces non-deterministic
/// Sierra output across profile builds. Setup et al. don't use those
/// deps, hence why only Play diverges.
///
/// ## Workaround
///
/// After both per-profile sozo builds complete, this helper overwrites
/// the appchain's Play artifact with the settlement's. Both `sozo migrate`
/// passes then declare the SAME class hash for `NUMS-Play`, giving the
/// same contract address on both chains.
///
/// ## Properties
///
/// - Safe to call when the source files don't exist (skips with a warn).
/// - Idempotent — calling twice is a no-op on the second run.
/// - Should be removed when upstream Dojo determinism is fixed; the
///   `target/<profile>/nums_Play.contract_class.json` files would then
///   be bit-identical without this copy step.
fn force_play_artifacts_match(repo_root: &Path) -> Result<()> {
    let target = repo_root.join("target");
    let src_dir = target.join("e2esettlement");
    let dst_dir = target.join("e2eappchain");
    let files = [
        "nums_Play.contract_class.json",
        "nums_Play.compiled_contract_class.json",
    ];
    for name in files {
        let src = src_dir.join(name);
        let dst = dst_dir.join(name);
        if !src.exists() {
            warn!(
                "force_play_artifacts_match: source missing at {}, skipping",
                src.display(),
            );
            continue;
        }
        std::fs::copy(&src, &dst).with_context(|| {
            format!(
                "copy {} -> {} (Play artifact equality)",
                src.display(),
                dst.display()
            )
        })?;
        debug!(
            "copied {} -> {} (Play artifact equality)",
            src.display(),
            dst.display(),
        );
    }
    info!("Play artifacts equalized across profiles (force_play_artifacts_match)");
    Ok(())
}

fn artifact_path(name: &str) -> PathBuf {
    let here = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    here.join("artifacts").join(name)
}

fn repo_root() -> Result<PathBuf> {
    let here = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    here.parent()
        .and_then(|p| p.parent())
        .map(|p| p.to_path_buf())
        .ok_or_else(|| anyhow!("repo root not found from {}", here.display()))
}

/// Truncate-or-fit a Felt into a u64. Reads the low 8 bytes (big-endian).
fn felt_to_u64(f: Felt) -> Result<u64> {
    let bytes = f.to_bytes_be();
    let mut buf = [0u8; 8];
    buf.copy_from_slice(&bytes[24..32]);
    Ok(u64::from_be_bytes(buf))
}

fn felt_to_usize(f: Felt) -> Result<usize> {
    let v = felt_to_u64(f)?;
    Ok(v as usize)
}

fn chain_id_felt(name: &str) -> Result<Felt> {
    // Cairo string → felt252 — ASCII chars packed big-endian.
    let bytes = name.as_bytes();
    if bytes.len() > 31 {
        bail!("chain id too long for felt252: {name}");
    }
    let mut padded = [0u8; 32];
    padded[32 - bytes.len()..].copy_from_slice(bytes);
    Ok(Felt::from_bytes_be(&padded))
}

/// Compute `compute_message_hash_appc_to_sn` per piltover.
pub fn compute_appc_to_sn_message_hash(from: Felt, to: Felt, payload: &[Felt]) -> Felt {
    use starknet_crypto::poseidon_hash_many;
    let mut chunks: Vec<Felt> = Vec::with_capacity(3 + payload.len());
    chunks.push(from);
    chunks.push(to);
    chunks.push(Felt::from(payload.len() as u64));
    chunks.extend_from_slice(payload);
    poseidon_hash_many(&chunks)
}

/// Hash a Cairo ByteArray to a single felt. Mirrors Dojo's bytearray_hash.
pub fn bytearray_hash(s: &str) -> Felt {
    use starknet_crypto::poseidon_hash_many;
    let bytes = s.as_bytes();
    let chunk_size = 31;
    let full_chunks = bytes.len() / chunk_size;
    let remainder = bytes.len() % chunk_size;

    let mut elements: Vec<Felt> = Vec::new();
    elements.push(Felt::from(full_chunks as u64));
    for i in 0..full_chunks {
        let chunk = &bytes[i * chunk_size..(i + 1) * chunk_size];
        let mut felt_bytes = [0u8; 32];
        felt_bytes[32 - chunk.len()..].copy_from_slice(chunk);
        elements.push(Felt::from_bytes_be(&felt_bytes));
    }
    if remainder > 0 {
        let chunk = &bytes[full_chunks * chunk_size..];
        let mut felt_bytes = [0u8; 32];
        felt_bytes[32 - chunk.len()..].copy_from_slice(chunk);
        elements.push(Felt::from_bytes_be(&felt_bytes));
        elements.push(Felt::from(remainder as u64));
    } else {
        elements.push(Felt::ZERO);
        elements.push(Felt::ZERO);
    }
    poseidon_hash_many(&elements)
}

// `deploy_materializer` was removed when the standalone `Materializer`
// contract was taken out of the forward path. The forward L1Handler is
// now `Play.create` on the appchain `Play` contract directly, so no
// extra UDC deployment is needed by the harness.
