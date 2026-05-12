# Nums cross-chain bridge — end-to-end integration test

Real-Saya end-to-end harness for the bridge architecture described in
`docs/BRIDGE_ARCHITECTURE.md`. Spins up two Katanas (settlement +
appchain rollup), a real `saya-tee` child process, and runs the full
forward + reverse bridge loop. See `docs/SAYA_TEE_SETUP.md` for the
TEE / mock-prove rationale.

## What this covers

`tests/happy_path.rs::happy_path_full_saya_round_trip`:

1. **Forward** — mainnet `Setup.issue → purchase.execute → Play.mint`
   queues a Piltover message; Katana's messaging worker delivers it
   to appchain `Play.create` (L1Handler).
2. **Real gameplay** — player drives `Play.set(game_id, index)` on
   the appchain until `game.over != 0`.
3. **Real Saya commit** — `saya-tee --mock-prove` proves the appchain
   block and calls `update_state(...)` on the Piltover core.
4. **Reward mint** — player calls mainnet `Play.claim(payload)`:
   `consume_message_from_appchain` accepts the now-`ReadyToConsume`
   message, `Collection.assert_is_owner` enforces NFT ownership,
   `Playable.claim` mints NUMS + pushes the EMA.

## Prerequisites

Run once per environment:

```sh
bin/integration-test-setup
```

This builds (or verifies) `katana`, `sozo`, `saya-tee`, and
`saya-ops`. Override binary paths with env vars:

| Env var | Default |
|---|---|
| `KATANA_BIN` | `~/.cargo/bin/katana` |
| `SOZO_BIN` | `~/Projects/dojoengine/dojo/target/release/sozo` |
| `SAYA_TEE_BIN` | `~/Projects/dojoengine/saya/bin/persistent-tee/target/release/saya-tee` |
| `SAYA_OPS_BIN` | `~/Projects/dojoengine/saya/bin/ops/target/release/saya-ops` |

## Running

```sh
bin/integration-test happy_path_full_saya_round_trip
```

The harness picks ports `:5071` (settlement) and `:5072` (appchain),
both on `127.0.0.1`. Expected wall-clock on dev hardware:

- Forward half: 90–120 s (mostly the messaging worker poll cycle).
- Reverse half: 30–60 s (Saya batches the appchain block immediately
  with `--batch-size 1`; the rest is the gameplay loop and the
  state-root commit).

## Logs

The harness stashes child-process logs to `/tmp/`:

- `/tmp/nums_e2e_settlement_katana.log`
- `/tmp/nums_e2e_appchain_katana.log`
- `/tmp/nums_e2e_saya-tee.log` (only on Drop, i.e. test completion or
  panic)

Set `RUST_LOG=nums_e2e=debug,saya=debug` for verbose output.

## Crate layout

- `src/harness.rs` — `TestEnv` lifecycle + scenario primitives
  (`settlement_player_buy_bundle`, `play_until_finish`,
  `wait_for_state_root_commit`, `settlement_player_claim`).
- `src/katana.rs` — Katana child-process management.
- `src/saya.rs` — Saya-TEE child-process management.
- `src/saya_ops.rs` — `saya-ops` CLI wrappers (TEE registry mock
  deployment).
- `src/rollup.rs` — `katana init rollup` driver + chain spec
  parsing.
- `src/sozo.rs` — `sozo build` / `migrate` driver.
- `src/messaging.rs` — Piltover messaging helpers.

## When tests fail

Common failure modes and where to look:

| Symptom | Likely cause | Where to look |
|---|---|---|
| Forward materialization timeout | Katana messaging worker not picking up the SN→Appchain message | `/tmp/nums_e2e_settlement_katana.log` for `MessageSent`, `/tmp/nums_e2e_appchain_katana.log` for L1Handler delivery |
| `play_until_finish` runs out of attempts | VRF stuck, slot count constant changed, or `Play.set` access-control broken | grep appchain Katana log for `Play.set` reverts |
| `wait_for_state_root_commit` timeout | Saya not seeing the appchain block, or the TEE registry mock rejected the stub attestation | `/tmp/nums_e2e_saya-tee.log` tail (also auto-logged on timeout) |
| `Play.claim` revert with `INVALID_MESSAGE_TO_CONSUME` | Address-equality invariant broken (mainnet vs appchain Play addr differ) | `force_play_artifacts_match` either failed silently or the contracts changed |
