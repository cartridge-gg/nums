# Nums cross-chain bridge — test coverage & verification gaps

Companion to `BRIDGE_ARCHITECTURE.md`. This doc tracks what's actually
verified vs what's deferred to follow-up.

Last updated: `feat/tee-appchain-redesign` branch.

## Coverage at a glance

| Layer | Surface | Tests | Status |
|---|---|---|---|
| Cairo unit | Setup local-path (regression) | `test_setup_local_path` | ✓ Bit-identical preservation |
| Cairo unit | Setup bridge-path branch trigger | `test_local_path_bridge_config_zero_defaults` | ✓ |
| Cairo unit | PurchaseNonce monotonicity | `test_purchase_nonce_strict_monotonic_across_many_calls` | ✓ |
| Cairo unit | PendingPurchase state machine | `test_pending_purchase_pending_to_materialized`, `test_pending_purchase_distinct_keys_independent`, `test_pending_purchase_round_trip` | ✓ |
| Cairo unit | EMA commutativity baseline | `test_ema_push_is_non_commutative` | ✓ (sort-by-purchase_id is load-bearing) |
| Cairo unit | Materializer constructor sentinels | `test_constructor_rejects_zero_mainnet_setup`, `test_constructor_rejects_zero_play` | ✓ |
| Cairo unit | Materializer admin access control | `test_admin_can_set_mainnet_setup`, `test_non_admin_cannot_set_mainnet_setup`, `test_admin_can_set_play`, `test_non_admin_cannot_set_play` | ✓ |
| Cairo unit | Pre-existing game/trap/helper tests | (160 cases from existing suite) | ✓ unchanged by bridge work |
| **E2E** | **Forward bridge path (mainnet → appchain)** | `happy_path_bridge_forward` | **✓ Green** (~10 min wall-clock against real two-Katana stack) |
| | | **172 / 172 unit + 1 / 1 e2e passing** | |

## E2E coverage — forward path GREEN

`happy_path_bridge_forward` exercises against two real Katana nodes:

1. Spawn settlement Katana (`--dev`) + appchain Katana (rollup chain spec
   via `katana init rollup`).
2. UDC-deploy Piltover Appchain core, upgrade to `messaging_test` class.
3. sozo migrate both worlds in parallel (~5 min wall-clock).
4. UDC-deploy Materializer with (mainnet_setup, play) on appchain.
5. Wire bridge config via setters on both Setup contracts.
6. Grant Token MINTER_ROLE to settlement Setup; grant Play CREATOR_ROLE
   to appchain Materializer.
7. Seed settlement Vault with NUMS shares.
8. **Player calls settlement Setup.issue → purchase_id assigned →
   PurchaseInitiated event → MessageSent event captured from Piltover
   messaging mock.**
9. **Katana messaging worker auto-delivers the L1Handler →
   Materializer.materialize → Play.create.**
10. **Assertion: appchain Collection.balance_of(player) == 1.**

Total wall-clock: ~10 min per iteration.

## Coverage gaps (still deferred to follow-up PRs)

The reverse direction (appchain claim → mainnet) is unit-tested but not
end-to-end. The following scenarios are unverified e2e:

| Scenario | What it verifies | Why it matters |
|---|---|---|
| Appchain claim → reverse Piltover delivery → mainnet apply_game_claim_batch → Token.reward mint | The full reverse path. Reward delivery to player. | High priority. Adding actually requires the `messaging_test` backdoor on the reverse direction (the harness has this scaffolding but the test scenario must drive `Play.claim` after real gameplay). |
| EMA actually updates on mainnet from real claim | End-to-end EMA feedback loop | Validates the only non-locked-in design assumption (operator-mediated). |
| PendingPurchase{Pending → Materialized} state transition end-to-end | State machine on real Dojo storage | Today only verified via direct store writes in unit test. |
| Materializer replay (same purchase_id delivered twice) | `processed_ids` guard fires | Locked-in defense-in-depth that's worth empirically validating. |
| Materializer auth (wrong from_address) | `'Invalid sender'` revert path | Cairo unit tests can't drive L1Handler entries; only e2e can. |
| Identity invariant (controller address consistency) | Mainnet recipient == appchain Play owner == claim player == mint recipient | Controller infra responsibility, but worth e2e proof. |
| Bridge mode misconfig (mixed zero/nonzero) at dojo_init | Sentinel reverts deploy | Currently verified only at the model layer. |
| MINTER_ROLE grant to Setup post-migration | Cross-chain mint authorization | Operational migration concern; ops should script this. |

## Known limitations carried over

### Operator-trusted EMA / reward integrity

Mainnet contracts don't verify the appchain's TEE attestation. A
malicious operator (or compromised TEE) could fabricate claim messages
to manipulate the EMA or over-mint NUMS rewards. Mitigation is
monitoring (alert on per-purchase reward exceeding expected ranges),
not on-chain enforcement.

Tracked in plan; explicit user-locked decision during eng review.

### Stuck reverse messages

If Piltover halts after an appchain claim succeeds, the player has
already collected their game-claim locally on the appchain. The reverse
message that mints their NUMS reward on mainnet is queued in Piltover's
appchain→starknet messages array, but won't deliver until Piltover
resumes.

Worst case: the reward is owed but unminted indefinitely. Documented as
ops procedure: admin can manually mint via Token.reward with off-chain
proof of the appchain claim event.

### Identity divergence

If a player uses different controller addresses on mainnet vs appchain,
the forward `recipient` ≠ appchain `play` owner ≠ claim `player`. The
contracts have no defense — rewards land at whatever address the claim
payload carries. Controller infra is responsible for enforcing identity
parity across chains.

## What's been deleted from PR #197's gap list

The following gaps from PR #197 are obsolete in the new architecture:

- ~~Ekubo swap+burn verification (forked NUMS/USDC pool)~~ — bridge no longer touches Ekubo.
- ~~Settler reserve management~~ — no reserve.
- ~~Vault PROVIDER_ROLE grant to Settler~~ — Settler doesn't exist.
- ~~USDC bridge holding contract setup~~ — no value bridge.
- ~~admin_settle escape hatch verification~~ — no stuck-message escape hatch in v1.

## Standard pre-merge checks

- `scarb build` — clean
- `scarb test` — 172 passed
- `scarb fmt --check` — TODO before merge
- `cargo check --tests --manifest-path tests/e2e/Cargo.toml` — passes (stubs compile)
- `pnpm run type:check`, `pnpm run lint:check` — to run; client TS unaffected by this PR

## Next coverage milestone

Lane C follow-up PR objectives:
1. Rebuild `tests/e2e/src/harness.rs` against the new contract surface
2. Restore `happy_path_bridge_forward` to running and passing
3. Add `happy_path_full_round_trip` covering claim → mainnet mint
4. Add `replay_protection` test for Materializer's `processed_ids`
5. Add `unauthorized_sender` test for both directions
