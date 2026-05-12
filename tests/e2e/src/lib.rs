//! End-to-end integration tests for the Nums cross-chain bridge,
//! running against real Katana (settlement + appchain) AND real
//! `saya-tee` (the appchain prover/state-root submitter, running in
//! TEE mode with `--mock-prove`).
//!
//! The forward direction (mainnet `Setup.issue → Play.mint →
//! Play.create → playable.create`) runs as before. The reverse
//! direction (`playable.finish` → `send_message_to_l1_syscall` →
//! `saya-tee` state-root commit → mainnet `Play.claim`) is driven by
//! real gameplay (via `Play.set` loop until `game.over != 0`) and a
//! real Saya child process.
//!
//! See `tests/e2e/README.md` for prerequisites and known limitations.

pub mod constants;
pub mod harness;
pub mod katana;
pub mod messaging;
pub mod rollup;
pub mod saya;
pub mod saya_ops;
pub mod sozo;

pub use harness::{PendingStatus, PurchaseHandle, TestEnv};
