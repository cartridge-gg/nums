---
name: dojo
description: Dojo Engine framework patterns — World, Systems, Models, Events, Components, Store, permissions, testing with spawn_test_world, and deployment with sozo.
---

# Dojo Engine Framework

This skill covers Dojo Engine patterns for building fully on-chain games on Starknet. For pure Cairo language and Starknet contract patterns, see the `cairo` skill.

## When to Use

- Creating or modifying Dojo contracts (`#[dojo::contract]`)
- Defining models (`#[dojo::model]`) or events (`#[dojo::event]`)
- Working with WorldStorage (read/write models, emit events)
- Composing Starknet components within Dojo contracts
- Testing with `spawn_test_world`
- Configuring permissions and deployment

## Architecture Overview

Dojo is an Entity Component System (ECS) framework:

- **World** — Central coordinator and database, manages all resources within namespaces
- **Models (What)** — Data structs stored in the World (`#[dojo::model]`)
- **Systems (How)** — Stateless contracts that operate on models (`#[dojo::contract]`)
- **Events** — Indexed signals for off-chain sync (`#[dojo::event]`)
- **Components** — Reusable logic modules (`#[starknet::component]`)

### Data Flow

```
System (#[dojo::contract])
  └── self.world(@NAMESPACE()) → WorldStorage
       ├── world.read_model(key) → Model
       ├── world.write_model(@model)
       └── world.emit_event(@event)
```

## Essential Imports

```cairo
// In systems (always needed)
use dojo::model::{ModelStorage, ModelValueStorage};
use dojo::event::EventStorage;
use dojo::world::WorldStorage;

// In models
use starknet::ContractAddress;

// For nested structs in models
use dojo::meta::Introspect;

// In tests
use dojo_cairo_test::{
    ContractDef, ContractDefTrait, NamespaceDef, TestResource,
    WorldStorageTestTrait, spawn_test_world,
};
```

## Models (`#[dojo::model]`)

Models are the state. Structs annotated with `#[dojo::model]` are stored in the World.

```cairo
#[derive(Drop, Serde)]
#[dojo::model]
pub struct Game {
    #[key]
    pub id: u64,           // Primary key — used for lookup
    pub level: u8,         // Data fields
    pub score: u32,
    pub slots: felt252,    // Can store packed data
}
```

### Key Rules

1. **At least one `#[key]` field required**
2. **Keys must come first** in the struct
3. **Keys are not stored** — used only for indexing
4. **Required derives**: `Drop`, `Serde`
5. **Optional derives**: `Copy` (for primitive types)

### Composite Keys

```cairo
#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct VaultPosition {
    #[key]
    pub user: felt252,       // First key
    pub shares: u256,
    pub lockup: u64,
}

// Read with single key
let position: VaultPosition = world.read_model(user_felt);

// For multiple keys, use tuple
let resource: GameResource = world.read_model((player, location));
```

### Custom Nested Structs

Must derive `Introspect`:

```cairo
#[derive(Drop, Copy, Serde, Introspect)]
pub struct Vec2 {
    pub x: u32,
    pub y: u32,
}
```

### Model API

```cairo
let mut world = self.world(@"NUMS");

// Read (returns default/zero if not set)
let game: Game = world.read_model(game_id);

// Write / Update
world.write_model(@game);

// Generate unique ID
let entity_id = world.uuid();

// Delete
world.erase_model(@game);
```

## Events (`#[dojo::event]`)

Events are automatically indexed by Torii (Dojo's off-chain indexer).

```cairo
#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct Purchased {
    #[key]
    pub player_id: felt252,    // Indexed field for filtering
    pub starterpack_id: u32,
    pub quantity: u32,
    pub time: u64,
}

// Emit in a system or component
world.emit_event(@Purchased {
    player_id: caller.into(),
    starterpack_id: 1,
    quantity: 1,
    time: get_block_timestamp(),
});
```

## Systems (`#[dojo::contract]`)

Systems are **thin entry points**. They get WorldStorage and delegate to components.

```cairo
#[starknet::interface]
pub trait IPlay<T> {
    fn set(ref self: T, game_id: u64, index: u8) -> u16;
    fn select(ref self: T, game_id: u64, index: u8);
}

#[dojo::contract]
pub mod Play {
    use dojo::model::ModelStorage;
    use crate::components::playable::PlayableComponent;
    use crate::constants::NAMESPACE;

    // Embed components
    component!(path: PlayableComponent, storage: playable, event: PlayableEvent);
    impl PlayableInternalImpl = PlayableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        playable: PlayableComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        PlayableEvent: PlayableComponent::Event,
    }

    #[abi(embed_v0)]
    impl PlayImpl of super::IPlay<ContractState> {
        fn set(ref self: ContractState, game_id: u64, index: u8) -> u16 {
            // Get world for namespace
            let world = self.world(@NAMESPACE());
            // Delegate to component
            self.playable.set(world, game_id, index)
        }
    }
}
```

### World Access

```cairo
// With explicit namespace (preferred in this project)
let world = self.world(@NAMESPACE());  // NAMESPACE() returns "NUMS"

// With default namespace
let world = self.world_default();

// With inline namespace
let world = self.world(@"my_namespace");
```

### Initialization (`dojo_init`)

Called once on contract deployment:

```cairo
fn dojo_init(ref self: ContractState, owner: ContractAddress, entry_price: u128) {
    let mut world = self.world(@NAMESPACE());
    let mut store = StoreImpl::new(world);

    // Create initial config
    let config = ConfigTrait::new(owner, entry_price);
    store.set_config(config);

    // Initialize components
    self.initializable.initialize(world);
}
```

## Component Pattern (Nums-specific)

Components contain the **business logic** and receive `WorldStorage` as a parameter.

```cairo
#[starknet::component]
pub mod PlayableComponent {
    use dojo::world::WorldStorage;
    use crate::{StoreImpl, StoreTrait};

    #[storage]
    pub struct Storage {}

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {}

    #[generate_trait]
    pub impl InternalImpl<
        TContractState,
        +HasComponent<TContractState>,
        +Drop<TContractState>,
    > of InternalTrait<TContractState> {
        fn set(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            game_id: u64,
            index: u8,
        ) -> u16 {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Check] Game state
            let caller = starknet::get_caller_address();
            let mut game = store.game(game_id);
            game.assert_does_exist();
            game.assert_not_over();

            // [Effect] Place number
            game.place(game.number, index, ref rand);

            // [Interaction] Write back
            store.set_game(@game);
            game.number
        }
    }
}
```

### Dependent Component Access

```cairo
// Immutable access
let questable = get_dep_component!(@self, Quest);
questable.progress(world, player, task_id, count, true);

// Mutable access
let mut rankable = get_dep_component_mut!(ref self, Rankable);
rankable.submit(world: world, leaderboard_id: 1, score: 42);
```

### Component Embedding in Contract

```cairo
// 1. Declare component
component!(path: PlayableComponent, storage: playable, event: PlayableEvent);
impl PlayableInternalImpl = PlayableComponent::InternalImpl<ContractState>;

// 2. Add to storage
#[storage]
struct Storage {
    #[substorage(v0)]
    playable: PlayableComponent::Storage,
}

// 3. Add to events
#[event]
#[derive(Drop, starknet::Event)]
enum Event {
    #[flat]
    PlayableEvent: PlayableComponent::Event,
}
```

## Store Wrapper Pattern (Nums-specific)

The `Store` struct wraps `WorldStorage` for convenience:

```cairo
#[derive(Copy, Drop)]
pub struct Store {
    pub world: WorldStorage,
}

#[generate_trait]
pub impl StoreImpl of StoreTrait {
    fn new(world: WorldStorage) -> Store { Store { world } }

    // Model access
    fn game(self: @Store, game_id: u64) -> Game { self.world.read_model(game_id) }
    fn set_game(mut self: Store, game: @Game) { self.world.write_model(game) }
    fn config(self: @Store) -> Config { self.world.read_model(WORLD_RESOURCE) }
    fn set_config(mut self: Store, config: Config) { self.world.write_model(@config) }

    // Dispatchers
    fn nums_disp(self: @Store) -> INumsTokenDispatcher {
        let config = self.config();
        INumsTokenDispatcher { contract_address: config.nums }
    }

    // Event emission
    fn claimed(mut self: Store, player_id: felt252, game_id: u64, reward: u64) {
        let event = ClaimedTrait::new(player_id, game_id, reward);
        self.world.emit_event(@event);
    }
}
```

## OpenZeppelin + Dojo Integration

OZ components compose with Dojo contracts using the same `component!()` pattern:

```cairo
#[dojo::contract]
pub mod Vault {
    use openzeppelin::token::erc20::extensions::erc4626::ERC4626Component;
    use openzeppelin::access::accesscontrol::AccessControlComponent;

    component!(path: ERC4626Component, storage: erc4626, event: ERC4626Event);
    component!(path: AccessControlComponent, storage: accesscontrol, event: AccessControlEvent);

    // ERC4626 hooks for custom deposit/withdraw logic
    impl ERC4626HooksImpl of ERC4626Component::ERC4626HooksTrait<ContractState> {
        fn before_deposit(ref self: ERC4626Component::ComponentState<ContractState>, ...) {
            let mut contract_state = self.get_contract_mut();
            contract_state.pausable.assert_not_paused();
            let world = contract_state.world(@NAMESPACE());
            // ... custom logic using world
        }
    }
}
```

## Permissions

### Configuration-Based (deployment)

```toml
# dojo_sepolia.toml
[[writers]]
tag = "NUMS-Config"
address = "NUMS-Play"

[[writers]]
tag = "NUMS-Game"
address = "NUMS-Play"
```

### CLI

```bash
sozo auth grant writer NUMS-Position,NUMS-actions
sozo auth grant owner NUMS,NUMS-admin
sozo auth revoke writer NUMS-Position,NUMS-actions
sozo auth list
```

### Runtime (Cairo)

```cairo
// Grant
world.grant_writer(selector_from_tag!("NUMS-Position"), system_address);
world.grant_owner(selector_from_tag!("NUMS"), admin_address);

// Check
let is_owner = world.is_owner(resource_selector, address);
let can_write = world.is_writer(resource_selector, address);
```

### Permission Types

| Type       |  Can write data  | Can grant permissions | Can upgrade |
| ---------- | :--------------: | :-------------------: | :---------: |
| **Owner**  |        ✅        |          ✅           |     ✅      |
| **Writer** |        ✅        |          ❌           |     ❌      |
| **Reader** | ✅ (always open) |          ❌           |     ❌      |

## Testing

### Test Setup (Nums pattern)

```cairo
use dojo_cairo_test::{
    ContractDef, ContractDefTrait, NamespaceDef, TestResource,
    WorldStorageTestTrait, spawn_test_world,
};

fn setup_namespace() -> NamespaceDef {
    NamespaceDef {
        namespace: "NUMS",
        resources: [
            TestResource::Model(m_Game::TEST_CLASS_HASH),
            TestResource::Model(m_Config::TEST_CLASS_HASH),
            TestResource::Event(e_Claimed::TEST_CLASS_HASH),
            TestResource::Contract(Play::TEST_CLASS_HASH),
        ].span(),
    }
}

fn setup_contracts() -> Span<ContractDef> {
    [
        ContractDefTrait::new(@"NUMS", @"Setup")
            .with_owner_of([dojo::utils::bytearray_hash(@"NUMS")].span())
            .with_init_calldata(array![/* init args */].span()),
        ContractDefTrait::new(@"NUMS", @"Play")
            .with_writer_of([dojo::utils::bytearray_hash(@"NUMS")].span()),
    ].span()
}

pub fn spawn_game() -> (WorldStorage, Systems) {
    set_contract_address(OWNER());
    let ndef = setup_namespace();
    let world = spawn_test_world(world::TEST_CLASS_HASH, [ndef].span());
    world.sync_perms_and_inits(setup_contracts());

    let (play_address, _) = world.dns(@"Play").expect('Play not found');
    let systems = Systems {
        play: IPlayDispatcher { contract_address: play_address },
    };
    (world, systems)
}
```

### Integration Test

```cairo
#[test]
fn test_set_number() {
    let (world, systems) = spawn_game();

    // Execute action
    systems.play.set(game_id, 5);

    // Verify state
    let game: Game = world.read_model(game_id);
    assert(game.level == 1, 'wrong level');
}

#[test]
#[should_panic(expected: ('Game: is over',))]
fn test_cannot_play_after_game_over() {
    let (world, systems) = spawn_game();
    // ... setup game over state
    systems.play.set(game_id, 0); // Should panic
}
```

### Test Utilities

| Function                                      | Purpose                               |
| --------------------------------------------- | ------------------------------------- |
| `spawn_test_world(class_hash, [ndef].span())` | Create test world                     |
| `world.sync_perms_and_inits(contracts)`       | Initialize contracts with permissions |
| `world.dns(@"contract_name")`                 | Resolve contract address              |
| `world.read_model(key)`                       | Read model state                      |
| `world.write_model_test(@model)`              | Write model (bypass permissions)      |
| `world.erase_model(@model)`                   | Delete model                          |

### Cheat Codes

```cairo
use starknet::testing;

testing::set_caller_address(player);
testing::set_contract_address(contract);
testing::set_block_timestamp(1000);
testing::set_block_number(42);
```

## Namespace Pattern (Nums)

```cairo
// constants.cairo
#[inline]
pub fn NAMESPACE() -> ByteArray { "NUMS" }

// Usage in systems
let world = self.world(@NAMESPACE());

// Usage in DNS
world.dns_address(@"Token").expect('Token not found!')
```

## Deployment

### Build & Migrate

```bash
scarb build                          # Compile contracts
sozo test                            # Run tests
sozo migrate --profile sepolia       # Deploy to Sepolia
sozo migrate --profile mainnet       # Deploy to Mainnet
```

### Deployment Config

```toml
# dojo_sepolia.toml
[world]
seed = "nums-v1.0.49"
name = "nums"

[env]
rpc_url = "https://api.cartridge.gg/x/starknet/sepolia"
account_address = "0x..."
keystore = "./keystore_sepolia.json"

[[init_call_args]]
tag = "NUMS-Token"
execute = true
selector = "initializer"
calldata = ["0x...", "12000000000000000000000000"]
```

## Torii Indexer

```toml
# torii_sepolia.toml
world_address = "0x4e296..."
rpc = "https://api.cartridge.gg/x/starknet/sepolia"

[indexing]
polling_interval = 250

[grpc]
optimistic = true

[[contracts]]
type = "historical"
tag = "NUMS-TrophyProgression"
```

```bash
torii --config torii_sepolia.toml    # Start indexer
```

## Quick Reference

| You want to...   | Code                                     |
| ---------------- | ---------------------------------------- |
| Get world        | `let world = self.world(@NAMESPACE());`  |
| Read model       | `let game: Game = world.read_model(id);` |
| Write model      | `world.write_model(@game);`              |
| Emit event       | `world.emit_event(@MyEvent { ... });`    |
| Get caller       | `starknet::get_caller_address()`         |
| Generate ID      | `world.uuid()`                           |
| Resolve contract | `world.dns(@"ContractName")`             |
