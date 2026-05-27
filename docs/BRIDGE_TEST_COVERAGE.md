# Nums cross-chain bridge — test coverage & verification gaps

Companion to `BRIDGE_ARCHITECTURE.md`. Tracks what is verified vs what
is deferred to follow-up.

Last updated: `feat/tee-appchain-saya` branch (stacked on
`feat/tee-appchain-redesign`).

## Coverage at a glance

| Layer | Surface | Tests | Status |
|---|---|---|---|
| Cairo unit | Game model invariants | Existing suite, unchanged by bridge work | ✓ |
| Cairo unit | Slot count migration (20 → 18) | `bomb`, `lucky`, `magnet`, `ufo`, `windy`, `slots` trap tests | ✓ All trap tests updated to the 18-slot layout |
| Cairo unit | `Bridge` model default-zero in test world | `test_local_path_bridge_config_zero_defaults`, `test_bridge_config_fields_zero_by_default` | ✓ Anchors the test environment in a known state |
| Cairo unit | EMA push baseline | `test_ema_push_is_non_commutative` | ✓ Locked-in design assumption |
| Cairo unit | Pre-existing game/trap/helper tests | (legacy suite) | ✓ Unchanged by the bridge refactor |
| | | **160 / 160 unit** | |

## What the refactor changed

The previous design used a standalone `Materializer` contract on the
appchain as the L1Handler endpoint, plus `Setup.apply_game_claim_batch`
on mainnet for the reverse direction. The current design collapses
this into two `Play` endpoints:

- forward: `Play.create` `#[l1_handler]` on the appchain `Play`
  contract directly,
- reverse: `Play.claim(payload)` on mainnet `Play` (consumes the
  appchain message and mints the reward inline via `Playable.claim`).

The `Materializer` contract, its tests, the `PendingPurchase` /
`PurchaseNonce` models, and the bridge events
(`e_PurchaseInitiated`, `e_GameClaimApplied`) were removed. The
`Bridge` model was simplified to a single `address` field (the
Piltover messaging contract used for both directions).

## Coverage gaps (deferred to follow-up PRs)

| Scenario | What it verifies | Why it matters |
|---|---|---|
| Real TEE attestation | Production setup runs `saya-tee` on AMD SEV-SNP hardware with the real Piltover TEE registry, not the `--mock-prove` + mock-registry shortcut | Required before mainnet ship. The e2e here proves the plumbing; the cryptography is upstream's responsibility. |
| Duplicate forward delivery | ERC-721 token-id uniqueness on appchain `Collection.mint` reverts a second `create` for the same `game_id` | Replay defense (no explicit `processed_ids` map anymore). |
| Forward auth (wrong `from_address`) | Appchain `Play.create` reverts with `'Play: invalid sender'` | Cairo unit tests can't drive L1Handler entries; only e2e can. |
| Reverse auth (wrong sender) | Mainnet `Play.claim` reverts via `consume_message_from_appchain` mismatch | Same — e2e only. |
| Mainnet `Play.claim` ownership check | `Collection.assert_is_owner` reverts when the caller is not the current owner of `payload.game_id` | Locked-in defense against reward redirection. |
| Identity invariant (controller address consistency) | Mainnet `recipient` == appchain `Play` owner == reverse `Payload.player` == mainnet `Token.reward` recipient | Controller infra responsibility, but worth e2e proof. |
| Bridge misconfig (zero messaging address at `dojo_init`) | `BridgeTrait::new` reverts deploy | Locked-in by the `assert_is_valid` check. |

## Known limitations carried over

### Operator-trusted EMA / reward integrity

Mainnet contracts don't verify the appchain's TEE attestation. A
malicious operator (or compromised TEE) could fabricate claim
messages to manipulate the EMA or over-mint NUMS rewards. Mitigation
is monitoring (alert on per-purchase reward exceeding expected
ranges), not on-chain enforcement.

### Stuck reverse messages

If Piltover halts after `Playable.finish` queues the reverse message
but before mainnet `Play.claim` is callable, the player has already
finished the game locally on the appchain. The reverse message that
mints their NUMS reward on mainnet is queued in Piltover's
appchain→mainnet messages array, but won't deliver until Piltover
resumes.

Worst case: the reward is owed but unminted indefinitely. Documented
as ops procedure: admin can manually mint via `Token.reward` with
off-chain proof of the appchain finish event.

### Identity divergence

If a player uses different controller addresses on mainnet vs
appchain, the forward `Payload.player` ≠ appchain `Play` owner ≠
reverse `Payload.player`. The contracts have no defense — the
appchain mints the NFT to whatever `player` address the forward
payload carries, and the mainnet `Play.claim` mints the reward to
whatever `payload.player` carries. Controller infra is responsible
for enforcing identity parity across chains.

## What's been deleted from earlier gap lists

The following gaps from PR #197 and the previous redesigns are
obsolete:

- ~~Ekubo swap+burn verification (forked NUMS/USDC pool)~~ — bridge
  no longer touches Ekubo.
- ~~Settler reserve management~~ — no reserve, no Settler.
- ~~Vault PROVIDER_ROLE grant to Settler~~ — Settler doesn't exist.
- ~~USDC bridge holding contract setup~~ — no value bridge.
- ~~`admin_settle` escape hatch verification~~ — no stuck-message
  escape hatch in v1.
- ~~`apply_game_claim_batch` batch sort + per-batch cap~~ — replaced
  by one-shot `Play.claim`.
- ~~`Materializer.processed_ids` replay guard~~ — replaced by
  ERC-721 token-id uniqueness in `Collection.mint`.
- ~~`PendingPurchase`/`PurchaseNonce` state machine~~ — removed
  entirely; the mainnet `Collection` NFT ownership is the source of
  truth.

## Standard pre-merge checks

- `sozo build` — clean (two pre-existing warnings on `treasury.cairo`'s
  `__validate__`/`__execute__` ABI generation; unrelated to bridge
  work).
- `sozo test` — 160 passed.
- `scarb fmt --check` — clean.
- `pnpm run type:check`, `pnpm run lint:check`, `pnpm run test` — pass;
  client TS unaffected by this refactor except for the slot-count
  20→18 trap test updates (102 / 102 passing).

## Next coverage milestone

Follow-up PR objectives (not in this stack):

1. Run `happy_path_full_saya_round_trip` against real AMD SEV-SNP
   hardware (drop `--mock-prove` and the mock TEE registry).
2. Add `replay_protection` test for ERC-721 token-id uniqueness on
   appchain `Collection.mint` (synthesize a duplicate L1Handler
   dispatch via Katana's messaging backdoor).
3. Add `unauthorized_sender` test for both directions
   (`Play.create` rejects wrong `from_address`; `Play.claim` rejects
   payloads not authenticated by `consume_message_from_appchain`).
4. Add `identity_divergence` test demonstrating the failure mode when
   mainnet and appchain controller addresses diverge for the same
   player.
