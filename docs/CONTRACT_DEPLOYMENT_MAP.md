# Contract deployment map — Nums cross-chain bridge

Companion to `BRIDGE_ARCHITECTURE.md`. Where each contract lives, what
it does on each chain, and how the cross-chain messages flow.

## Architecture in one sentence

Mainnet runs the economic layer (purchase, swap, burn, vault.pay, team
transfer) and mints the Collection NFT first; the appchain runs gameplay
and mirrors the same NFT under the same `game_id` via a Piltover
L1Handler. Reverse direction (game-claim → NUMS reward) is symmetric:
the appchain queues a message at game-over, the mainnet `Play.claim`
consumes it and mints NUMS.

## Load-bearing invariant — **address equality**

**Mainnet Play contract address must equal appchain Play contract
address.** Both directions depend on it:

| Direction | Sender call | Receiver check |
|---|---|---|
| Forward (mainnet → appchain) | `messaging.send_message_to_appchain(this, ...)` where `this` = mainnet Play | `Play.create` asserts `from_address == this` where `this` = appchain Play |
| Reverse (appchain → mainnet) | `send_message_to_l1_syscall(this, payload)` where `this` = appchain Play | `messaging.consume_message_from_appchain(this, payload)` where `this` = mainnet Play |

If the two Play contracts land at different addresses, both directions
revert silently. Deployment salt / world seed / class hash all must be
identical across chains for `Play`. (Other contracts' addresses can
differ.)

## Per-chain contract roles

| Contract | Mainnet | Appchain | Notes |
|---|---|---|---|
| **Setup** (`systems/setup.cairo`) | ✅ Active. `Setup.issue` is the player's entry point. Runs `purchase.execute` (swap + burn + vault.pay + team.transfer), then calls `Play.mint(recipient, ..., qty)`. No bridge branch — Nums always runs in appchain mode now (the `Play.mint` call queues the Piltover message itself). | ⚠️ Deployed but `Setup.issue` is never called here in production. Setup primarily exists so the `Bridge` and `Config` models have a writer in the appchain world. Hosts `Setup.set_bridge(addr)` for admin patching. | Same code, both chains. dojo_init requires non-zero `bridge_messaging` (asserted by `BridgeTrait::new`). |
| **Play** (`systems/play.cairo`) | ✅ Active in forward sender role + reverse receiver role. `Play.mint(...)`: mints `Collection.new` NFT → builds `Payload` → `send_message_to_appchain(this, selector!("create"), payload)`. `Play.claim(payload)`: `consume_message_from_appchain(this, payload)` → asserts owner → mints NUMS reward via `nums_disp().reward(...)`. | ✅ Active L1Handler + gameplay. `Play.create` (l1_handler): asserts `from_address == this`, mints Collection NFT under the mainnet-assigned `game_id`, kicks off gameplay via `playable.create`. `Play.set/select/apply` runs gameplay. `Playable.finish` queues the reverse message via `send_message_to_l1_syscall(this, payload)`. | The address-equality invariant lives here. Same class, same salt → same address on both chains. |
| **Collection** (`systems/collection.cairo`) | ✅ Active. `Collection.new(player, soulbound)` auto-increments `game_id` and mints the canonical NFT (mainnet is the game_id origin). | ✅ Active. `Collection.mint(player, game_id, soulbound)` mints the *same* game_id (explicit, not auto). ERC-721 uniqueness reverts if the same game_id arrives twice — this is the **replay guard** for the forward direction. | Two mint paths: `new` (auto-id, mainnet) and `mint` (explicit-id, appchain L1Handler). Both gated by `MINTER_ROLE` granted to Play. Soulbound flag prevents transfer. |
| **Token** (NUMS ERC20, `systems/token.cairo`) | ✅ Active. The canonical NUMS. Burned by `purchase.execute`. Minted by `Play.claim → playable.claim` via `Token.reward(player, amount)`. `MINTER_ROLE` is granted to mainnet Play at deploy time (sufficient — no extra grants needed). | ⚠️ Deployed-but-dead. Local Token instance never read or written in production bridge mode. | Bridge mode keeps real NUMS on mainnet only. The appchain Token deployment is a Dojo-world-monolith artifact. |
| **Vault** (`systems/vault.cairo`) | ✅ Active. ERC-4626 over USDC; `vault.pay` distributes NUMS dividends from purchases. Player calls `vault.claim` here to redeem accrued NUMS. | ⚠️ Deployed-but-dead. `vault.pay` isn't called on appchain (purchase happens on mainnet). | |
| **Treasury** (`systems/treasury.cairo`) | ✅ Active. Holds `DEFAULT_ADMIN_ROLE` on Setup, Vault, Token, Collection. Production role grants flow through Treasury timelock. | ✅ Active in mirror role, scoped to the appchain world. | Per-chain admin. The two worlds are independent. |
| **Faucet** (`systems/faucet.cairo`) | ⚠️ Test/dev only. Production mainnet uses real USDC; `dojo_mainnet.toml` skips Faucet. e2e profile uses Faucet as a mock quote token. | Test/dev only. | Never deployed on real mainnet. |
| **Governor** (`systems/governor.cairo`) | Deployed but not actively exercised. | Same. | Reserved for future on-chain governance. Not load-bearing for the bridge. |
| **VRF** mock (`mocks/vrf.cairo`) | Skipped on real mainnet (real VRF provider used). | Skipped likewise. | Test scaffold only. |

## Components (mixed into the contracts above)

| Component | Used by | Per-chain behavior |
|---|---|---|
| **Purchase** (`components/purchase.cairo`) | Setup | Active on mainnet (called inside `Setup.issue`). Inert on appchain (Setup.issue isn't called). Has the `if amount > 0` guard around the Ekubo swap so test profiles with `burn_percentage = 0` and `ekubo_router = 0` don't trip OZ ERC-20's zero-recipient check. |
| **Playable** (`components/playable.cairo`) | Play | Active on **both** chains. Appchain: `playable.create` (start game), `playable.set/select/apply` (moves), `playable.finish` (game-over → queue reverse message via `send_message_to_l1_syscall(this, payload)`). Mainnet: `playable.claim` (consume payload, update EMA via `config.push`, mint reward via `nums_disp().reward`). |
| **Rewardable** (`components/rewardable.cairo`) | Vault | Active on mainnet (`vault.pay` calls into it). Inert on appchain. |

## Cross-chain `Payload` (`contracts/src/types/payload.cairo`)

A single struct serializes both directions via Cairo `Serde`:

```cairo
pub struct Payload {
    pub player: ContractAddress,
    pub game_id: u64,
    pub multiplier: u128,
    pub supply: u256,
    pub price: u256,
    pub level: u8,
    pub reward: u128,
}
```

- **Forward (mainnet → appchain):** `level = 0`, `reward = 0` (game just minted, no progress yet). Other fields carry the mainnet-computed game state.
- **Reverse (appchain → mainnet):** `level` and `reward` filled in from the finished game. `player` and `game_id` echo the original purchase identity.

## Bridge model (`contracts/src/models/bridge.cairo`)

```cairo
pub struct Bridge {
    #[key]
    pub world_resource: felt252,    // singleton key (WORLD_RESOURCE)
    pub address: ContractAddress,    // Piltover messaging contract for THIS chain
}
```

`BridgeTrait::new` asserts `address != 0`. Stored on both chains. The mainnet bridge points to mainnet's Piltover messaging contract; the appchain bridge points to the appchain's Piltover messaging contract. Both are used in both directions (forward send uses `send_message_to_appchain` on mainnet Piltover; reverse consume uses `consume_message_from_appchain` on the SAME mainnet Piltover from `Play.claim`'s perspective).

Setup exposes `Setup.set_bridge(addr)` (admin-only) so the e2e harness can patch the address post-migration.

## Full message flow

```
Player on mainnet:
  └─> Setup.issue
        ├─ purchase.execute → Ekubo swap, NUMS burn, Vault.pay, USDC.transfer to team
        └─ Play.mint(recipient, multiplier, supply, price, soulbound, qty)
              └─ for each unit:
                   ├─ Collection.new(player, soulbound) → fresh game_id, NFT minted on mainnet
                   ├─ payload = Payload { player, game_id, multiplier, supply, price, 0, 0 }
                   └─ messaging.send_message_to_appchain(this, selector!("create"), payload)

  ⋮ (Piltover state-root commit; Katana messaging worker delivers L1Handler) ⋮

Appchain Play.create (l1_handler):
  ├─ assert from_address == this        ← address-equality invariant
  ├─ Collection.mint(player, game_id, soulbound) → mirrors NFT on appchain at SAME game_id
  └─ playable.create(world, player, game_id, multiplier, supply, price)

Player on appchain:
  └─> Play.set / Play.select / Play.apply  (Collection.assert_is_owner gates each)

Game over:
  └─> playable.finish (internal, runs when game state hits end condition)
        ├─ game.claim() computes reward
        ├─ leaderboard / achievement progression
        └─ payload = Payload { player, game_id, multiplier, supply, price, level, reward }
              └─ send_message_to_l1_syscall(this, payload.span())   ← raw Cairo syscall, no dispatcher

  ⋮ (Piltover state-root commit reverse direction) ⋮

Player on mainnet:
  └─> Play.claim(payload)
        ├─ messaging.consume_message_from_appchain(this, payload)    ← address-equality invariant
        ├─ Payload::from(payload) decodes the struct
        ├─ Collection.assert_is_owner(caller, payload.game_id)       ← only the NFT owner can claim
        ├─ playable.claim:
        │     ├─ config.push(level, weight, EMA_MIN_SCORE)            ← updates EMA
        │     └─ nums_disp().reward(player, reward)                   ← mints NUMS on mainnet
        └─ Collection.update(payload.game_id)                         ← ERC-4906 metadata-updated
```

## Replay safety

### Forward (Materializer is gone)

ERC-721 token-id uniqueness in `Collection.mint(to, game_id, soulbound)` reverts a second mint at the same `game_id`. Piltover's L1Handler mailbox already delivers each (nonce, payload) exactly once, but if a future "retry stuck purchase" feature ever produces a duplicate forward message, the second appchain `Play.create` reverts at the `Collection.mint` step. **No dedicated `processed_ids` storage needed.**

### Reverse

Piltover's `consume_message_from_appchain` decrements the ref-count for the (from, to, payload) tuple; a second consume of the same hash reverts when the counter hits zero. Additionally, `Game.claimed` flips true after the first successful reverse — replaying the same payload would trip `game.assert_not_claimed` inside `playable.claim` if Piltover's check were ever bypassed.

## Configuration

Only one bridge field anywhere: `Bridge.address` (per-chain singleton).

There's no more `appchain_materializer / bridge_messaging / appchain_play / mainnet_setup` mess. The single `Bridge.address` on each chain points at that chain's Piltover messaging contract. Address equality of the `Play` contracts is what wires the two chains together — not config.

### Sentinels

- `BridgeTrait::new` asserts `address != 0`. So `Setup.dojo_init`'s `bridge_messaging` arg cannot be zero — Nums always runs in appchain mode.
- `Setup.set_bridge(addr)` reapplies the same sentinel via `BridgeTrait::new`.

### dojo_init signature

```
Setup.dojo_init(
    vrf_address: Option<ContractAddress>,
    quote_address: Option<ContractAddress>,
    team_address: ContractAddress,
    ekubo_router_address: ContractAddress,
    ekubo_positions_address: ContractAddress,
    entry_price: u128,
    target_supply: felt252,
    burn_percentage: u8,
    vault_percentage: u8,
    average_score: u8,
    pool_fee: u128,
    pool_tick_spacing: u128,
    pool_extension: ContractAddress,
    bundle_allower: ContractAddress,
    bridge_messaging: ContractAddress,   // single new arg, must be non-zero
)
```

`dojo_mainnet.toml` currently passes `bridge_messaging = 0x1` as a placeholder; replace with the real Piltover messaging address before launch, or patch via `Setup.set_bridge(addr)` post-deploy.

## Net new contracts in this PR vs PR #197

|  | PR #197 | This redesign |
|---|---|---|
| Mainnet-only contracts added | `Settler` (554 LOC) | None — `Play` grew to host `mint` + `claim` |
| Appchain-only contracts added | `Materializer` + `BridgeComponent` | None — `Play` grew to host the L1Handler `create` |
| Two-chain-but-different-role contracts | All of Token/Vault/Play/Setup | Same set, with simpler routing |
| New cross-chain messages | 2 (SettlementRequest + MaterializationResult) | 2 (GameMint + GameClaim, both serialize the same `Payload` struct) |
| Total new Cairo LOC | ~1,200 | ~260 |
| Standalone bridge contract | Yes (Materializer) | **No** — folded into Play |

## Cleanest interpretation

- **Mainnet is the economic chain and the game_id origin.** Setup runs the bridge orchestration via Play.mint; Token, Vault, Collection are load-bearing. Per-game NUMS rewards mint here on `Play.claim`.
- **Appchain is the gameplay chain and the L1Handler endpoint.** Play hosts the L1Handler (`create`), gameplay (`set/select/apply`), and the reverse-message dispatch (`Playable.finish`). Collection mirrors the mainnet NFTs by game_id.
- **The shared-Dojo-world monolith** forces Token/Vault/Setup to be present on the appchain too, but they're functionally dead weight in production. Same on the mainnet side for the appchain-flavored bits of Collection.
- **Two cross-chain messages, both carrying the same `Payload` struct, glued together by address-equality of the `Play` contract.** No models track pending state; the NFT itself is the source of truth.

## Operational notes

- **Role grants per chain.** Treasury holds `DEFAULT_ADMIN_ROLE` on Setup, Vault, Token, Collection on each chain independently. `MINTER_ROLE` on Token + Collection is granted to `Play` at deploy time. No extra grants needed for bridge mode (the new design doesn't separate the cross-chain mint from gameplay-Play).
- **Identity invariant.** Player's controller address must match across both chains. Mainnet `recipient` flows into `Payload.player`, mints the NFT on mainnet, then on the appchain via the L1Handler, then back through the reverse-claim path. The mainnet `Play.claim` requires the caller (NFT owner) to match `Collection.assert_is_owner(caller, payload.game_id)` — if the NFT changed hands (would require non-soulbound), the new owner claims.
- **Why Setup is on the appchain at all.** Two reasons: (1) the `Config` and `Bridge` models need a writer in the appchain world, and Setup is the natural owner; (2) admin operations (`set_bridge`, average-score adjustments, etc.) run there.
- **Why Token is on the appchain at all.** Dojo-world-monolith reason. In bridge mode the appchain Token's storage state is never read or written. Harmless dead weight that could be removed in a future cleanup if Dojo gains per-chain resource subsets.
- **Deployment order.** Both chains' worlds migrate independently, but `Play` MUST land at the same address on both. In practice this means: same Dojo world seed, same Setup deploy producing the same Play class hash, same Play class-hash UDC salt. Verify with a `grep play_address` across both `manifest_*.json` after migrate.
