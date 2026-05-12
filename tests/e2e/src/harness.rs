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
//! Deployment order:
//!   1. Migrate both worlds with the bridge messaging address zero
//!      (`dojo_init` is invoked by `sozo migrate`; here the test harness
//!      skips the assert by passing the messaging address through
//!      `Setup.set_bridge` post-migrate instead).
//!   2. Call `Setup.set_bridge(messaging_mock)` on both Setup contracts
//!      to point them at the Piltover messaging mock.
//!
//! Production deploys pass `bridge_messaging` directly to `dojo_init`,
//! so the post-deploy `set_bridge` call is dev-only.

use std::path::PathBuf;
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
use tracing::{debug, info};

use crate::constants::{
    APPCHAIN_CHAIN_ID_STR, DEV_ACCOUNT_0_ADDRESS, DEV_ACCOUNT_0_PRIVKEY,
};
use crate::katana::{assert_dev_account_matches, KatanaNode};
use crate::messaging::{build_account, wait_for_tx_success};
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
    /// total_shares is non-zero (Rewardable::pay asserts vault is not
    /// empty). The Token mint at migrate time gives dev account 0 1M
    /// NUMS, more than enough.
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
        // send_message_to_appchain. piltover/messaging/component.cairo
        // defines MessageSent as { #[key] message_hash, #[key] from,
        // #[key] to, selector, nonce, payload: Span<felt252> }.
        // Starknet event layout:
        //   keys = [selector("MessageSent"), message_hash, from, to]
        //   data = [selector_arg, nonce, payload_len, payload...]
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

        // In the new `Payload` Serde layout, payload[0] = player
        // (ContractAddress) and payload[1] = game_id (u64). We reuse
        // game_id as the legacy "purchase_id" on `PurchaseHandle` for
        // backwards compatibility with the previous harness API.
        let purchase_id: u64 = payload
            .get(1)
            .map(|f| felt_to_u64(*f))
            .transpose()?
            .ok_or_else(|| anyhow!("game_id (payload[1]) missing from payload"))?;

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
