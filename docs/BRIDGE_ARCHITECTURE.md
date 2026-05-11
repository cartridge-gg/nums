# Nums cross-chain bridge — architecture

## TL;DR

Nums on a TEE appchain, mainnet-economics + appchain-gameplay. Two thin,
value-free Piltover messages connect the chains:

- **Forward (mainnet → appchain):** when a player pays for a bundle on
  mainnet, the mainnet `Setup.issue` runs the existing inline economic
  flow (swap+burn+vault.pay+team.transfer), records a `PendingPurchase`,
  and queues a 6-felt game-mint message. The appchain `Materializer`
  L1Handler receives it and calls `Play.create` to mint the game(s).
- **Reverse (appchain → mainnet):** when a player completes and claims a
  game on the appchain, the appchain `Playable.claim` sends a 6-felt
  combined claim message (no local NUMS mint, no local EMA write).
  Mainnet `Setup.apply_game_claim_batch` consumes it, pushes the EMA,
  mints the per-game NUMS reward, and flips the PendingPurchase to
  Materialized.

No USDC bridge. No reserve. No swap reverts to recover from. The only
value at risk is the per-game NUMS reward if a reverse message is stuck
indefinitely (mitigated by operator monitoring; admin recovery path is
a documented follow-up).

## Sequence diagram

```mermaid
sequenceDiagram
    actor Player
    participant Setup_M as Setup (mainnet)
    participant Purchase as purchase.execute (mainnet)
    participant Ekubo
    participant NUMS_M as NUMS (mainnet)
    participant Vault_M as Vault (mainnet)
    participant Pilt_M as Piltover (mainnet)
    participant Pilt_A as Piltover (appchain)
    participant Mat as Materializer (appchain)
    participant Play_A as Play (appchain)

    Player->>Setup_M: issue(bundle_id, qty)
    Setup_M->>Purchase: execute(...)
    Purchase->>Ekubo: swap USDC->NUMS
    Purchase->>NUMS_M: burn(amount)
    Purchase->>Vault_M: pay(player, vault_amt)
    Purchase->>Setup_M: USDC.transfer(team, remainder)
    Note over Purchase: returns (multiplier, supply, price, qty)

    alt config.appchain_materializer != 0  (bridge mode)
        Setup_M->>Setup_M: PendingPurchase{purchase_id, Pending}
        Setup_M->>Pilt_M: send_message_to_appchain(Mat, MATERIALIZE_SELECTOR, payload[6])
        Note over Pilt_M,Pilt_A: state-root committed (async)
        Pilt_A->>Mat: l1_handler materialize(from_address, purchase_id, ...)
        Mat->>Mat: assert !processed_ids[purchase_id]; mark processed
        Mat->>Play_A: play.create(recipient, multiplier, 0, price, qty, purchase_id)
    else config.appchain_materializer == 0  (local mode)
        Setup_M->>Play_A: play.create(...) [pure Starknet, unchanged]
    end

    Note over Player,Play_A: gameplay on appchain
    Player->>Play_A: move(...) / select_power / ...

    Player->>Play_A: claim()
    Note over Play_A: NO local nums_disp.reward, NO local config.push
    Play_A->>Pilt_A: send_message_to_l1_syscall(mainnet_setup, claim_payload[6])
    Note over Pilt_A,Pilt_M: appchain state root settles

    Note over Player,Setup_M: anyone can drain the inbox (gas-bounded)
    Player->>Setup_M: apply_game_claim_batch([claim_payload, ...])
    Setup_M->>Setup_M: sort_by_purchase_id (deterministic EMA)
    Setup_M->>Pilt_M: consume_message_from_appchain(appchain_play, payload)
    Setup_M->>Setup_M: config.push(level, weight, EMA_MIN_SCORE)
    Setup_M->>NUMS_M: Token.reward(player, reward_amount)
    Setup_M->>Setup_M: PendingPurchase{purchase_id, Materialized}

    Note over Player,Vault_M: later, on mainnet (staking yield, unchanged)
    Player->>Vault_M: claim()
```

## Cross-chain message formats

### Forward: GameMint (mainnet → appchain)

Sent by `Setup.issue` in bridge mode. Selector: `selector!("materialize")`.

| Position | Type | Field | Notes |
|---|---|---|---|
| 0 | u64 | purchase_id | Monotonic per-Setup nonce; doubles as PendingPurchase key + Materializer replay key |
| 1 | felt252 | recipient | ContractAddress of player (identity invariant: same controller across chains) |
| 2 | u128 | multiplier | Pre-computed by `Rewarder::multiplier` using the current EMA |
| 3 | u128 | price.low | Bundle price snapshot (USDC, 6 decimals) |
| 4 | u128 | price.high | Always 0 in practice (USDC amounts fit in u128) |
| 5 | u32 | quantity | Number of games to mint |

6 felts total. `supply` is intentionally dropped (`Game.supply` is dead
data — audit confirmed no production reader except the constructor).

### Reverse: GameClaim (appchain → mainnet)

Sent by `Playable.claim` in bridge mode via raw
`starknet::send_message_to_l1_syscall`. Piltover has no send-side
dispatcher for this direction.

| Position | Type | Field | Notes |
|---|---|---|---|
| 0 | u64 | purchase_id | Carried through Game model from the forward payload |
| 1 | felt252 | player | Same address as the original `recipient` (identity invariant) |
| 2 | u32 | level | Final level reached, drives EMA |
| 3 | u16 | weight | `game.multiplier / MULTIPLIER_PRECISION`, drives EMA |
| 4 | u128 | reward_amount | NUMS to mint (computed locally via `Rewarder::amount`) |
| 5 | u64 | game_id | Appchain game id, forensic correlation only |

6 felts. One message per claim. `apply_game_claim_batch` accepts a
`Span<Span<felt252>>` and processes them in `purchase_id` order for
deterministic EMA application (see "EMA commutativity" below).

## Configuration

The `Config` model has 4 cross-chain fields. Per-deployment posture:

| Field | Mainnet | Appchain |
|---|---|---|
| `appchain_materializer` | Set to appchain Materializer address. Toggles bridge mode. | Unused (zero). |
| `bridge_messaging` | Set to mainnet Piltover messaging contract. Used by `send_message_to_appchain` AND `consume_message_from_appchain`. | Reserved; not read by current code. |
| `appchain_play` | Set to appchain Play contract address. Authorizes incoming claim messages. | Unused (zero). |
| `mainnet_setup` | Unused (zero). | Set to mainnet Setup address. Toggles bridge mode for `Playable.claim`. |

The `Setup.dojo_init` sentinel enforces all-zero OR all-set for the
three settlement-side fields (`appchain_materializer`,
`bridge_messaging`, `appchain_play`). This prevents partial misconfig.

`appchain_materializer != self_contract_address` is also enforced.

## Trust model

- **Mainnet contracts are the only source of economic truth.** All
  USDC, NUMS minting, vault state, team payouts originate there.
- **Appchain runs gameplay under TEE attestation for client trust.**
  Mainnet contracts do **not** verify attestation reports. The real
  security boundary is Piltover-authenticated appchain state, not TEE.
- **Operator (Cartridge) is trusted** to run the appchain honestly. A
  malicious operator could forge claim messages with cherry-picked
  `(level, weight, reward_amount)` to manipulate the EMA and over-mint
  NUMS. Mitigation is monitoring (alert on per-purchase reward
  exceeding expected ranges), not on-chain enforcement.
- **Cross-chain identity invariant.** A player's controller address
  must be the same on both chains. Mainnet `recipient` flows into
  appchain `play.create`, then back out as claim `player`, then into
  mainnet `Token.reward(player, ...)`. If those diverge, rewards land
  in the wrong place. Enforced by Cartridge controller infrastructure,
  not by contracts.

## Replay safety

### Forward direction (Materializer)

Piltover's L1Handler mailbox guarantees each (nonce, payload, hash)
delivers exactly once. But if a future `replay_pending(purchase_id)`
feature is added on mainnet, it would produce a NEW Piltover nonce for
the same logical purchase, defeating mailbox dedup.

Materializer therefore stores its own `Map<u64, bool> processed_ids`
keyed by **purchase_id** (not by Piltover message hash). First call
sets `processed_ids[pid] = true`; second call asserts unseen and
reverts. Replay-safe across any retry strategy.

### Reverse direction (apply_game_claim_batch)

Piltover's appchain→mainnet hash includes `(from_address, to_address,
payload)` with NO nonce — identical payloads share a hash. Piltover
handles this with ref-count semantics: `consume_message_from_appchain`
decrements the ref count, reverts when zero. Identical legitimate
claims (e.g., two players each ending at level 12 with weight 1) hash
to the same value but can be consumed N times until ref-count is
drained.

The settlement-side `PendingPurchase{purchase_id}.status` check
prevents the same logical purchase from being materialized twice on
mainnet. State machine enforces `Pending → Materialized` only.

## EMA commutativity

`config.push(score, weight, min_score)` is **NOT commutative**. The
math branches on whether `average_weigth` has reached `EMA_MAX_WEIGTH`,
and uses state-dependent weight clamping below the cap. Order of pushes
matters at the boundaries.

`apply_game_claim_batch` therefore sorts incoming payloads by
`purchase_id` (which is monotonic per-Setup) before applying. Any
caller can replicate the sort offline. Documented in
`test_ema_push_is_non_commutative`.

A secondary audit found `config.last_updated` is never mutated in
`config.push` — the time-guard `now < last_updated + EMA_MIN_TIME` is
effectively dead-code after deploy. Pushes in the same block all apply.
Not load-bearing for the batch design.

## Failure modes

| Path | Failure | Impact | Mitigation |
|---|---|---|---|
| Mainnet → Appchain (forward) | Piltover halts before delivery | Player paid, no game minted | PendingPurchase{Pending} recorded; admin recovery via future `replay_pending(purchase_id)` (`processed_ids` guard makes replay safe). |
| Forward delivery | Random contract sends to Materializer | L1Handler reverts on `from_address` check | Handled. |
| Forward delivery | Duplicate L1Handler dispatch | Would double-mint games | `processed_ids[purchase_id]` reverts second attempt. Handled. |
| Appchain → Mainnet (reverse) | Piltover halts after claim | Player claimed locally, reward not minted on mainnet | **Value at risk.** Operator-trusted recovery: admin can manually mint via Token.reward with off-chain proof of appchain claim event. Document as ops procedure. |
| Reverse batch | One bad payload reverts whole batch | Caller wasted gas, must retry without bad payload | Trust-model behavior: operator should never send malformed payloads. |
| Reverse batch | Same Piltover message consumed twice | Reverts naturally — Piltover ref_count decrements then errors at zero | Handled by Piltover. |
| Bridge mode misconfig (mixed zero/nonzero) | dojo_init sentinel asserts | Deploy fails fast | Handled. |
| Materializer self-reference | `appchain_materializer == self` | Sentinel asserts in dojo_init and setter | Handled. |
| Two-chain identity drift | Player controller differs across chains | Rewards land in wrong place | Out of contract scope — controller infra responsibility. |

## What changed from PR #197

| Aspect | PR #197 | This redesign |
|---|---|---|
| Direction of value transfer | Bidirectional (USDC bridge) | None — value stays on mainnet |
| Mainnet new contract | Settler (554 LOC) | none — Setup gets ~180 LOC of additions |
| Appchain new contract | BridgeComponent + Materializer + admin_settle | Materializer only (~100 LOC) |
| Reverse-direction state | Stateful (PendingPurchase tracked across) | One-shot claim message |
| Forward payload | 11 felts | 6 felts |
| Reverse payload | 7 felts | 6 felts |
| Failure modes with value-at-risk | Reserve drain, swap revert, consume-or-revert | One: stuck claim → unminted reward |
| Total new code | ~1,200 LOC | ~260 LOC |

The redesign trades a "real bridge" for two thin one-way messages: a
mint instruction forward, an EMA+reward instruction reverse. Per-game
NUMS rewards still happen at game-claim time; they just execute on
mainnet via cross-chain message instead of locally on the gameplay
chain.

## Out of scope for v1

- `replay_pending(purchase_id)` — admin-callable resend for stuck
  forward messages. Trivial to add given Materializer's replay guard;
  deferred until ops needs it.
- TEE attestation verification on mainnet.
- Per-batch cap on `apply_game_claim_batch`. Caller's gas budget is
  the natural cap.
- Admin escape hatch for stuck `PendingPurchase{Pending}` records.
- Drop the dead `Game.supply` field (Dojo schema migration).
- Payload versioning.
- E2E harness rebuild — tracked as Lane C follow-up.
