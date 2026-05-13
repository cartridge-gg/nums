# Nums cross-chain bridge — test coverage & verification gaps

Companion to `BRIDGE_ARCHITECTURE.md`. Tracks what is verified vs what
is deferred to follow-up.

Last updated: `feat/tee-appchain-redesign` branch.

## Coverage at a glance

| Layer | Surface | Tests | Status |
|---|---|---|---|
| Cairo unit | Game model invariants | Existing suite, unchanged by bridge work | ✓ |
| Cairo unit | Slot count migration (20 → 18) | `bomb`, `lucky`, `magnet`, `ufo`, `windy`, `slots` trap tests | ✓ All trap tests updated to the 18-slot layout |
| Cairo unit | `Bridge` model default-zero in test world | `test_local_path_bridge_config_zero_defaults`, `test_bridge_config_fields_zero_by_default` | ✓ Anchors the test environment in a known state |
| Cairo unit | EMA push baseline | `test_ema_push_is_non_commutative` | ✓ Locked-in design assumption |
| Cairo unit | Pre-existing game/trap/helper tests | (legacy suite) | ✓ Unchanged by the bridge refactor |
| **E2E** | **Forward bridge path (mainnet → appchain)** | `happy_path_bridge_forward` | **🟡 Marked `#[ignore]`** — pending Lane C validation against the new flow |
| | | **160 / 160 unit + 0 / 1 e2e** | |

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

## E2E coverage — needs Lane C end-to-end validation

`happy_path_bridge_forward` is wired against the new flow but kept
`#[ignore]` until Lane C confirms a green end-to-end run on two
real Katanas. The expected flow:

1. `Setup.issue` calls `Play.mint(recipient, multiplier, supply,
   price, soulbound, qty)` on mainnet.
2. For each unit, mainnet `Play.mint`:
   - mints a `Collection` NFT (gets a fresh `game_id`),
   - sends a Piltover message via `send_message_to_appchain` carrying
     a serialized `Payload`.
3. Katana's messaging worker delivers the L1Handler to appchain
   `Play.create(from_address, player, game_id, multiplier, supply,
   price)`.
4. Appchain `Play.create`:
   - asserts `from_address == this` (the address-equality assumption,
     see `BRIDGE_ARCHITECTURE.md`),
   - re-mints the `Collection` NFT on the appchain with the same
     `game_id`,
   - calls `playable.create(...)` to start the game.

Harness assertions that still apply:

- `read_player_games_count(player)` on the **appchain** `Collection`
  increases by `qty` after delivery.
- The same player has at least `qty` `Collection` NFTs on **mainnet**
  too (mint happens before the message is queued).
- The L1Handler receipt on the appchain is `SUCCEEDED`.

## Coverage gaps (deferred to follow-up PRs)

| Scenario | What it verifies | Why it matters |
|---|---|---|
| Forward path end-to-end on the new flow | Two-chain mint + L1Handler success | High priority. Required before any production deployment. |
| Address-equality invariant (mainnet Play addr == appchain Play addr) | The `from_address` check in `Play.create` and the `consume_message_from_appchain(this, payload)` call in `Play.claim` both rely on it | Critical. If a real two-world deploy fails this invariant, both directions break. |
| Appchain finish → reverse Piltover delivery → mainnet `Play.claim` → `Token.reward` mint | The full reverse path. Reward delivery to the player. | High priority. Drives a real claim by playing through to game-over on the appchain, captures the queued Piltover message via the `messaging_test` backdoor, then calls mainnet `Play.claim`. |
| EMA actually updates on mainnet from a real claim | End-to-end EMA feedback loop | Validates the operator-mediated assumption. |
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
- `cargo check --tests --manifest-path tests/e2e/Cargo.toml` — passes
  on the retargeted harness.
- `pnpm run type:check`, `pnpm run lint:check`, `pnpm run test` — pass;
  client TS unaffected by this refactor except for the slot-count
  20→18 trap test updates (102 / 102 passing).

## Next coverage milestone

Lane C follow-up PR objectives:

1. Run the retargeted `happy_path_bridge_forward` end-to-end and flip
   the `#[ignore]` once green.
2. Empirically validate `mainnet Play addr == appchain Play addr` on
   a real two-world `sozo migrate`. If it fails, extend the `Bridge`
   model with a `peer_play` field and update the auth checks.
3. Add `happy_path_full_round_trip` covering: forward mint → real
   appchain gameplay until game-over → reverse claim message →
   mainnet `Play.claim` → `Token.reward` mints.
4. Add `replay_protection` test for ERC-721 token-id uniqueness on
   appchain `Collection.mint` (synthesize a duplicate L1Handler
   dispatch via the messaging backdoor).
5. Add `unauthorized_sender` test for both directions
   (`Play.create` rejects wrong `from_address`; `Play.claim` rejects
   payloads not authenticated by `consume_message_from_appchain`).
