# Contract deployment map — Nums cross-chain bridge

Companion to `BRIDGE_ARCHITECTURE.md`. Where each contract lives, what it
does on each chain, and which messages flow between them.

## Two-chain split

Each contract is registered as a Dojo resource on both chains' worlds
(Dojo worlds are monolithic, so the model schema must be uniform). The
table below shows where each one is **actively used** vs
**deployed-but-inert** in bridge mode.

| Contract | Mainnet (settlement) | Appchain (TEE gameplay) | Notes |
|---|---|---|---|
| **Setup** (`systems/setup.cairo`) | ✅ Active. `Setup.issue` is the player's entry point. Runs `purchase.execute` (swap + burn + vault.pay + team.transfer), records `PendingPurchase{Pending}`, queues forward Piltover message. Also hosts `apply_game_claim_batch` (consumes reverse claim messages and mints NUMS rewards). | ⚠️ Deployed-but-mostly-inert. Only `Playable.claim` reads `config.mainnet_setup` to take the bridge path. `Setup.issue` is never called here. | Same code, both chains. Bridge mode is toggled by `config.appchain_materializer != 0` on mainnet and `config.mainnet_setup != 0` on appchain. |
| **Play** (`systems/play.cairo`) | ⚠️ Deployed-but-inert in bridge mode. In pure-Starknet mode (`appchain_materializer == 0`), `Setup.issue` calls `play.create` locally. | ✅ Active. The Materializer calls `play.create` after a forward message arrives. Players call `play.move`/`set`/`apply`/`claim` here. | |
| **Materializer** (`systems/materializer.cairo`) | ❌ NOT deployed on mainnet. Has no purpose there. | ✅ Active. Plain Starknet contract (not Dojo), UDC-deployed post-migration. `#[l1_handler] materialize` receives forward messages and calls `Play.create`. Owns `processed_ids` replay guard keyed by `purchase_id`. | Bridge-only contract. Only on appchain. |
| **Token** (NUMS ERC20, `systems/token.cairo`) | ✅ Active. The canonical NUMS. Burned by `purchase.execute`. Minted by `apply_game_claim_batch` via `Token.reward(player, amount)` for per-game claims. | ⚠️ Deployed-but-inert in bridge mode. In bridge mode, gameplay claims don't mint locally — they send a reverse message. The local Token instance has its own supply but isn't read or written by bridge-mode gameplay. | The "NUMS lives on mainnet only" invariant from the plan is enforced functionally, even though the model is deployed on both Dojo worlds. |
| **Vault** (`systems/vault.cairo`) | ✅ Active. ERC-4626 over USDC; `vault.pay` distributes NUMS dividends from purchases. Player calls `vault.claim` here to redeem accrued NUMS. | ⚠️ Deployed-but-inert. `vault.pay` isn't called on appchain in bridge mode (purchase happens on mainnet). | |
| **Collection** (game NFT, `systems/collection.cairo`) | ⚠️ Deployed-but-inert in bridge mode (no `Play.create` runs here). | ✅ Active. ERC-721 — each game minted to `recipient` is an NFT. `read_player_games_count` in the harness queries this. | |
| **Treasury** (`systems/treasury.cairo`) | ✅ Active. Holds `DEFAULT_ADMIN_ROLE` on Setup, Vault, Token. Production role grants flow through Treasury timelock. | ✅ Active in mirror role. Same admin pattern, scoped to appchain world. | Per-chain admin. The two are independent. |
| **Faucet** (`systems/faucet.cairo`) | ⚠️ Test/dev only — mainnet uses real USDC. The e2e profile uses Faucet as a mock quote token. Production `dojo_mainnet.toml` skips it. | Test/dev only — same role. | Never deployed on real mainnet. |
| **Governor** (`systems/governor.cairo`) | Deployed but not actively exercised yet. | Same. | Reserved for future on-chain governance — not load-bearing for the bridge. |
| **VRF** mock (`mocks/vrf.cairo`) | Skipped on real mainnet (real VRF provider used). | Skipped likewise. | Test scaffold only. |

## Components (not standalone contracts)

Components are mixed into Setup or Play via Cairo's component macro.
They don't deploy independently.

| Component | Used by | Per-chain behavior |
|---|---|---|
| **Purchase** (`components/purchase.cairo`) | Setup | Active on mainnet (called inside `Setup.issue`). Inert on appchain — `Setup.issue` isn't called there in bridge mode. |
| **Playable** (`components/playable.cairo`) | Play | Active on appchain — runs gameplay (start, move, select_power, apply, claim). `claim` branches on `config.mainnet_setup`: bridge mode queues a reverse message; local mode mints NUMS locally + updates EMA locally. Active on mainnet only in pure-Starknet mode. |
| **Rewardable** (`components/rewardable.cairo`) | Vault | Active on mainnet (`vault.pay` calls into it). Inert on appchain. |

## Bridge message flow + which chain each contract participates in

```
Player on mainnet:
  └─> Setup.issue (Setup, Token, Vault, Treasury all on mainnet)
        ├─ purchase.execute → Ekubo swap, NUMS burn, Vault.pay, USDC.transfer to team
        └─ send_message_to_appchain → ─────────────┐
                                                   ▼
                                          Materializer.materialize (appchain)
                                                   └─> Play.create (appchain, mints NFT in Collection)

Player on appchain:
  └─> Play.move / Play.set / ... (Play + Playable on appchain)
  └─> Play.claim
        └─ send_message_to_l1 (Cairo syscall) ─────┐
                                                   ▼
                                          Setup.apply_game_claim_batch (mainnet)
                                                   ├─ config.push (EMA on mainnet Config)
                                                   └─ Token.reward(player, amount) ← Token on mainnet

Player on mainnet (later):
  └─> Vault.claim (Vault + Token on mainnet)
```

## Bridge config toggle summary

| Field | Set on mainnet? | Set on appchain? | What it toggles |
|---|---|---|---|
| `appchain_materializer` | ✅ → appchain Materializer address | zero | Activates bridge mode in `Setup.issue`. Zero means today's pure-Starknet flow. |
| `bridge_messaging` | ✅ → mainnet Piltover messaging | unused | Used by `send_message_to_appchain` (forward) + `consume_message_from_appchain` (reverse). |
| `appchain_play` | ✅ → appchain Play address | unused | Authorizes inbound claim messages in `apply_game_claim_batch`. |
| `mainnet_setup` | unused (zero) | ✅ → mainnet Setup address | Activates bridge mode in `Playable.claim`. Zero means claim mints locally. |

## Sentinels (Setup.dojo_init)

- `appchain_materializer`, `bridge_messaging`, `appchain_play` must be
  **all-zero (local mode)** OR **all-non-zero (bridge mode)** —
  partial misconfig fails deploy.
- `appchain_materializer != self_contract_address` — defends against
  obvious misconfig where the bridge would loop on itself.

## Net new contracts in this PR vs PR #197

|  | PR #197 | This redesign |
|---|---|---|
| Mainnet-only contracts added | `Settler` (554 LOC) | None — Setup grew ~180 LOC |
| Appchain-only contracts added | `Materializer` + `BridgeComponent` | `Materializer` only (BridgeComponent deleted) |
| Two-chain-but-different-role contracts | All of Token/Vault/Play/Setup | Same |
| New cross-chain messages | 2 (SettlementRequest + MaterializationResult) | 2 (GameMint + GameClaim) |
| Total new Cairo LOC | ~1,200 | ~260 |

## Cleanest interpretation

- **Mainnet is the economic chain.** Setup (the bridge orchestrator),
  Token, Vault, and Treasury are the load-bearing contracts. Per-game
  NUMS rewards mint here.
- **Appchain is the gameplay chain.** Play, Playable, Materializer, and
  Collection are load-bearing. No USDC, no real NUMS minting at
  game-claim time.
- **The shared-Dojo-world monolith** forces Token/Vault/Setup to be
  present on the appchain too, but they're functionally dead weight in
  bridge mode. The actual cross-chain wiring is just two thin Piltover
  messages plus four config addresses.

## Operational notes

- **Role grants per chain.** Treasury holds `DEFAULT_ADMIN_ROLE` on
  Setup, Vault, Token on each chain independently. Bridge mode
  additionally requires `MINTER_ROLE` on **mainnet** Token to be granted
  to **mainnet** Setup so `apply_game_claim_batch` can mint rewards.
  Default deploy grants `MINTER_ROLE` only to Play.
- **Identity invariant.** Player's controller address must match across
  both chains. Mainnet `Setup.issue` records `recipient`, which flows
  into appchain `Play.create` (as game owner), then back to mainnet via
  the claim message's `player` field, then to mainnet `Token.reward`.
  If those diverge anywhere, rewards land in the wrong place. Cartridge
  controller infra is responsible for enforcing this.
- **Why Setup is on the appchain at all.** Two reasons: (1) `Playable`
  reads `config.mainnet_setup` from the appchain world's Setup Config
  to decide bridge vs local mode at claim time; (2) Dojo worlds are
  monolithic — every model schema must have a writer somewhere in the
  world, and Setup is the natural owner of the Config model.
- **Why Token is on the appchain at all.** Same Dojo-world-monolith
  reason. In bridge mode the appchain Token's storage state is never
  read or written. It's harmless dead weight that could be removed in
  a future cleanup if Dojo gains support for per-chain resource subsets.
