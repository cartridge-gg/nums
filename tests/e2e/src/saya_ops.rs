//! Wrappers around the `saya-ops` CLI for the e2e harness.
//!
//! `saya-ops core-contract declare-and-deploy-tee-registry-mock` deploys
//! a permissive `piltover_mock_amd_tee_registry` on the settlement chain
//! so `saya-tee --mock-prove` can pass attestation verification.
//!
//! `saya-ops` outputs structured JSON to stdout when `--output json` is
//! passed (human log lines go to stderr), so we parse stdout to extract
//! the deployed contract address.

use std::path::PathBuf;
use std::process::Stdio;

use anyhow::{Context, Result, anyhow, bail};
use serde_json::Value;
use starknet::core::types::Felt;
use tokio::process::Command;
use tracing::info;

/// Default binary location: prefer `$SAYA_OPS_BIN`, then a local release
/// build, then assume `saya-ops` is on PATH.
fn binary() -> PathBuf {
    if let Ok(p) = std::env::var("SAYA_OPS_BIN") {
        return PathBuf::from(p);
    }
    let candidate = PathBuf::from(
        "/Users/kerry/Projects/dojoengine/saya/bin/ops/target/release/saya-ops",
    );
    if candidate.exists() {
        return candidate;
    }
    PathBuf::from("saya-ops")
}

/// Common settlement-account args for every `saya-ops core-contract`
/// invocation.
pub struct SettlementCreds {
    pub rpc_url: String,
    pub account_address: Felt,
    pub private_key: Felt,
    pub chain_id: String,
}

/// Declare + deploy the `piltover_mock_amd_tee_registry` on settlement.
///
/// Returns the deployed mock-registry address. The Saya TEE flow passes
/// this address to `saya-tee tee start --tee-registry-address`.
///
/// `salt` is the CREATE2-style salt used by UDC for deployment; pick
/// something deterministic per test run so the address is stable across
/// reruns (helpful for log diffing).
pub async fn declare_and_deploy_tee_registry_mock(
    creds: &SettlementCreds,
    salt: Felt,
) -> Result<Felt> {
    let bin = binary();
    let mut cmd = Command::new(&bin);
    cmd.arg("core-contract")
        .arg("--private-key")
        .arg(format!("{:#x}", creds.private_key))
        .arg("--account-address")
        .arg(format!("{:#x}", creds.account_address))
        .arg("--settlement-rpc-url")
        .arg(&creds.rpc_url)
        .arg("--settlement-chain-id")
        .arg(&creds.chain_id)
        .arg("--output")
        .arg("json")
        .arg("declare-and-deploy-tee-registry-mock")
        .arg("--salt")
        .arg(format!("{:#x}", salt));
    cmd.stdout(Stdio::piped()).stderr(Stdio::piped());

    info!(
        "saya-ops declare-and-deploy-tee-registry-mock (settlement_rpc={}, salt={:#x})",
        creds.rpc_url, salt,
    );

    let output = cmd
        .output()
        .await
        .with_context(|| format!("spawn {}; SAYA_OPS_BIN to override", bin.display()))?;

    if !output.status.success() {
        bail!(
            "saya-ops tee-registry-mock failed (exit={:?})\nstdout:\n{}\nstderr:\n{}",
            output.status,
            String::from_utf8_lossy(&output.stdout),
            String::from_utf8_lossy(&output.stderr),
        );
    }

    let stdout = String::from_utf8(output.stdout).context("saya-ops stdout not utf-8")?;
    parse_deployed_address(&stdout)
        .with_context(|| format!("parse saya-ops JSON; full stdout:\n{stdout}"))
}

/// Look for a `contract_address` field in the saya-ops JSON output.
fn parse_deployed_address(stdout: &str) -> Result<Felt> {
    // saya-ops may emit multiple JSON objects (one per phase). Try each
    // line; return the first one that carries a contract_address.
    for line in stdout.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() || !trimmed.starts_with('{') {
            continue;
        }
        let v: Value = match serde_json::from_str(trimmed) {
            Ok(v) => v,
            Err(_) => continue,
        };
        if let Some(addr_str) = v.get("contract_address").and_then(|x| x.as_str()) {
            return Felt::from_hex(addr_str).map_err(|e| {
                anyhow!("contract_address {addr_str:?} is not a valid felt: {e}")
            });
        }
    }
    Err(anyhow!(
        "no `contract_address` field found in saya-ops stdout",
    ))
}
