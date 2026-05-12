# Contract deployment map — Nums cross-chain bridge

Companion to `BRIDGE_ARCHITECTURE.md`. Where each contract lives, what
it does on each chain, and which messages flow between them.

## Two-chain split

Each contract is registered as a Dojo resource on both chains' worlds
(Dojo worlds are monolithic, so the model schema must be uniform). The
table below shows where each one is **actively used** vs
**deployed-but-inert**.

| Contract | Mainnet (settlement) | Appchain (TEE gameplay) | Notes |
|---|---|---|---|
| **Setup** (`systems/setup.cairo`) | ✅ Active. `Setup.issue` is the player's entry point. Runs `purchase.execute` (swap + burn + vault.pay + team.transfer), then forwards to `Play.mint`. Owns the `Bridge` model setter (`set_bridge`). | ⚠️ Deployed-but-mostly-inert. Hosts the appchain `Bridge` and `Config` models. `Setup.issue` is never called here. | Same code on both chains. The `Bridge` model carries a single field, `address`, pointing at the Piltover messaging contract; non-zero is required (`BridgeTrait::new` asserts). |
| **Play** (`systems/play.cairo`) | ✅ Active. `Setup.issue` delegates to `Play.mint`, which queues the forward Piltover message via `send_message_to_appchain`. Also exposes `Play.claim(payload)` which consumes the reverse appchain message and pays the NUMS reward via `Playable.claim`. | ✅ Active. Owns the forward `#[l1_handler] create` that receives the Piltover message and starts the game via `playable.create`. Also hosts `Play.set` / `Play.select` / `Play.apply` for gameplay; the implicit reverse-message send is inside `Playable.finish`. | Symmetric on both chains. The forward `from_address` check and the reverse `consume_message_from_appchain(this, payload)` both rely on the **mainnet Play addr == appchain Play addr** invariant — see `BRIDGE_ARCHITECTURE.md`. |
| **Collection** (game NFT, `systems/collection.cairo`) | ✅ Active. `Play.mint` calls `Collection.new(player, soulbound=true)` to assign a fresh `game_id` and mint the NFT on mainnet. `Play.claim` later asserts ownership of the same `game_id` here before paying the reward. | ✅ Active. `Play.create` calls `Collection.mint(player, game_id, true)` to re-mint the NFT with the same id minted on mainnet. Players interact with these NFTs throughout gameplay. | Two-chain mint; same `game_id` on both. ERC-721 uniqueness is the forward replay guard. |
| **Token** (NUMS ERC-20, `systems/token.cairo`) | ✅ Active. The canonical NUMS. Burned by `purchase.execute`. Minted by `Play.claim` (via `Playable.claim → nums_disp.reward`) for per-game claim rewards. | ⚠️ Deployed-but-inert. Gameplay claims don't mint locally — they queue a reverse message that mints on mainnet. The local Token instance has its own supply but isn't read or written by bridge-mode gameplay. | The "NUMS lives on mainnet only" invariant is enforced functionally. |
| **Vault** (`systems/vault.cairo`) | ✅ Active. ERC-4626 over USDC; `vault.pay` distributes NUMS dividends from purchases. Player calls `vault.claim` here to redeem accrued NUMS. | ⚠️ Deployed-but-inert. `vault.pay` isn't called on appchain. | |
| **Treasury** (`systems/treasury.cairo`) | ✅ Active. Holds `DEFAULT_ADMIN_ROLE` on Setup, Vault, Token. Production role grants flow through Treasury timelock. | ✅ Active in mirror role. Same admin pattern, scoped to appchain world. | Per-chain admin. The two are independent. |
| **Faucet** (`systems/faucet.cairo`) | ⚠️ Test/dev only — mainnet uses real USDC. The e2e profile uses Faucet as a mock quote token. Production `dojo_mainnet.toml` skips it. | Test/dev only — same role. | Never deployed on real mainnet. |
| **Governor** (`systems/governor.cairo`) | Deployed but not actively exercised yet. | Same. | Reserved for future on-chain governance — not load-bearing for the bridge. |
| **VRF** mock (`mocks/vrf.cairo`) | Skipped on real mainnet (real VRF provider used). | Skipped likewise. | Test scaffold only. |

The standalone `Materializer` contract from the previous redesign was
removed — its role (forward L1Handler) is now served by `Play.create`
directly.

## Components (not standalone contracts)

Components are mixed into Setup or Play via Cairo's component macro.
They don't deploy independently.

| Component | Used by | Per-chain behavior |
|---|---|---|
| **Purchase** (`components/purchase.cairo`) | Setup | Active on mainnet (called inside `Setup.issue`). Inert on appchain. |
| **Playable** (`components/playable.cairo`) | Play | Active on appchain (gameplay: `create`, `set`, `select`, `apply`, `finish`). `finish` builds the reverse `Payload` and calls `send_message_to_l1_syscall`. Active on mainnet too — `Play.claim` calls `playable.claim(world, payload)` which contains the EMA push + `Token.reward` mint. |
| **Rewardable** (`components/rewardable.cairo`) | Vault | Active on mainnet (`vault.pay` calls into it). Inert on appchain. |

## Bridge message flow + which chain each contract participates in

```
Player on mainnet:
  └─> Setup.issue (Setup, Token, Vault, Treasury all on mainnet)
        ├─ purchase.execute → Ekubo swap, NUMS burn, Vault.pay, USDC.transfer to team
        └─> Play.mint(recipient, multiplier, supply, price, soulbound, qty)
              ├─ Collection.new(player, soulbound=true)   — mint NFT, get game_id
              └─ send_message_to_appchain( <mainnet Play>,
                                            selector!("create"),
                                            Payload{player, game_id, ..., 0, 0} )
                                                       │
                                                       ▼  (state-root commit, async)
                                          appchain Play.create (l1_handler)
                                              ├─ assert from_address == this (peer Play)
                                              ├─ Collection.mint(player, game_id, true)
                                              └─ playable.create(world, player, game_id, ...)

Player on appchain:
  └─> Play.set / Play.select / Play.apply (Play + Playable on appchain)
        └─ on game-over inside Playable.finish:
              └─ send_message_to_l1_syscall( <appchain Play>,
                                              Payload{player, game_id, ..., level, reward} )
                                                       │
                                                       ▼  (appchain state-root settles)
                                          mainnet Play.claim(payload)
                                              ├─ consume_message_from_appchain(this, payload)
                                              ├─ Collection.assert_is_owner(caller, payload.game_id)
                                              └─ playable.claim(world, payload)
                                                    ├─ config.push(level, weight, EMA_MIN_SCORE)
                                                    └─ Token.reward(payload.player, payload.reward)

Player on mainnet (later):
  └─> Vault.claim (Vault + Token on mainnet)
```

## Bridge config toggle summary

The bridge address lives in a dedicated `Bridge` model. A single
field carries the Piltover messaging contract used for both
directions:

| Field | Mainnet | Appchain |
|---|---|---|
| `address` | Mainnet Piltover messaging contract. Used by `Play.mint` (`send_message_to_appchain`) and by `Play.claim` (`consume_message_from_appchain`). | Appchain Piltover messaging contract. Reserved for future symmetric use; today the appchain side queues the reverse message via the native Cairo `send_message_to_l1_syscall`, so the appchain bridge address is only read for diagnostic purposes. |

Setters: `Setup.dojo_init` writes the bridge on deploy.
`Setup.set_bridge(bridge_messaging)` (admin-only) rotates the
messaging contract post-deploy. Both paths enforce a non-zero
address (`BridgeTrait::new` → `BridgeAssert::assert_is_valid`).

## Net new contracts compared to PR #197 and the prior redesign

|  | PR #197 | Previous redesign | Current architecture |
|---|---|---|---|
| Mainnet-only contracts added | `Settler` (554 LOC) | None — Setup grew ~180 LOC | None — Setup is leaner; `Play.mint`/`Play.claim` host the bridge logic. |
| Appchain-only contracts added | `Materializer` + `BridgeComponent` | `Materializer` only | None — `Materializer` removed; `Play.create` is the l1_handler directly. |
| New models | several | `PendingPurchase`, `PurchaseNonce`, `Bridge` (4 fields) | `Bridge` (1 field: `address`); `Payload` value type. `PendingPurchase`/`PurchaseNonce` removed. |
| Cross-chain messages | 2 bespoke layouts | 2 bespoke 6-felt layouts | 1 reusable `Payload` struct (Cairo `Serde`). |

## Cleanest interpretation

- **Mainnet is the economic chain.** Setup (the bridge orchestrator),
  Play (sender + receiver), Token, Vault, and Treasury are the
  load-bearing contracts. Per-game NUMS rewards mint here.
- **Appchain is the gameplay chain.** Play (l1_handler + gameplay)
  and Collection are load-bearing. No USDC, no real NUMS minting at
  game-claim time.
- **The shared-Dojo-world monolith** forces Token/Vault/Setup to be
  present on the appchain too, but they're functionally dead weight
  in bridge mode. The actual cross-chain wiring is just two thin
  Piltover messages plus a single config address on the `Bridge`
  model.

## Operational notes

- **Role grants per chain.** Treasury holds `DEFAULT_ADMIN_ROLE` on
  Setup, Vault, Token on each chain independently.
- **Reward minting authorization.** Mainnet `Play` already holds
  `MINTER_ROLE` on `Token` from the default deploy, which is enough
  for `Play.claim → Playable.claim → Token.reward` to work. No
  extra post-migration role grant is needed.
- **Identity invariant.** Player's controller address must match
  across both chains. Mainnet `Setup.issue → Play.mint` records
  `recipient`, which flows into the forward `Payload.player` (which
  becomes the appchain `Collection` owner via `Play.create`), then
  back to mainnet via the reverse `Payload.player`, then to mainnet
  `Token.reward`. If those diverge anywhere, rewards land in the
  wrong place. Cartridge controller infra is responsible for
  enforcing this.
- **Address-equality invariant.** The forward L1Handler authenticates
  the sender by comparing `from_address` against the appchain Play's
  own address (`starknet::get_contract_address()`), and the reverse
  mainnet `Play.claim` consumes the message with
  `consume_message_from_appchain(this, payload)`. Both rely on the
  **mainnet Play addr == appchain Play addr** assumption. If a real
  two-world deploy fails this, the `Bridge` model must be extended
  with a peer Play address and the auth checks must be updated to
  use it.
- **Why Setup is on the appchain at all.** Because Dojo worlds are
  monolithic — every model schema must have a writer somewhere in
  the world, and Setup is the natural owner of the `Config` and
  `Bridge` models. The `Setup.issue` entry point is never called on
  the appchain in bridge mode.
- **Why Token is on the appchain at all.** Same Dojo-world-monolith
  reason. In bridge mode the appchain Token's storage state is never
  read or written.
