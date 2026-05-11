//! End-to-end integration tests for the Nums cross-chain bridge.
//!
//! Spins up two Katana nodes (settlement + appchain), deploys the Piltover
//! `messaging_mock` (built with the `messaging_test` feature so we can
//! manually register Appchain→Starknet message hashes without running
//! saya-tee), wires Katana's `--messaging` polling so Settlement→Appchain
//! L1Handler delivery flows automatically, and then exercises the full
//! Settler → Materializer → Setup loop.
//!
//! See `tests/e2e/README.md` for prerequisites and known limitations.

// Lane C STATUS: harness is currently stubbed — see harness.rs module docs.
// The sibling modules (katana, messaging, rollup, sozo) are PR #197-vintage
// infrastructure that still compiles but has dangling references to the
// deleted Settler/BridgeComponent surface inside their helper code. They
// remain in-tree as scaffolding for the Lane C rewrite. To reactivate the
// harness, restore TestEnv::start with the new bridge wiring and remove
// the stubs in harness.rs.

pub mod harness;

// Module exports kept in tree but unused until Lane C rebuild. Comment
// these out individually if you need to re-publish them for a partial
// migration.
// pub mod constants;
// pub mod katana;
// pub mod messaging;
// pub mod rollup;
// pub mod sozo;

pub use harness::{PendingStatus, PurchaseHandle, TestEnv};
