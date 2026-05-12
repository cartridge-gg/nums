//! Saya-TEE child-process management for the e2e harness.
//!
//! Spawns `saya-tee tee start --mock-prove ...`, captures its log to a
//! per-run file, and exposes a `Drop` impl that gracefully kills the
//! process on test teardown.
//!
//! ## Why TEE + mock-prove
//!
//! Real TEE mode would require AMD SEV-SNP hardware to generate
//! attestation reports. Our dev box doesn't have that, so we pass
//! `--mock-prove`, which synthesizes a stub `VerifierJournal` whose
//! `report_data` encodes the Poseidon commitment Piltover would
//! otherwise extract from a real attestation. To make the on-chain
//! verification accept the stub, the TEE registry that Saya queries
//! must be a permissive `piltover_mock_amd_tee_registry` — deployed
//! by the harness via `saya_ops::declare_and_deploy_tee_registry_mock`.
//!
//! Production deployments would (a) run Saya on real SEV-SNP hardware
//! and (b) point at the real TEE registry. The harness pattern is
//! e2e-test-only.

use std::path::PathBuf;
use std::process::Stdio;
use std::time::{Duration, Instant};

use anyhow::{Context, Result, anyhow, bail};
use starknet::core::types::Felt;
use tokio::process::{Child, Command};
use tracing::{info, warn};

/// A live `saya-tee tee start` child process.
pub struct SayaTeeProcess {
    pub label: &'static str,
    pub data_dir: tempfile::TempDir,
    child: Option<Child>,
}

/// Inputs needed to spawn `saya-tee tee start`. Mirrors the binary's
/// CLI surface (see `saya-tee tee start --help`).
pub struct SayaTeeArgs {
    pub rollup_rpc: String,
    pub settlement_rpc: String,
    pub settlement_piltover_address: Felt,
    pub settlement_account_address: Felt,
    pub settlement_account_private_key: Felt,
    pub tee_registry_address: Felt,
    pub prover_private_key: Felt,
    /// If `Some`, override the auto-built saya-tee binary path. Useful
    /// for testing a freshly-rebuilt Saya without copying it onto PATH.
    pub bin_override: Option<PathBuf>,
}

impl SayaTeeProcess {
    /// Default binary location: prefer `$SAYA_TEE_BIN`, then a local
    /// release build, then assume `saya-tee` is on PATH.
    fn binary() -> PathBuf {
        if let Ok(p) = std::env::var("SAYA_TEE_BIN") {
            return PathBuf::from(p);
        }
        let candidate = PathBuf::from(
            "/Users/kerry/Projects/dojoengine/saya/bin/persistent-tee/target/release/saya-tee",
        );
        if candidate.exists() {
            return candidate;
        }
        PathBuf::from("saya-tee")
    }

    /// Spawn `saya-tee tee start --mock-prove ...` with the supplied
    /// addresses and wait until the process appears to be running (no
    /// immediate exit).
    ///
    /// We don't probe a JSON-RPC endpoint because saya-tee doesn't
    /// expose one in its standard mode; instead we sleep briefly after
    /// spawn and call `try_wait` to confirm the process is still alive.
    /// Failure modes (binary missing, bad flags, etc.) surface in the
    /// log file tail in the bail message.
    pub async fn start(args: SayaTeeArgs) -> Result<Self> {
        let label = "saya-tee";
        let data_dir = tempfile::tempdir().context("create saya-tee data dir")?;
        let bin = args.bin_override.clone().unwrap_or_else(Self::binary);

        let db_dir = data_dir.path().join("saya-db");
        std::fs::create_dir_all(&db_dir).context("create saya-tee db dir")?;

        let mut cmd = Command::new(&bin);
        cmd.arg("tee").arg("start").arg("--mock-prove");
        cmd.arg("--rollup-rpc").arg(&args.rollup_rpc);
        cmd.arg("--settlement-rpc").arg(&args.settlement_rpc);
        cmd.arg("--settlement-piltover-address")
            .arg(format!("{:#x}", args.settlement_piltover_address));
        cmd.arg("--settlement-account-address")
            .arg(format!("{:#x}", args.settlement_account_address));
        cmd.arg("--settlement-account-private-key")
            .arg(format!("{:#x}", args.settlement_account_private_key));
        cmd.arg("--tee-registry-address")
            .arg(format!("{:#x}", args.tee_registry_address));
        cmd.arg("--prover-private-key")
            .arg(format!("{:#x}", args.prover_private_key));
        cmd.arg("--db-dir").arg(&db_dir);
        // Make batches small so e2e doesn't wait for `idle_timeout_secs`
        // to flush a partial batch — `batch_size=1` means every appchain
        // block triggers a TEE batch immediately.
        cmd.arg("--batch-size").arg("1");
        cmd.arg("--attestor-poll-interval-ms").arg("250");
        cmd.arg("--idle-timeout-secs").arg("5");

        let log_path = data_dir.path().join("saya-tee.log");
        let log_file = std::fs::File::create(&log_path).context("create saya-tee log file")?;
        let log_file_clone = log_file.try_clone().context("clone saya-tee log fd")?;
        cmd.env("RUST_LOG", "info,saya=debug,saya_tee=debug,saya_core=debug")
            .stdout(Stdio::from(log_file))
            .stderr(Stdio::from(log_file_clone))
            .kill_on_drop(true);

        info!(
            "Starting saya-tee ({label}) rollup={} settlement={}; log={}",
            args.rollup_rpc,
            args.settlement_rpc,
            log_path.display()
        );

        let child = cmd.spawn().with_context(|| {
            format!(
                "spawn saya-tee; is `{}` available? Override via SAYA_TEE_BIN env var.",
                bin.display()
            )
        })?;

        let mut proc = Self { label, data_dir, child: Some(child) };
        proc.wait_until_running().await?;
        Ok(proc)
    }

    /// Confirm Saya-tee is still running 2 seconds after spawn (i.e.
    /// it didn't immediately crash on a config error). Saya-tee does
    /// not expose a health endpoint, so this is the best heuristic
    /// short of grepping its log for a specific "ready" line.
    async fn wait_until_running(&mut self) -> Result<()> {
        tokio::time::sleep(Duration::from_secs(2)).await;
        if let Some(child) = self.child.as_mut() {
            if let Some(status) = child.try_wait().context("try_wait saya-tee")? {
                let log_path = self.data_dir.path().join("saya-tee.log");
                let tail = std::fs::read_to_string(&log_path)
                    .ok()
                    .map(|s| {
                        s.lines()
                            .rev()
                            .take(60)
                            .collect::<Vec<_>>()
                            .into_iter()
                            .rev()
                            .collect::<Vec<_>>()
                            .join("\n")
                    })
                    .unwrap_or_else(|| "(log unavailable)".to_string());
                bail!(
                    "saya-tee exited early with {:?}\nlog={}\ntail:\n{}",
                    status,
                    log_path.display(),
                    tail,
                );
            }
        }
        info!("saya-tee appears to be running");
        Ok(())
    }

    /// Block on the log until either `marker` is seen or `timeout`
    /// elapses. Useful for asserting Saya picked up a specific block
    /// from the appchain.
    pub async fn wait_for_log_marker(&self, marker: &str, timeout: Duration) -> Result<()> {
        let deadline = Instant::now() + timeout;
        let log_path = self.data_dir.path().join("saya-tee.log");
        loop {
            let content =
                std::fs::read_to_string(&log_path).unwrap_or_else(|_| String::new());
            if content.contains(marker) {
                return Ok(());
            }
            if Instant::now() > deadline {
                bail!(
                    "saya-tee log marker '{marker}' not seen within {}s; log={}",
                    timeout.as_secs(),
                    log_path.display(),
                );
            }
            tokio::time::sleep(Duration::from_millis(500)).await;
        }
    }
}

impl Drop for SayaTeeProcess {
    fn drop(&mut self) {
        if let Some(mut child) = self.child.take() {
            warn!("Killing saya-tee on drop");
            let _ = child.start_kill();
        }
        // Stash the log under /tmp before tempfile cleans the data dir.
        let log_src = self.data_dir.path().join("saya-tee.log");
        if log_src.exists() {
            let log_dst = std::env::temp_dir().join("nums_e2e_saya-tee.log");
            if let Err(e) = std::fs::copy(&log_src, &log_dst) {
                warn!("failed to stash saya-tee log to {}: {e}", log_dst.display());
            } else {
                warn!("Stashed saya-tee log → {}", log_dst.display());
            }
        }
    }
}

/// Convenience: dump the last N lines of the saya-tee log. Used in
/// diagnostic paths (e.g. when `wait_for_state_root_commit` times out).
pub fn tail_log(n: usize) -> Option<String> {
    let log_path = std::env::temp_dir().join("nums_e2e_saya-tee.log");
    let content = std::fs::read_to_string(&log_path).ok()?;
    Some(
        content
            .lines()
            .rev()
            .take(n)
            .collect::<Vec<_>>()
            .into_iter()
            .rev()
            .collect::<Vec<_>>()
            .join("\n"),
    )
}

// Helper to suppress dead_code warnings on the convenience exports
// while we wire them up incrementally.
#[allow(dead_code)]
fn _ensure_used() -> Option<String> {
    tail_log(0)
}
#[allow(dead_code)]
fn _anyhow_used() -> anyhow::Error {
    anyhow!("placeholder")
}
