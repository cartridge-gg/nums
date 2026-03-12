---
name: dojo-architecture
description: Shinigami architecture for fully onchain Dojo games — Elements, Types, Models, Components, Systems, Helpers, Store, Events, Interfaces. Use when structuring a new game, adding modules, understanding the codebase hierarchy, or implementing new game mechanics.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Shinigami Architecture

Shinigami is designed for creating fully onchain games within Autonomous Worlds on Starknet. The design is hierarchical and modular with **9 layers**: Types, Elements, Models, Components, Systems, Helpers, Store, Events, and Interfaces.

## Layer Overview

```
Systems (dojo contracts, entry points)
  ↓ embed
Components (starknet components, orchestration)
  ↓ use
Store (centralized data access)
  ↓ read/write
Models (persistent onchain state)

Types (enums) → dispatch to → Elements (trait implementations)

Helpers (stateless utilities, used across all layers)
Events (dojo events with factory traits)
Interfaces (external contract ABIs)
```

## Module Structure

```
contracts/src/
├── lib.cairo              # Module tree
├── store.cairo            # Centralized data access layer
├── constants.cairo        # Game constants
├── types/                 # Enums and type conversions
│   ├── power.cairo        # Power enum → element dispatch
│   ├── trap.cairo         # Trap enum → element dispatch
│   ├── metadata.cairo     # NFT metadata generation
│   └── svg.cairo          # SVG rendering
├── elements/              # Trait implementations (game mechanics)
│   ├── powers/            # Power elements (8 implementations)
│   │   ├── interface.cairo    # PowerTrait definition
│   │   ├── double_up.cairo    # DoubleUp impl of PowerTrait
│   │   ├── halve.cairo        # ...
│   │   └── ...
│   ├── traps/             # Trap elements (6 implementations)
│   │   ├── interface.cairo    # TrapTrait definition
│   │   ├── bomb.cairo         # Bomb impl of TrapTrait
│   │   └── ...
│   ├── achievements/      # Achievement elements (6 implementations)
│   │   ├── interface.cairo    # AchievementTrait definition
│   │   └── ...
│   ├── tasks/             # Task elements (7 implementations + index dispatch)
│   │   ├── interface.cairo    # TaskTrait definition
│   │   ├── index.cairo        # Task enum dispatch
│   │   └── ...
│   └── quests/            # Quest elements (4 implementations)
│       ├── interface.cairo    # QuestTrait definition
│       └── ...
├── models/                # Dojo models (persistent state)
│   ├── index.cairo        # #[dojo::model] struct definitions
│   ├── game.cairo         # GameTrait (38 methods)
│   ├── config.cairo       # ConfigTrait + AssertTrait
│   ├── vault.cairo        # VaultTrait
│   ├── position.cairo     # PositionTrait
│   └── starterpack.cairo  # StarterpackTrait
├── components/            # Starknet components (orchestration)
│   ├── playable.cairo     # PlayableComponent (main game logic)
│   ├── rewardable.cairo   # RewardableComponent (vault/rewards)
│   ├── initializable.cairo
│   └── starterpack.cairo
├── systems/               # Dojo contracts (entry points)
│   ├── play.cairo         # IPlay (set, select, apply, claim)
│   ├── setup.cairo        # Game initialization
│   ├── vault.cairo        # Reward vault operations
│   ├── token.cairo        # NUMS token operations
│   ├── collection.cairo   # NFT management
│   ├── faucet.cairo       # Token distribution
│   ├── treasury.cairo     # Fund management
│   └── governor.cairo     # Governance
├── helpers/               # Stateless utilities
│   ├── random.cairo       # RandomTrait (seed, between, bool)
│   ├── packer.cairo       # PackerTrait (bit-packing)
│   ├── bitmap.cairo       # BitmapTrait (bit manipulation)
│   ├── deck.cairo         # DeckTrait (card draw/discard)
│   ├── heap.cairo         # HeapTrait (heap operations)
│   ├── verifier.cairo     # VerifierTrait (game validation)
│   ├── rewarder.cairo     # Rewarder (reward calculation)
│   └── power.cairo        # TwoPower (power-of-two math)
├── events/                # Dojo events
│   ├── index.cairo        # #[dojo::event] struct definitions
│   ├── started.cairo      # StartedTrait factory
│   ├── claimed.cairo      # ClaimedTrait factory
│   ├── purchased.cairo    # PurchasedTrait factory
│   └── vault.cairo        # VaultClaimedTrait, VaultPaidTrait
└── interfaces/            # External contract interfaces
    ├── nums.cairo         # INumsToken (ERC20 + rewards)
    ├── vrf.cairo          # IVrfProvider (randomness)
    ├── registry.cairo     # IStarterpackRegistry
    ├── token.cairo        # IToken
    ├── erc20.cairo        # Standard ERC20
    └── erc721.cairo       # Standard ERC721
```

---

## 1. Types (Enum Dispatch)

**Location**: `contracts/src/types/`

Types are enums that serve as entry points, dispatching to element implementations via `match`.

```cairo
// types/power.cairo
pub enum Power {
    None, Reroll, High, Low, Swap, DoubleUp, Halve, Mirror,
}

#[generate_trait]
pub impl PowerImpl of PowerTrait {
    fn apply(self: Power, ref game: Game, ref rand: Random) {
        match self {
            Power::None => {},
            Power::Reroll => powers::reroll::Reroll::apply(ref game, ref rand),
            Power::High => powers::high::High::apply(ref game, ref rand),
            Power::Low => powers::low::Low::apply(ref game, ref rand),
            Power::Swap => powers::swap::Swap::apply(ref game, ref rand),
            Power::DoubleUp => powers::double_up::DoubleUp::apply(ref game, ref rand),
            Power::Halve => powers::halve::Halve::apply(ref game, ref rand),
            Power::Mirror => powers::mirror::Mirror::apply(ref game, ref rand),
        }
    }
}
```

**Pattern**: Enum variant → match → concrete element module call.

**Conventions**:

- `Into<Power, u8>` and `Into<u8, Power>` for serialization
- Each type defines dispatch traits: `apply`, `rescue`, `index`, `draw`, `generate`, etc.

---

## 2. Elements (Trait Implementations)

**Location**: `contracts/src/elements/`

Elements implement traits defined in `interface.cairo` files. Each element is a single-responsibility implementation.

### Element Categories

| Category     | Trait              | Signature                                                    | Count |
| ------------ | ------------------ | ------------------------------------------------------------ | ----- |
| Powers       | `PowerTrait`       | `fn apply(ref game: Game, ref rand: Random)`                 | 8     |
| Traps        | `TrapTrait`        | `fn apply(ref game: Game, slot_index: u8, ref rand: Random)` | 6     |
| Achievements | `AchievementTrait` | `fn identifier(level: u8) -> felt252`                        | 6     |
| Tasks        | `TaskTrait`        | `fn identifier() -> felt252`                                 | 7     |
| Quests       | `QuestTrait`       | `fn props(registry: ContractAddress) -> QuestProps`          | 4     |

### Power Element Example

```cairo
// elements/powers/interface.cairo — trait definition
pub trait PowerTrait {
    fn apply(ref game: Game, ref rand: Random);
    fn rescue(game: @Game, slots: @Array<u16>) -> bool;
}

// elements/powers/double_up.cairo — concrete implementation
pub impl DoubleUp of PowerTrait {
    #[inline]
    fn apply(ref game: Game, ref rand: Random) {
        game.number = double(game.number);
    }

    #[inline]
    fn rescue(game: @Game, slots: @Array<u16>) -> bool {
        let mut game = *game;
        game.number = double(game.number);
        !game.is_over(slots)
    }
}
```

### Trap Element Example

```cairo
// elements/traps/interface.cairo
pub trait TrapTrait {
    fn apply(ref game: Game, slot_index: u8, ref rand: Random);
}

// elements/traps/bomb.cairo
pub impl Bomb of TrapTrait {
    #[inline]
    fn apply(ref game: Game, slot_index: u8, ref rand: Random) {
        let slots = game.slots();
        // Complex logic: find nearest numbers, shuffle them
        // ...
        game.force(new_slots);
    }
}
```

### Achievement Element Example

```cairo
// elements/achievements/interface.cairo
pub trait AchievementTrait {
    fn identifier(level: u8) -> felt252;
    fn hidden(level: u8) -> bool;
    fn index(level: u8) -> u8;
    fn points(level: u8) -> u16;
    fn group() -> felt252;
    fn icon(level: u8) -> felt252;
    fn title(level: u8) -> felt252;
    fn description(level: u8) -> ByteArray;
    fn tasks(level: u8) -> Span<AchievementTask>;
}

// elements/achievements/claimer.cairo — pure metadata
pub impl Claimer of AchievementTrait {
    fn identifier(level: u8) -> felt252 { 'CLAIMER_I' }
    fn hidden(level: u8) -> bool { false }
    fn points(level: u8) -> u16 { match level { 0 => 10, _ => 0 } }
    fn group() -> felt252 { 'Claimer' }
    fn icon(level: u8) -> felt252 { match level { 0 => 'fa-shrimp', _ => '' } }
    fn title(level: u8) -> felt252 { ... }
    fn description(level: u8) -> ByteArray { ... }
    fn tasks(level: u8) -> Span<AchievementTask> { ... }
}
```

**Conventions**:

- Trait defined in `interface.cairo`, implementations in individual files
- All element methods are `#[inline]`
- Powers/Traps modify Game state via `ref game`
- Achievements/Tasks/Quests return metadata (stateless)

---

## 3. Models (Persistent State)

**Location**: `contracts/src/models/`

Models are Dojo models with `#[dojo::model]` and trait implementations for lifecycle and validation.

```cairo
// models/index.cairo — struct definitions
#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct Game {
    #[key] pub id: u64,
    pub claimed: bool,
    pub multiplier: u16,
    pub level: u8,
    pub number: u16,
    pub next_number: u16,
    pub reward: u64,
    pub over: u64,
    pub slots: felt252,    // Packed via Packer helper
    pub traps: u128,       // Packed via Packer helper
    // ... more fields
}

// models/game.cairo — logic and validation
#[generate_trait]
pub impl GameImpl of GameTrait {
    fn new(...) -> Game { ... }
    fn start(ref self: Game, ref rand: Random) { ... }
    fn place(ref self: Game, number: u16, index: u8, ref rand: Random) { ... }
    fn apply(ref self: Game, index: u8, ref rand: Random) { ... }
    fn select(ref self: Game, index: u8) { ... }
    fn update(ref self: Game, ref rand: Random, target_supply: u256) { ... }
    fn claim(ref self: Game) -> u64 { ... }
    fn slots(self: @Game) -> Array<u16> { ... }
}

// Separate assertion impl
#[generate_trait]
pub impl GameAssert of AssertTrait {
    fn assert_does_exist(self: @Game) { ... }
    fn assert_has_started(self: @Game) { ... }
    fn assert_not_over(self: @Game) { ... }
    fn assert_is_valid(self: @Game) { ... }
}
```

**Conventions**:

- Struct definition in `index.cairo`, logic in dedicated files
- Separate `AssertTrait` impl for validation (keeps logic clean)
- Uses `#[generate_trait]` for impl-defined traits
- Packed fields use Packer/Bitmap helpers for storage efficiency

---

## 4. Store (Data Access Layer)

**Location**: `contracts/src/store.cairo`

Single centralized struct wrapping `WorldStorage` with typed accessors for all models, dispatchers, and events.

```cairo
#[derive(Copy, Drop)]
pub struct Store {
    pub world: WorldStorage,
}

#[generate_trait]
pub impl StoreImpl of StoreTrait {
    fn new(world: WorldStorage) -> Store {
        Store { world }
    }

    // Dispatchers (external contracts)
    fn nums_disp(self: @Store) -> INumsTokenDispatcher {
        let config = self.config();
        INumsTokenDispatcher { contract_address: config.nums }
    }
    fn vrf_disp(self: @Store) -> IVrfProviderDispatcher {
        let config = self.config();
        IVrfProviderDispatcher { contract_address: config.vrf }
    }

    // Model access
    fn config(self: @Store) -> Config { self.world.read_model(WORLD_RESOURCE) }
    fn set_config(mut self: Store, config: Config) { self.world.write_model(@config) }
    fn game(self: @Store, game_id: u64) -> Game { self.world.read_model(game_id) }
    fn set_game(mut self: Store, game: @Game) { self.world.write_model(game) }

    // Event emission
    fn purchased(mut self: Store, player_id: felt252, ...) {
        let event = PurchasedTrait::new(player_id, ...);
        self.world.emit_event(@event);
    }
}
```

**Rule**: All model access flows through Store. Never call `world.read_model()` directly in components or systems.

---

## 5. Components (Orchestration)

**Location**: `contracts/src/components/`

Starknet components that compose models (via Store) and external components. This is where business logic lives.

```cairo
#[starknet::component]
pub mod PlayableComponent {
    // External component dependencies
    component!(path: AchievableComponent, ...);
    component!(path: QuestableComponent, ...);
    component!(path: RankableComponent, ...);

    #[generate_trait]
    pub impl InternalImpl<TContractState, +HasComponent<TContractState>, ...> of InternalTrait<TContractState> {
        fn set(ref self: ComponentState<TContractState>, world: WorldStorage, game_id: u64, index: u8) -> u16 {
            let mut store = StoreImpl::new(world);

            // Read model
            let mut game = store.game(game_id);
            game.assert_does_exist();
            game.assert_has_started();

            // Execute game logic
            let mut rand = RandomImpl::new_vrf(store.vrf_disp());
            game.place(game.number, index, ref rand);
            game.assert_is_valid();

            // Update state
            game.update(ref rand, store.config().target_supply);
            store.set_game(@game);

            // Update external systems
            if game.over != 0 {
                let mut rankable = get_dep_component_mut!(ref self, Rankable);
                rankable.submit(world, LEADERBOARD_ID, game.id, player.into(), game.level.into(), time, true);
            }

            // Track achievements
            let achievable = get_dep_component!(@self, Achievable);
            achievable.progress(world, player.into(), Task::FillerOne.identifier(), 1, true);

            game.number
        }
    }
}
```

**Conventions**:

- Use `StoreImpl::new(world)` to access models
- Call model assertions before mutating state
- Use `get_dep_component!` / `get_dep_component_mut!` for external components
- Multiple impl blocks per component (InternalImpl, StarterpackImpl, QuestRewarderImpl)

---

## 6. Systems (Entry Points)

**Location**: `contracts/src/systems/`

Dojo contracts that embed components and expose public interfaces.

```cairo
#[starknet::interface]
pub trait IPlay<T> {
    fn set(ref self: T, game_id: u64, index: u8) -> u16;
    fn select(ref self: T, game_id: u64, index: u8);
    fn apply(ref self: T, game_id: u64, index: u8) -> u16;
    fn claim(ref self: T, game_id: u64);
}

#[dojo::contract]
pub mod Play {
    // Embed components
    component!(path: PlayableComponent, storage: playable, event: PlayableEvent);
    component!(path: AchievableComponent, storage: achievable, event: AchievableEvent);
    component!(path: QuestableComponent, storage: questable, event: QuestableEvent);
    component!(path: RankableComponent, storage: rankable, event: RankableEvent);

    // Wire component impls
    impl PlayableInternalImpl = PlayableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        playable: PlayableComponent::Storage,
        #[substorage(v0)]
        achievable: AchievableComponent::Storage,
        // ...
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat] PlayableEvent: PlayableComponent::Event,
        #[flat] AchievableEvent: AchievableComponent::Event,
        // ...
    }

    #[abi(embed_v0)]
    impl PlayImpl of IPlay<ContractState> {
        fn set(ref self: ContractState, game_id: u64, index: u8) -> u16 {
            let world = self.world(@NAMESPACE());
            self.playable.set(world, game_id, index)
        }
    }
}
```

**Conventions**:

- Define `#[starknet::interface]` trait first
- Embed components via `component!()` macro
- Delegate all logic to components — systems are thin wrappers
- Each component needs `#[substorage(v0)]` in Storage and `#[flat]` in Event enum

---

## 7. Helpers (Stateless Utilities)

**Location**: `contracts/src/helpers/`

Pure functions with no game state. Generic implementations with trait bounds.

```cairo
// helpers/bitmap.cairo — generic bit manipulation
pub trait BitmapTrait<T> {
    fn popcount(x: T) -> u8;
    fn get(x: T, index: u8) -> u8;
    fn set(x: T, index: u8) -> T;
    fn unset(x: T, index: u8) -> T;
}

pub impl Bitmap<T, +Into<u8, T>, +Into<T, u256>, ...> of BitmapTrait<T> {
    #[inline]
    fn get(x: T, index: u8) -> u8 {
        let x: u256 = x.into();
        let offset: u256 = TwoPower::pow(index);
        (x / offset % 2).try_into().unwrap()
    }
}

// helpers/random.cairo — seeded RNG
#[derive(Copy, Drop, Serde)]
pub struct Random { pub seed: felt252, pub nonce: usize }

#[generate_trait]
pub impl RandomImpl of RandomTrait {
    fn new(salt: felt252) -> Random { Random { seed: seed(salt), nonce: 0 } }
    fn new_vrf(vrf_provider_disp: IVrfProviderDispatcher) -> Random { ... }
    fn between<T, ...>(ref self: Random, min: T, max: T) -> T { ... }
    fn bool(ref self: Random) -> bool { ... }
}
```

**Conventions**:

- Generic traits with trait bounds for type flexibility
- `#[inline]` on all methods
- No `self` or `ref self` on static helpers (e.g., `Rewarder::amount(...)`)
- `ref self` for stateful helpers (e.g., `Random` with nonce)

---

## 8. Events (Dojo Events)

**Location**: `contracts/src/events/`

Dojo events with factory traits for construction.

```cairo
// events/index.cairo — struct definitions
#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct Started {
    #[key] pub player_id: felt252,
    #[key] pub game_id: u64,
    pub multiplier: u16,
    pub time: u64,
}

// events/started.cairo — factory trait
#[generate_trait]
pub impl StartedImpl of StartedTrait {
    fn new(player_id: felt252, game_id: u64, multiplier: u16) -> Started {
        Started {
            player_id, game_id, multiplier,
            time: starknet::get_block_timestamp(),
        }
    }
}
```

**Conventions**:

- Struct definition in `index.cairo`, factory in dedicated file (mirrors models pattern)
- Factory traits add computed fields (e.g., `time` from block timestamp)
- Events emitted via `Store::purchased(...)` — never directly

---

## 9. Interfaces (External Contracts)

**Location**: `contracts/src/interfaces/`

ABIs for external contract calls (tokens, VRF, registries).

```cairo
// interfaces/nums.cairo
#[starknet::interface]
pub trait INumsToken<T> {
    fn reward(ref self: T, recipient: ContractAddress, amount: u256);
    fn burn(ref self: T, from: ContractAddress, amount: u256);
}

// interfaces/vrf.cairo
#[starknet::interface]
pub trait IVrfProvider<T> {
    fn consume_random(ref self: T, source: Source) -> felt252;
}
```

---

## Data Flow

```
User calls System (Play::set)
  → System delegates to Component (PlayableComponent::set)
    → Component reads via Store (store.game(game_id))
      → Model validates state (game.assert_does_exist())
      → Model executes logic (game.place(number, index, ref rand))
        → Type dispatches to Element (Power::apply → DoubleUp::apply)
          → Element modifies Model state (game.number = double(game.number))
          → Helpers used throughout (Random, Packer, Bitmap)
      → Model validates result (game.assert_is_valid())
    → Component writes via Store (store.set_game(@game))
    → Component updates external systems (achievements, quests, leaderboard)
    → Store emits Events (store.started(...))
```

---

## Adding New Game Mechanics

### New Power

1. Add variant to `Power` enum in `types/power.cairo`
2. Create `elements/powers/my_power.cairo` implementing `PowerTrait`
3. Add match arm in `PowerImpl::apply()` and other dispatch methods
4. Add module declaration in `lib.cairo`
5. Update `Into<Power, u8>` / `Into<u8, Power>` conversions

### New Trap

1. Add variant to `Trap` enum in `types/trap.cairo`
2. Create `elements/traps/my_trap.cairo` implementing `TrapTrait`
3. Add match arm in `TrapImpl::apply()` and other dispatch methods
4. Add module declaration in `lib.cairo`

### New Model

1. Define struct with `#[dojo::model]` in `models/index.cairo`
2. Create `models/my_model.cairo` with `MyModelTrait` and `AssertTrait`
3. Add read/write methods to `store.cairo`

### New System

1. Define `#[starknet::interface]` trait
2. Create `systems/my_system.cairo` with `#[dojo::contract]`
3. Embed required components, delegate logic to them

---

## Naming Conventions

| Pattern          | Example                                                |
| ---------------- | ------------------------------------------------------ |
| Trait definition | `GameTrait`, `PowerTrait`, `StoreTrait`                |
| Implementation   | `GameImpl`, `PowerImpl`, `StoreImpl`                   |
| Assertion trait  | `AssertTrait` (separate impl block)                    |
| Trait file       | `interface.cairo` (in element dirs)                    |
| Model structs    | `index.cairo` (definitions), `game.cairo` (logic)      |
| Event structs    | `index.cairo` (definitions), `started.cairo` (factory) |
| Enum dispatch    | Match in type file, call `module::Struct::method()`    |

---

## External Dependencies

| Dependency            | Purpose                                      |
| --------------------- | -------------------------------------------- |
| `dojo`                | World storage, models, events, contracts     |
| `achievement`         | AchievableComponent for achievement tracking |
| `quest`               | QuestableComponent for quest progression     |
| `leaderboard`         | RankableComponent for rankings               |
| `starterpack`         | Starterpack registry and minting             |
| `openzeppelin`        | ERC20, ERC721 standards                      |
| `ekubo`               | DEX integration (router, positions)          |
| `alexandria_encoding` | Encoding utilities                           |
