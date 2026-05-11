//! Test harness for the Nums cross-chain bridge e2e tests.
//!
//! # Status: STUB — pending Lane C rewrite for the new architecture
//!
//! The harness from PR #197 was deeply coupled to the deleted Settler /
//! BridgeComponent contracts and to the Settler-mediated message flow. The
//! new architecture (mainnet-economics + appchain-gameplay, two thin
//! one-way Piltover messages) requires substantial rewiring of:
//!
//!   - TestEnv::start orchestration (no more Settler deploy / role grants /
//!     reserve seeding; instead, settlement and appchain Setup contracts
//!     get bridge config patched via the new setters
//!     set_appchain_materializer / set_bridge_messaging / set_appchain_play
//!     / set_mainnet_setup, plus MINTER_ROLE on Token granted to Setup so
//!     apply_game_claim_batch can mint).
//!   - Forward flow primitive: `settlement_player_buy_bundle` calls
//!     mainnet Setup.issue (was on appchain), captures purchase_id from
//!     the PurchaseInitiated event, and waits for the L1Handler delivery.
//!   - Reverse flow primitive: `apply_claim_batch` calls mainnet
//!     Setup.apply_game_claim_batch with synthetic or real claim payloads
//!     captured from the appchain's send_message_to_l1_syscall.
//!   - PendingStatus enum updated (Settled → Materialized).
//!   - PurchaseHandle carries u64 purchase_id (was felt252 message_id).
//!
//! The Cairo contract logic is comprehensively covered by scarb unit tests
//! (172 passing in this branch). End-to-end coverage via this harness is
//! tracked as a follow-up PR — see the parent feat/tee-appchain-redesign
//! PR description.
//!
//! The compiling stubs below preserve the public API surface that
//! `tests/happy_path.rs` references, so the test file compiles and is
//! marked `#[ignore]` until the harness is rebuilt.

use anyhow::{Result, anyhow};
use starknet::core::types::Felt;

/// What state a `PendingPurchase` is in. Mirrors the on-chain enum.
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

/// Handle to a purchase initiated on mainnet (settlement) Setup.issue in
/// bridge mode.
#[derive(Debug, Clone)]
pub struct PurchaseHandle {
    pub purchase_id: u64,
    pub payload: Vec<Felt>,
    pub bundle_id: u32,
    pub quantity: u32,
}

/// Test environment. Currently a stub pending Lane C harness rewrite.
pub struct TestEnv {}

impl TestEnv {
    pub async fn start() -> Result<Self> {
        Err(anyhow!(
            "TestEnv::start is not yet implemented for the new bridge \
             architecture. Tracking as Lane C follow-up to PR \
             feat/tee-appchain-redesign. The PR #197 harness was deeply \
             tied to deleted Settler/BridgeComponent contracts and needs \
             a full rewrite for the new mainnet-economics flow."
        ))
    }

    pub async fn assert_infrastructure_ready(&self) -> Result<()> {
        Err(anyhow!("stub: pending Lane C"))
    }

    pub fn dev_account_settlement(&self) -> Result<StubAccount> {
        Err(anyhow!("stub: pending Lane C"))
    }

    pub async fn read_purchase_nonce(&self) -> Result<u64> {
        Err(anyhow!("stub: pending Lane C"))
    }

    pub async fn read_player_games_count(&self, _player: Felt) -> Result<u64> {
        Err(anyhow!("stub: pending Lane C"))
    }

    pub async fn settlement_player_buy_bundle(
        &self,
        _player_addr: Felt,
        _bundle_id: u32,
        _quantity: u32,
    ) -> Result<PurchaseHandle> {
        Err(anyhow!("stub: pending Lane C"))
    }

    pub async fn update_state_for_pending_messages(
        &self,
        _purchase: &PurchaseHandle,
    ) -> Result<()> {
        Err(anyhow!("stub: pending Lane C"))
    }

    pub async fn wait_for_appchain_materialization(
        &self,
        _player: Felt,
        _expected_count: u64,
        _timeout_secs: u64,
    ) -> Result<()> {
        Err(anyhow!("stub: pending Lane C"))
    }

    pub async fn read_pending_status(&self, _purchase_id: u64) -> Result<PendingStatus> {
        Err(anyhow!("stub: pending Lane C"))
    }
}

/// Placeholder for an account-like type — the real TestEnv will hand back
/// a starknet-rs SingleOwnerAccount; this stub matches the signature so
/// happy_path.rs compiles.
pub struct StubAccount;

impl StubAccount {
    pub fn address(&self) -> Felt {
        Felt::ZERO
    }
}

// ---------------------------------------------------------------------
// Stable utility functions reused from PR #197 — these are pure helpers
// with no dependency on the deleted contract surface.
// ---------------------------------------------------------------------

/// Compute the Piltover Appchain→Starknet message hash:
///   poseidon(from_address, to_address, payload_len, payload...).
/// Matches `compute_message_hash_appc_to_sn` in
/// piltover/src/messaging/hash.cairo.
pub fn compute_appc_to_sn_message_hash(from: Felt, to: Felt, payload: &[Felt]) -> Felt {
    use starknet_crypto::poseidon_hash_many;
    let mut chunks: Vec<Felt> = Vec::with_capacity(3 + payload.len());
    chunks.push(from);
    chunks.push(to);
    chunks.push(Felt::from(payload.len() as u64));
    chunks.extend_from_slice(payload);
    poseidon_hash_many(&chunks)
}

/// Hash a Cairo ByteArray to a single felt. Mirrors what Dojo's
/// `bytearray_hash` would produce. Useful when reproducing event keys.
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
