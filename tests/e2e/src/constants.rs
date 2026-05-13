//! Shared constants for the e2e harness.
//!
//! The settlement layer forks from Cartridge mainnet at `latest` (no pinned
//! block) so we always exercise the real, current-state mainnet contracts —
//! Ekubo router, USDC, NUMS Token, Vault, Treasury. Pinning a block had
//! reliability issues with the Cartridge RPC's storage-proof window for
//! deeper blocks; forking at tip works because storage is still hot.
//!
//! Set `NUMS_E2E_NO_FORK=1` to fall back to a vanilla (non-forked)
//! settlement Katana for harness-only smoke testing.

use starknet::core::types::Felt;
use starknet::macros::{felt, selector};

/// Cartridge mainnet RPC endpoint (Starknet JSON-RPC v0.9).
pub const CARTRIDGE_MAINNET_RPC: &str = "https://api.cartridge.gg/x/starknet/mainnet/rpc/v0_9";

// -----------------------------------------------------------------------------
// Mainnet contract addresses (read from `dojo_mainnet.toml` and `manifest_mainnet.json`).
// These remain valid in the forked settlement Katana because the fork preserves
// the entire forked state.
// -----------------------------------------------------------------------------

/// World contract for the Nums Dojo world on mainnet. Settler, Setup, Vault,
/// Token, Treasury, Play, Collection are all registered under this world.
pub const MAINNET_WORLD_ADDRESS: Felt =
    felt!("0x1c26a4ee3ef91d19e768afcacae51ea5240b2e9a7f861249dcc19af6cc038f2");

pub const MAINNET_TREASURY: Felt =
    felt!("0x328ee468c320fe73f02a2646e6fc1e351cdda33a86774a54846f79c1ed989e");
pub const MAINNET_VAULT: Felt =
    felt!("0x6622cf22b64731ed444dbb07f4041268c503fa9573649571bfdfabe90c6ec2");
pub const MAINNET_NUMS_TOKEN: Felt =
    felt!("0x2e82800f97afded96e8e88f9788f2d8f097edb04c9e9b920ceb1ec11f265158");
pub const MAINNET_SETUP: Felt =
    felt!("0x1a8516498b484f209aefbbf5af67765a2b1e3889fd00902811f18576a4616b0");
pub const MAINNET_PLAY: Felt =
    felt!("0x575bd762ac42b1386a8da0d07f646ac631786eab359f3f39f1b53208208ab9c");
pub const MAINNET_COLLECTION: Felt =
    felt!("0x282964e6c06a435fbf6ddf5a63bf4dc65d2ab879b30d320cf4d95543053aab5");

/// Mainnet USDC (canonical Starknet USDC bridge contract).
pub const MAINNET_USDC: Felt =
    felt!("0x033068F6539f8e6e6b131e6B2B814e6c34A5224bC66947c47DaB9dFeE93b35fb");

/// Mainnet Ekubo router/clearer (single contract, two interfaces).
pub const MAINNET_EKUBO_ROUTER: Felt =
    felt!("0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066");

/// Mainnet team address — receives the residual USDC after burn + vault.pay.
pub const MAINNET_TEAM_ADDRESS: Felt =
    felt!("0x03F7F4E5a23A712787F0C100f02934c4A88606B7F0C880c2FD43e817E6275d83");

/// HTTP-RPC port for the settlement Katana.
pub const SETTLEMENT_PORT: u16 = 5071;

/// HTTP-RPC port for the appchain Katana.
pub const APPCHAIN_PORT: u16 = 5072;

/// Chain id used for the appchain Katana (parsed as ASCII).
pub const APPCHAIN_CHAIN_ID_STR: &str = "NUMS_APPCHAIN";

/// Chain id used for the settlement Katana (parsed as ASCII). Distinct from
/// the appchain so signed transactions don't get replayed across nodes.
pub const SETTLEMENT_CHAIN_ID_STR: &str = "NUMS_SETTLE";

/// Materialize selector for the reverse Settlement→Appchain message.
/// Mirrors `crate::constants::MATERIALIZE_SELECTOR` in the Cairo code.
pub fn materialize_selector() -> Felt {
    selector!("materialize")
}

/// Cancellation delay (seconds) for Piltover messaging mock's
/// `Starknet→Appchain` direction. Doesn't affect the Appchain→Settlement
/// direction we exercise, but the constructor requires a value.
pub const PILTOVER_CANCELLATION_DELAY_SECS: u64 = 432_000;

/// Predeployed Katana dev account #0 — derived from
/// `--dev.seed 0` (the default). These are the deterministic values Katana
/// emits via `dev_predeployedAccounts`. Keeping them as constants avoids
/// having to query the node every time.
///
/// NOTE: if Katana ever changes its dev-genesis derivation these constants
/// will break. Re-derive by running:
///   `katana --dev --silent --http.port <PORT>` then
///   `curl ... method=dev_predeployedAccounts`.
pub const DEV_ACCOUNT_0_ADDRESS: Felt =
    felt!("0x127fd5f1fe78a71f8bcd1fec63e3fe2f0486b6ecd5c86a0466c3a21fa5cfcec");
pub const DEV_ACCOUNT_0_PRIVKEY: Felt =
    felt!("0xc5b2fcab997346f3ea1c00b002ecf6f382c5f9c9659a3894eb783c5320f912");
pub const DEV_ACCOUNT_1_ADDRESS: Felt =
    felt!("0x13d9ee239f33fea4f8785b9e3870ade909e20a9599ae7cd62c1c292b73af1b7");
pub const DEV_ACCOUNT_1_PRIVKEY: Felt =
    felt!("0x1c9053c053edf324aec366a34c6901b1095b07af69495bffec7d7fe21effb1b");
