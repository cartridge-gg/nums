---
name: dojo-architecture
description: Shinigami architecture for fully onchain Dojo games — Elements, Types, Models, Components, Systems, Helpers. Use when structuring a new game, adding modules, or understanding the codebase hierarchy.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Shinigami Architecture

Shinigami is designed for creating fully onchain games within Autonomous Worlds on Starknet. It follows a structured approach to enable efficient development and maintenance of onchain games. The design is hierarchical and modular, ensuring scalability and reusability across different game elements.

## Elements

### Definition

Elements represent distinct entities within a game, such as achievements, bonuses, or other game-specific units. Each element implements a unique trait, allowing them to be uniformly processed within the same workflow.

### Responsibility

Handle specific game logic or intrinsic data associated with their type. Elements ensure consistency and facilitate streamlined operations within the game's ecosystem.

## Types

### Definition

Types encompass enumerators or custom types defining various states or functional intentions within the game. Examples include roles, items, actions, etc.

### Responsibility

Serve as entry points for associated elements, directing workflows to the appropriate logic based on the type. For instance, the Item type provides entry points for fundamental items like swords, potions, shields, etc.

## Models

### Definition

Models are entities with persistence in the game world, stored onchain and utilized across different transactions.

### Responsibility

Implement logic to manipulate and interact with stored data. Models encapsulate data management and ensure integrity during transactions.

## Components

### Definition

Components execute logic to manipulate different models within a cohesive workflow. They play a crucial role in verifying and maintaining overall coherence during player operations.

### Responsibility

Handle operations that involve multiple models, ensuring validations and updates are performed according to game rules and player actions.

## Systems

### Definition

Systems represent game modes, where each mode can utilize specific components with predefined configurations. For example, a game might have different systems like Standard using a default deck and Tutorial using an example deck.

### Responsibility

Manage game modes and configurations, allowing players to choose between different gameplay setups through the client interface.

## Helpers

### Definition

Helpers are reusable implementations that encapsulate common logic without game data. Examples include packers for packing/unpacking mechanisms, solvers for resolving game situations or either a battle for handling army fights.

### Responsibility

Provide utility functions to streamline repetitive tasks, ensuring code efficiency and reducing redundancy in complex game logic.

## Hierarchy

```
Types (enums, entry points)
  └── Elements (trait implementors per type)
        └── Models (persistent onchain data)
              └── Components (multi-model workflows)
                    └── Systems (game modes, configurations)

Helpers (stateless utilities, used across all layers)
```

## Design Principles

1. **Define Types first** — they are the entry points for all game logic
2. **Implement Elements per Type** — each element implements a trait for uniform processing
3. **Create Models for persistence** — onchain data that lives across transactions
4. **Compose Components** — orchestrate multiple models with validation
5. **Configure Systems as game modes** — each mode selects components with specific configs
6. **Extract Helpers** — reusable stateless logic shared across layers
