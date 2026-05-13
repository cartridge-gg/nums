# Nums cross-chain bridge — end-to-end integration test

## Status: harness compiles against the new flow, e2e test still `#[ignore]`

This crate hosts the e2e harness for the bridge architecture described
in `docs/BRIDGE_ARCHITECTURE.md`. The harness has been retargeted for
the current flow (no standalone `Materializer` contract, single-field
`Bridge` model, `Payload` Serde layout, mainnet `Play.mint` /
mainnet `Play.claim` as the bridge entry points), but
`happy_path_bridge_forward` is kept `#[ignore]` until the next Lane C
iteration confirms the end-to-end run is green on real Katanas.

What you'll find here right now:
- **`src/harness.rs`** — full `TestEnv::start` implementation against
  the new flow: spins up two Katanas, migrates both worlds with
  placeholder bridge address (`0x1`), patches both Setups with
  `Setup.set_bridge(<messaging_mock>)`, seeds the settlement Vault
  with NUMS shares. No `Materializer` deploy step, no extra role
  grants needed (default `dojo_init` grants are sufficient).
  `PendingStatus` / `read_pending_status` / `read_purchase_nonce`
  are kept as legacy no-op shims for source-compatibility.
- **`src/{constants,katana,messaging,rollup,sozo}.rs`** — supporting
  scaffolding (Katana orchestration, sozo driver, Piltover messaging
  helpers). Largely unchanged from the previous architecture.
- **`tests/happy_path.rs`** — describes the target flow against the
  retargeted harness API. Marked `#[ignore]` pending Lane C
  end-to-end validation.

Cairo contract logic is comprehensively covered at the unit level —
see `sozo test` (160 cases passing on this branch, including the
`Bridge`-default-zero baseline and the EMA-commutativity baseline).

## What this PR ports

Forward direction (mainnet → appchain) is wired against the new flow:
- `TestEnv::start` no longer UDC-deploys a standalone `Materializer`
  contract — the forward L1Handler is `Play.create` on the appchain
  `Play` contract directly.
- `wire_cross_chain_addresses` calls `Setup.set_bridge(<messaging_mock>)`
  on both Setups (the `Bridge` model has a single `address` field).
- `grant_materializer_creator_role` and `grant_setup_minter_role`
  are removed: the new flow uses access control already configured
  by `dojo_init`.
- `settlement_player_buy_bundle` extracts `game_id` (the second felt
  of the serialized `Payload`) as the legacy
  `PurchaseHandle.purchase_id` for backwards-compatible test code.

Forward direction delivery is unchanged from the previous design:
Katana's messaging worker automatically dispatches the L1Handler on
the appchain when the rollup chain spec is wired correctly. Tests
poll `Collection.balance_of(player)` on the appchain to observe the
materialization.

## What still needs work for the next Lane C iteration

- **Run the test end-to-end.** Confirm the L1Handler dispatch on the
  appchain succeeds. The bridge config baseline tests already pass
  at the Cairo unit level, but the on-chain delivery against real
  Katanas has not been re-verified in this branch.
- **Validate the address-equality invariant.** The forward
  `from_address` check (`Play.create`) and the reverse
  `consume_message_from_appchain(this, payload)` call (`Play.claim`)
  both depend on `mainnet Play addr == appchain Play addr`. If a
  real two-world deploy fails this invariant, the harness needs to
  carry the peer Play address explicitly and the on-chain checks
  need to be updated accordingly (see `docs/BRIDGE_ARCHITECTURE.md`
  follow-ups).
- **Reverse direction coverage.** Drive a real claim by playing
  through to game-over on the appchain via
  `Play.set`/`select`/`apply`. This requires VRF setup and is the
  most expensive part of the harness rewrite. When `Playable.finish`
  queues a Piltover message, capture it via the `messaging_test`
  backdoor, then call mainnet `Play.claim(payload)` and assert
  `Token.balance_of(player)` increased by the expected reward
  amount.

## Running the e2e tests

When the harness rebuild is validated end-to-end, run via:

```sh
cargo test --manifest-path tests/e2e/Cargo.toml --release -- --nocapture --include-ignored
```

Or via the convenience script:

```sh
bin/integration-test happy_path -- --nocapture --include-ignored
```

`happy_path_bridge_forward` is currently marked `#[ignore]` to keep
CI green; flip the `#[ignore]` and confirm the test passes once the
real two-world deploy has been validated.
