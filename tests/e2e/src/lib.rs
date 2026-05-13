//! End-to-end integration tests for the Nums cross-chain bridge.
//!
//! Spins up two Katana nodes (settlement + appchain), deploys the Piltover
//! `messaging_mock` (built with the `messaging_test` feature so we can
//! manually register Appchain→Starknet message hashes without running
//! saya-tee), wires Katana's `--messaging` polling so Settlement→Appchain
//! L1Handler delivery flows automatically, and then exercises the full
//! `Setup.issue → Play.mint → Play.create → playable.create` forward
//! loop. The reverse loop (`playable.claim → Play.claim → Token.reward`)
//! is described but not yet driven end-to-end (see README).
//!
//! See `tests/e2e/README.md` for prerequisites and known limitations.

pub mod constants;
pub mod harness;
pub mod katana;
pub mod messaging;
pub mod rollup;
pub mod sozo;

pub use harness::{PendingStatus, PurchaseHandle, TestEnv};
