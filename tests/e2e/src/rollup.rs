//! Helpers for spinning the appchain Katana up as a `ChainSpec::Rollup`.
//!
//! Why we go through this trouble:
//!
//! On a `--dev` Katana, `is_l3` is always `false` and Cairo's blockifier
//! enforces an `EthAddress` (160-bit) check on the recipient passed to
//! `send_message_to_l1_syscall`. Settler and other Dojo contracts have full
//! 251-bit Starknet addresses, which fails that check at runtime. Switching
//! the appchain to a Rollup chain spec flips `is_l3 = true` (see
//! `katana_node_sequencer::lib.rs::launch`), which removes the check.
//!
//! The cost is that Rollup mode requires a pre-deployed Piltover Appchain
//! contract on the settlement layer (used both as the messaging core and
//! as the proof-fact root). The standard prebuilt Appchain class shipped
//! with Katana was compiled WITHOUT the `messaging_test` feature flag, so
//! the `add_messages_hashes_from_appchain` back-door isn't available — and
//! we need that to inject pending messages without running the full
//! SP1/SNOS prover.
//!
//! The workaround:
//!
//!   1. `katana init rollup --output-path <dir>` deploys the standard
//!      Appchain class on settlement and writes `<dir>/config.toml` and
//!      `<dir>/genesis.json`. The contract is deployed by — and so owned
//!      by — the settlement account we pass on the CLI (our dev account).
//!
//!   2. Read the deployed `core_contract` address out of `config.toml`.
//!
//!   3. Declare a freshly-rebuilt Appchain class on settlement, this time
//!      with `--features messaging_test` so the test back-door is present.
//!      The artifact lives at
//!      `tests/e2e/artifacts/appchain_with_test.contract_class.json` and
//!      is staged by `bin/integration-test-setup`.
//!
//!   4. Call `Appchain.upgrade(<new_class_hash>)` from the dev account
//!      (the owner). Storage is preserved (OZ upgradeable component just
//!      swaps the class hash). The upgraded contract retains its existing
//!      `program_info` / `fact_registry` / messaging state, so Katana's
//!      startup validation still passes — and now exposes
//!      `add_messages_hashes_from_appchain`.
//!
//!   5. Start the appchain Katana with `--chain <dir>`. Katana derives its
//!      messaging config from `config.toml` (no `--messaging` arg needed),
//!      and the per-startup `validate_starknet_settlement` call to
//!      `get_program_info` succeeds — preserved across the upgrade.

use std::path::{Path, PathBuf};
use std::process::Stdio;
use std::sync::Arc;
use std::time::Duration;

use anyhow::{anyhow, bail, Context, Result};
use serde::Deserialize;
use serde_json::Value;
use starknet::accounts::{Account, ConnectedAccount, SingleOwnerAccount};
use starknet::core::types::contract::{CompiledClass, SierraClass};
use starknet::core::types::{BlockId, BlockTag, Call, Felt, FunctionCall};
use starknet::macros::selector;
use starknet::providers::jsonrpc::HttpTransport;
use starknet::providers::{JsonRpcClient, Provider};
use starknet::signers::LocalWallet;
use tokio::process::Command;
use tracing::info;

use crate::messaging::wait_for_tx_success;

/// Account credentials baked into the rollup `genesis.json` after running
/// `katana init rollup`. Exactly one allocation is created per init by
/// default, so this is the sole pre-funded account on the appchain.
#[derive(Debug, Clone)]
pub struct GenesisAccount {
    pub address: Felt,
    pub public_key: Felt,
    pub private_key: Felt,
    pub class_hash: Felt,
}

/// Output of `katana init rollup`.
#[derive(Debug, Clone)]
pub struct RollupInitOutcome {
    /// The directory passed via `--output-path`.
    pub config_dir: PathBuf,
    /// `[settlement.starknet].core_contract` from the generated config.toml.
    pub core_contract: Felt,
    /// `[settlement.starknet].block` from the generated config.toml.
    pub deployed_block: u64,
    /// The single pre-funded account from genesis.json.
    pub appchain_account: GenesisAccount,
}

/// Locate the `katana` binary, mirroring `KatanaNode::binary` resolution.
fn katana_bin() -> PathBuf {
    if let Ok(p) = std::env::var("KATANA_BIN") {
        return PathBuf::from(p);
    }
    PathBuf::from("katana")
}

/// Run `katana init rollup ...` against the supplied settlement RPC URL,
/// writing the generated chain config to `output_dir`. Returns the parsed
/// outcome.
///
/// The settlement layer must already be reachable at `settlement_rpc_url`,
/// and the supplied account must hold enough STRK to cover the deployment
/// transactions (declare + deploy + 2 inits ≈ negligible on `--dev` Katana).
///
/// `facts_registry` is written into the deployed Appchain via
/// `set_facts_registry(...)` and re-read at appchain Katana startup. Use a
/// non-zero placeholder; the value isn't load-bearing for this test
/// because settle-side never invokes `update_state(...)` (we use the
/// `messaging_test` back-door instead).
pub async fn init_rollup(
    chain_id_ascii: &str,
    settlement_rpc_url: &str,
    settlement_account_address: Felt,
    settlement_account_private_key: Felt,
    facts_registry: Felt,
    output_dir: &Path,
) -> Result<RollupInitOutcome> {
    let bin = katana_bin();
    let mut cmd = Command::new(&bin);
    cmd.arg("init")
        .arg("rollup")
        .arg("--id")
        .arg(chain_id_ascii)
        .arg("--settlement-chain")
        .arg(settlement_rpc_url)
        .arg("--settlement-account-address")
        .arg(format!("0x{:x}", settlement_account_address))
        .arg("--settlement-account-private-key")
        .arg(format!("0x{:x}", settlement_account_private_key))
        .arg("--settlement-facts-registry")
        .arg(format!("0x{:x}", facts_registry))
        .arg("--output-path")
        .arg(output_dir);

    cmd.stdout(Stdio::piped()).stderr(Stdio::piped());

    info!(
        "Running `katana init rollup` (settlement={settlement_rpc_url}, output={})",
        output_dir.display()
    );

    let out = tokio::time::timeout(Duration::from_secs(120), cmd.output())
        .await
        .context("`katana init rollup` timed out after 120s")?
        .context("spawn katana init rollup")?;

    if !out.status.success() {
        return Err(anyhow!(
            "`katana init rollup` failed: status={}\nstdout:\n{}\nstderr:\n{}",
            out.status,
            String::from_utf8_lossy(&out.stdout),
            String::from_utf8_lossy(&out.stderr),
        ));
    }

    let config_path = output_dir.join("config.toml");
    let genesis_path = output_dir.join("genesis.json");

    if !config_path.exists() {
        bail!("expected {} to exist after init", config_path.display());
    }
    if !genesis_path.exists() {
        bail!("expected {} to exist after init", genesis_path.display());
    }

    let (core_contract, deployed_block) = parse_config_toml(&config_path)?;
    let appchain_account = parse_genesis_account(&genesis_path)?;

    info!(
        "katana init rollup done: core_contract={core_contract:#x}, deployed_block={deployed_block}, \
         appchain_account={addr:#x}",
        addr = appchain_account.address,
    );

    Ok(RollupInitOutcome {
        config_dir: output_dir.to_path_buf(),
        core_contract,
        deployed_block,
        appchain_account,
    })
}

#[derive(Deserialize, Debug)]
struct ConfigToml {
    settlement: SettlementSection,
}

#[derive(Deserialize, Debug)]
struct SettlementSection {
    starknet: StarknetSettlement,
}

#[derive(Deserialize, Debug)]
struct StarknetSettlement {
    core_contract: String,
    block: u64,
}

fn parse_config_toml(path: &Path) -> Result<(Felt, u64)> {
    let text = std::fs::read_to_string(path).with_context(|| format!("read {}", path.display()))?;
    let cfg: ConfigToml = toml::from_str(&text)
        .with_context(|| format!("parse {} as TOML", path.display()))?;
    let core =
        Felt::from_hex(&cfg.settlement.starknet.core_contract).map_err(|e| anyhow!("hex: {e}"))?;
    Ok((core, cfg.settlement.starknet.block))
}

fn parse_genesis_account(path: &Path) -> Result<GenesisAccount> {
    let bytes = std::fs::read(path).with_context(|| format!("read {}", path.display()))?;
    let v: Value =
        serde_json::from_slice(&bytes).with_context(|| format!("parse {} as JSON", path.display()))?;
    let accounts = v
        .get("accounts")
        .and_then(Value::as_object)
        .ok_or_else(|| anyhow!("no accounts object in {}", path.display()))?;
    if accounts.is_empty() {
        bail!("no accounts in {}", path.display());
    }
    // Pick the first (and typically only) account.
    let (addr_str, info) = accounts.iter().next().unwrap();
    let address = Felt::from_hex(addr_str).map_err(|e| anyhow!("parse account addr: {e}"))?;
    let public_key = Felt::from_hex(
        info.get("publicKey")
            .and_then(Value::as_str)
            .ok_or_else(|| anyhow!("no publicKey for {addr_str}"))?,
    )
    .map_err(|e| anyhow!("parse publicKey: {e}"))?;
    let private_key = Felt::from_hex(
        info.get("privateKey")
            .and_then(Value::as_str)
            .ok_or_else(|| anyhow!("no privateKey for {addr_str}"))?,
    )
    .map_err(|e| anyhow!("parse privateKey: {e}"))?;
    let class_hash = Felt::from_hex(
        info.get("class")
            .and_then(Value::as_str)
            .ok_or_else(|| anyhow!("no class for {addr_str}"))?,
    )
    .map_err(|e| anyhow!("parse class: {e}"))?;

    Ok(GenesisAccount {
        address,
        public_key,
        private_key,
        class_hash,
    })
}

/// Declare the `appchain_with_test` (Piltover Appchain rebuilt with the
/// `messaging_test` feature) class, then call `Appchain.upgrade(...)` to
/// hot-swap the implementation at the deployed `core_contract` address.
///
/// `account` must be the Piltover Appchain owner (the settlement account
/// we passed to `katana init rollup`). After this call returns, the
/// `add_messages_hashes_from_appchain` back-door is callable on
/// `core_contract`.
pub async fn upgrade_appchain_to_test_class(
    account: &SingleOwnerAccount<JsonRpcClient<HttpTransport>, LocalWallet>,
    artifact_path: &Path,
    core_contract: Felt,
) -> Result<Felt> {
    let class_bytes =
        std::fs::read(artifact_path).with_context(|| format!("read {}", artifact_path.display()))?;
    let sierra: SierraClass = serde_json::from_slice(&class_bytes)
        .with_context(|| format!("parse sierra at {}", artifact_path.display()))?;
    let new_class_hash = sierra.class_hash().context("compute class hash")?;
    let flat = sierra.flatten().context("flatten sierra")?;

    let casm_path = artifact_path
        .to_string_lossy()
        .replace(".contract_class.json", ".compiled_contract_class.json");
    let casm_bytes = std::fs::read(&casm_path).with_context(|| format!("read {casm_path}"))?;
    let casm: CompiledClass = serde_json::from_slice(&casm_bytes).context("parse casm")?;
    let compiled_class_hash = casm.class_hash().context("compute compiled class hash")?;

    info!("appchain_with_test class hash: {new_class_hash:#x}");

    // Declare (idempotent — class may already be declared in a re-run).
    match account
        .declare_v3(Arc::new(flat), compiled_class_hash)
        .gas_estimate_multiplier(2.0)
        .send()
        .await
    {
        Ok(decl) => {
            wait_for_tx_success(account.provider(), decl.transaction_hash).await?;
            info!("Declared appchain_with_test class {new_class_hash:#x}");
        }
        Err(e) => {
            let s = format!("{e:?}");
            if s.contains("ClassAlreadyDeclared") || s.contains("is already declared") {
                info!("appchain_with_test class already declared, continuing");
            } else {
                return Err(anyhow!("declare appchain_with_test: {e}"));
            }
        }
    }

    // Upgrade the Piltover Appchain at `core_contract` to the new class.
    // OZ upgradeable just swaps the class hash; storage layout is preserved
    // because the new contract has the same storage struct layout (only
    // the impl block gates differ).
    let call = Call {
        to: core_contract,
        selector: selector!("upgrade"),
        calldata: vec![new_class_hash],
    };
    let tx = account
        .execute_v3(vec![call])
        .gas_estimate_multiplier(2.0)
        .send()
        .await
        .context("Appchain.upgrade")?;
    wait_for_tx_success(account.provider(), tx.transaction_hash).await?;
    info!("Upgraded core_contract={core_contract:#x} to messaging_test class");

    Ok(new_class_hash)
}

/// Confirm `add_messages_hashes_from_appchain` is callable on the upgraded
/// Appchain. Calls with an empty array — a no-op whether the entrypoint
/// exists or not, but `ENTRYPOINT_NOT_FOUND` would surface for a non-test
/// build. (Mirrors the equivalent assertion for `messaging_mock`.)
pub async fn assert_test_backdoor_present(
    provider: &JsonRpcClient<HttpTransport>,
    core_contract: Felt,
) -> Result<()> {
    let res = provider
        .call(
            FunctionCall {
                contract_address: core_contract,
                entry_point_selector: selector!("add_messages_hashes_from_appchain"),
                calldata: vec![Felt::ZERO],
            },
            BlockId::Tag(BlockTag::PreConfirmed),
        )
        .await;
    match res {
        Ok(_) => Ok(()),
        Err(e) => {
            let s = format!("{e:?}");
            if s.contains("ENTRYPOINT_NOT_FOUND") || s.contains("not found in contract") {
                Err(anyhow!(
                    "core_contract is missing `add_messages_hashes_from_appchain` after upgrade — \
                     the appchain_with_test artifact may be stale. Underlying error: {s}"
                ))
            } else {
                // Other errors (e.g. simulated state mutation) imply the entrypoint exists.
                Ok(())
            }
        }
    }
}

/// Render the appchain dojo profile TOML at the supplied path with the
/// supplied account credentials substituted in.
///
/// We can't ship a static `dojo_e2eappchain.toml` because the rollup's
/// pre-funded account address is generated at runtime by `katana init
/// rollup`. The template lives at `dojo_e2eappchain.template.toml` and
/// uses `{ACCOUNT_ADDRESS}` / `{PRIVATE_KEY}` placeholders.
#[allow(dead_code)]
pub fn write_appchain_profile_toml(
    repo_root: &Path,
    template_filename: &str,
    out_filename: &str,
    account: &GenesisAccount,
) -> Result<()> {
    let template_path = repo_root.join(template_filename);
    let template = std::fs::read_to_string(&template_path)
        .with_context(|| format!("read {}", template_path.display()))?;
    let rendered = template
        .replace("{ACCOUNT_ADDRESS}", &format!("0x{:x}", account.address))
        .replace("{PRIVATE_KEY}", &format!("0x{:x}", account.private_key));
    let out_path = repo_root.join(out_filename);
    std::fs::write(&out_path, rendered)
        .with_context(|| format!("write {}", out_path.display()))?;
    info!("Wrote {} (account={addr:#x})", out_path.display(), addr = account.address);
    Ok(())
}

