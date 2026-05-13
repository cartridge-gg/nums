//! Sozo CLI wrapper for migrating fresh Nums Dojo worlds onto the running
//! Katanas, plus a tiny manifest parser so the harness can discover the
//! addresses of the contracts sozo just deployed.
//!
//! The harness uses two profiles:
//!   * `e2eappchain`   — the appchain world (Setup, Play, Token, Vault, ...)
//!   * `e2esettlement` — the settlement world (everything plus Settler).
//!
//! Both profile tomls live at the repo root next to `dojo_mainnet.toml` and
//! are committed to source control alongside this crate.

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::process::Stdio;
use std::time::Duration;

use anyhow::{anyhow, bail, Context, Result};
use serde::Deserialize;
use starknet::core::types::Felt;
use tokio::process::Command;
use tracing::info;

/// Locate the `sozo` binary.
///
/// Resolution order:
///   1. `SOZO_BIN` env var
///   2. `sozo` on PATH
///   3. Hard-coded fallback to `~/Projects/dojoengine/dojo/target/release/sozo`
pub fn sozo_bin() -> PathBuf {
    if let Ok(p) = std::env::var("SOZO_BIN") {
        return PathBuf::from(p);
    }
    if let Ok(out) = std::process::Command::new("sh")
        .arg("-c")
        .arg("command -v sozo")
        .output()
    {
        if out.status.success() {
            let s = String::from_utf8_lossy(&out.stdout).trim().to_string();
            if !s.is_empty() {
                return PathBuf::from(s);
            }
        }
    }
    PathBuf::from("/Users/kerry/Projects/dojoengine/dojo/target/release/sozo")
}

pub async fn assert_sozo_runnable() -> Result<()> {
    let bin = sozo_bin();
    let out = Command::new(&bin)
        .arg("--version")
        .output()
        .await
        .with_context(|| format!("run {} --version", bin.display()))?;
    if !out.status.success() {
        bail!(
            "sozo --version failed: stderr={}",
            String::from_utf8_lossy(&out.stderr)
        );
    }
    info!("sozo: {}", String::from_utf8_lossy(&out.stdout).trim());
    Ok(())
}

/// Run `sozo --profile <profile> build`. Required ahead of `migrate` since
/// migrate does not auto-build.
pub async fn build(repo_root: &Path, profile: &str) -> Result<()> {
    let bin = sozo_bin();
    let mut build_cmd = Command::new(&bin);
    build_cmd
        .current_dir(repo_root)
        .arg("--profile")
        .arg(profile)
        .arg("build")
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    info!("Running sozo build (profile={profile}) in {}", repo_root.display());
    let out = tokio::time::timeout(Duration::from_secs(600), build_cmd.output())
        .await
        .context("sozo build timed out after 10m")?
        .context("spawn sozo build")?;
    if !out.status.success() {
        return Err(anyhow!(
            "sozo build failed: status={}\nstdout:\n{}\nstderr:\n{}",
            out.status,
            String::from_utf8_lossy(&out.stdout),
            String::from_utf8_lossy(&out.stderr),
        ));
    }
    Ok(())
}

/// Run `sozo --profile <profile> migrate` from the supplied repo root. Captures
/// stdout/stderr; on failure, surfaces both. The profile must exist in
/// `Scarb.toml` and have a corresponding `dojo_<profile>.toml` next to it.
/// Caller is responsible for `build`-ing the profile first.
pub async fn migrate(repo_root: &Path, profile: &str) -> Result<()> {
    let bin = sozo_bin();
    let mut cmd = Command::new(&bin);
    cmd.current_dir(repo_root)
        .arg("--profile")
        .arg(profile)
        .arg("migrate")
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    info!(
        "Running sozo migrate (profile={profile}) in {}",
        repo_root.display()
    );
    let out = tokio::time::timeout(Duration::from_secs(600), cmd.output())
        .await
        .context("sozo migrate timed out after 10m")?
        .context("spawn sozo")?;

    let stdout = String::from_utf8_lossy(&out.stdout);
    let stderr = String::from_utf8_lossy(&out.stderr);
    if !out.status.success() {
        return Err(anyhow!(
            "sozo migrate failed: status={}\nstdout:\n{}\nstderr:\n{}",
            out.status,
            stdout,
            stderr,
        ));
    }
    info!("sozo migrate ok ({profile})");
    if std::env::var("RUST_LOG").map(|v| v.contains("debug")).unwrap_or(false) {
        info!("sozo stdout:\n{stdout}");
    }
    Ok(())
}

/// Parsed contents of the manifest sozo writes to
/// `<repo_root>/manifest_<profile>.json`.
#[derive(Debug, Clone)]
pub struct DeployedWorld {
    pub world_address: Felt,
    /// Contract address keyed by `tag` (e.g. `"NUMS-Setup"`).
    pub contracts: HashMap<String, Felt>,
}

impl DeployedWorld {
    pub fn contract(&self, tag: &str) -> Result<Felt> {
        self.contracts
            .get(tag)
            .copied()
            .ok_or_else(|| anyhow!("contract `{tag}` not found in manifest (have: {:?})", self.contracts.keys().collect::<Vec<_>>()))
    }
}

#[derive(Deserialize, Debug)]
struct RawManifest {
    world: RawWorld,
    contracts: Vec<RawContract>,
}

#[derive(Deserialize, Debug)]
struct RawWorld {
    address: String,
}

#[derive(Deserialize, Debug)]
struct RawContract {
    tag: String,
    address: String,
}

/// Read and parse `<repo_root>/manifest_<profile>.json`.
pub fn read_manifest(repo_root: &Path, profile: &str) -> Result<DeployedWorld> {
    let path = repo_root.join(format!("manifest_{profile}.json"));
    let bytes = std::fs::read(&path)
        .with_context(|| format!("read manifest at {}", path.display()))?;
    let raw: RawManifest = serde_json::from_slice(&bytes)
        .with_context(|| format!("parse manifest at {}", path.display()))?;

    let world_address = parse_felt(&raw.world.address)
        .with_context(|| format!("parse world.address `{}`", raw.world.address))?;
    let mut contracts = HashMap::new();
    for c in raw.contracts {
        let addr = parse_felt(&c.address)
            .with_context(|| format!("parse {}.address `{}`", c.tag, c.address))?;
        contracts.insert(c.tag, addr);
    }
    Ok(DeployedWorld {
        world_address,
        contracts,
    })
}

fn parse_felt(s: &str) -> Result<Felt> {
    Felt::from_hex(s).map_err(|e| anyhow!("hex parse: {e}"))
}
