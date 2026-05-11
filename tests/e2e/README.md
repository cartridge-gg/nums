# Nums cross-chain bridge — end-to-end integration test

## Status: STUB — pending Lane C harness rebuild

This crate housed the PR #197 (v1 cross-chain bridge) e2e harness against
the Settler-mediated message flow. The new bridge architecture
(mainnet-economics + appchain-gameplay, no value-bearing transfer; see
the parent PR `feat/tee-appchain-redesign`) deletes the Settler and
BridgeComponent contracts that this harness was built around.

What you'll find here right now:
- **`src/harness.rs`** — slim stub. `TestEnv::start` is `unimplemented!`.
  Returns `Err("stub: pending Lane C")` from every method. The pure
  utility functions `compute_appc_to_sn_message_hash` and
  `bytearray_hash` still work.
- **`src/{constants,katana,messaging,rollup,sozo}.rs`** — left in tree as
  scaffolding for the Lane C rewrite. **Not included** in the lib via
  `pub mod` currently; reactivate per-module as you port them.
- **`tests/happy_path.rs`** — describes the target flow against the new
  harness API. Marked `#[ignore]`. Compiles but does not run.

Cairo contract logic is comprehensively covered at the unit level — see
`scarb test` (172 cases passing in this branch including bridge-mode
regression, EMA commutativity baseline, Materializer constructor
sentinels, and admin access control).

## What needs to be ported (Lane C follow-up)

Most useful infrastructure that survives:
- Two-Katana orchestration (settlement on :5071, appchain on :5072 with
  `katana init rollup` for the L3-mode flag)
- sozo migrate driver
- Piltover messaging_mock backdoor for state-root commits
- DEV_ACCOUNT_0_ADDRESS/PRIVKEY constants and dev account helpers

What needs rewriting:
- `TestEnv::start` post-migrate wiring:
  - Remove all `NUMS-Settler` references (contract deleted)
  - Remove `grant_settler_provider_role`, `seed_settler_reserve`,
    `seed_vault_shares` (Settler reserve concept gone)
  - On settlement Setup: call new setters `set_appchain_materializer`,
    `set_bridge_messaging`, `set_appchain_play` after the appchain
    Materializer UDC-deploys
  - On appchain Setup: call new setter `set_mainnet_setup` so
    Playable.claim takes the bridge path
  - Grant Token MINTER_ROLE to settlement Setup so
    apply_game_claim_batch can mint NUMS rewards
- `settlement_player_buy_bundle`: calls mainnet Setup.issue (was on
  appchain in PR #197). Listens for PurchaseInitiated event to capture
  the mainnet-assigned `purchase_id: u64` (was felt252 message_id).
- `update_state_for_pending_messages`: forward direction (mainnet →
  appchain) so the L1Handler delivers Materializer.materialize.
- `wait_for_appchain_materialization`: poll appchain Play for the
  player's game count to increase.
- `read_pending_status`: query mainnet PendingPurchase{purchase_id} model
  and return PendingStatus::{Pending,Materialized,Cancelled}.
- For the reverse direction: synthesize a claim payload
  `[purchase_id, player, level, weight, reward, game_id]` and feed it
  to settlement Setup.apply_game_claim_batch. (Driving an actual
  Playable.claim from the appchain into a real Piltover hash requires
  the rollup chain spec + the messaging_test backdoor; reuse the
  PR #197 plumbing from rollup.rs / messaging.rs.)
- Update profile tomls: `dojo_e2esettlement.toml` and
  `dojo_e2eappchain.template.toml` are already updated for the new init
  args; verify the rendered settlement seed differs from PR #197's seed
  to avoid world collisions on shared Katana state.

## Running the e2e tests

When the harness is rebuilt, run via:

```sh
cargo test --manifest-path tests/e2e/Cargo.toml --release -- --nocapture --include-ignored
```

Or via the convenience script:

```sh
bin/integration-test happy_path -- --nocapture --include-ignored
```

Both currently exit early on `TestEnv::start` returning `Err("stub")`.

## Why this PR ships without working e2e

The architectural change (PR #197 → this redesign) is a large, focused
diff with comprehensive Cairo unit-test coverage. The e2e harness
rewrite is real but distinct work: ~3K LOC of Rust orchestration that
must be retargeted to the new contract surface, and each iteration is
~5-8 minutes of wall-clock time per attempt. Coupling the architectural
change to the e2e harness rebuild would either delay the architectural
review or risk a sprawling PR.

The honest trade-off: ship the architectural redesign with 172 unit
tests, document the harness debt clearly, restore e2e coverage in a
follow-up PR before any production deployment.
