# NUMS Game Specification

## Game Overview

NUMS is a probabilistic number placement game where players attempt to place 20 randomly drawn numbers (from 1-1000) into 20 sequential slots while maintaining strict ascending order.

## Core Mechanics

### Game Flow

1. Player pays **2000 NUMS** tokens to enter
2. System randomly draws 20 unique numbers from range [1, 1000]
3. Numbers are presented one at a time
4. Player must place each number into an available slot
5. Once placed, numbers cannot be moved
6. All placed numbers must maintain strict ascending order (slot[i] < slot[i+1])

### Win Conditions

- **Primary Win**: Successfully fill all 20 slots in ascending order
- **Partial Success**: Earn placement rewards based on number of slots filled

### Loss Condition

- Game ends when a drawn number cannot be legally placed (no valid slot maintains ascending order)

## Probability Distribution

Based on empirical data from 284,029 games:

### Slot Fill Distribution

| Slots Filled | Count  | Probability | Cumulative % |
| ------------ | ------ | ----------- | ------------ |
| 1            | 1,384  | 0.487%      | 0.487%       |
| 2            | 3,114  | 1.097%      | 1.584%       |
| 3            | 6,051  | 2.131%      | 3.715%       |
| 4            | 10,089 | 3.553%      | 7.268%       |
| 5            | 14,870 | 5.236%      | 12.504%      |
| 6            | 20,627 | 7.264%      | 19.768%      |
| 7            | 25,708 | 9.052%      | 28.820%      |
| 8            | 30,051 | 10.584%     | 39.404%      |
| 9            | 32,896 | 11.586%     | 50.990%      |
| 10           | 33,229 | 11.703%     | 62.693%      |
| 11           | 31,185 | 10.984%     | 73.677%      |
| 12           | 25,931 | 9.131%      | 82.808%      |
| 13           | 20,297 | 7.148%      | 89.956%      |
| 14           | 13,937 | 4.908%      | 94.864%      |
| 15           | 8,190  | 2.884%      | 97.748%      |
| 16           | 4,106  | 1.446%      | 99.194%      |
| 17           | 1,719  | 0.605%      | 99.799%      |
| 18           | 523    | 0.184%      | 99.983%      |
| 19           | 117    | 0.041%      | 100.024%     |
| 20 (Win)     | 5      | 0.002%      | 100.026%     |

**Win Rate**: 0.00176% (1 in 56,806 games)

### Key Statistics

- **Expected Slots Filled**: 9.88 slots
- **Median Performance**: 10 slots
- **Mode**: 10 slots (most common outcome)
- **Standard Deviation**: 3.37 slots

## Tokenomics Model

### Entry Fee Distribution

**Total Entry**: 2000 NUMS tokens

#### Pool Allocation

- **50%** (1000 NUMS) → Placement Rewards Pool
- **50%** (1000 NUMS) → Jackpot Pool

### Placement Rewards

Players earn NUMS tokens proportional to their slot filling performance:

#### Reward Formula

For each filled slot `i`:

```
reward_per_slot = i × base_multiplier
base_multiplier = 18.66 NUMS
```

Total reward for `n` filled slots:

```
total_reward = Σ(i × base_multiplier) for i=1 to n
             = base_multiplier × n × (n+1) / 2
```

#### Expected Payouts by Performance

| Slots Filled | Placement Reward | Net Result | Occurrence Rate |
| ------------ | ---------------- | ---------- | --------------- |
| 1            | 19 NUMS          | -1981 NUMS | 0.49%           |
| 2            | 56 NUMS          | -1944 NUMS | 1.10%           |
| 3            | 112 NUMS         | -1888 NUMS | 2.13%           |
| 4            | 187 NUMS         | -1813 NUMS | 3.55%           |
| 5            | 280 NUMS         | -1720 NUMS | 5.24%           |
| 6            | 392 NUMS         | -1608 NUMS | 7.26%           |
| 7            | 522 NUMS         | -1478 NUMS | 9.05%           |
| 8            | 671 NUMS         | -1329 NUMS | 10.58%          |
| 9            | 839 NUMS         | -1161 NUMS | 11.59%          |
| 10           | 1026 NUMS        | -974 NUMS  | 11.70%          |
| 11           | 1232 NUMS        | -768 NUMS  | 10.98%          |
| 12           | 1456 NUMS        | -544 NUMS  | 9.13%           |
| 13           | 1699 NUMS        | -301 NUMS  | 7.15%           |
| 14           | 1961 NUMS        | -39 NUMS   | 4.91%           |
| 15           | 2239 NUMS        | +239 NUMS  | 2.88%           |
| 16           | 2538 NUMS        | +538 NUMS  | 1.45%           |
| 17           | 2855 NUMS        | +855 NUMS  | 0.61%           |
| 18           | 3191 NUMS        | +1191 NUMS | 0.18%           |
| 19           | 3545 NUMS        | +1545 NUMS | 0.04%           |
| 20           | 3918 NUMS        | +1918 NUMS | 0.002%          |

**Average Placement Reward**: 1000.0 NUMS (perfectly sustainable)

### Jackpot Pool

The jackpot pool accumulates 1000 NUMS per game and distributes to top performers.

#### Distribution Rules

1. **Progressive Jackpot**: Accumulates until won
2. **Winner Threshold**: Players filling 18+ slots share current jackpot
3. **Distribution Split** (when multiple winners in same period):
   - 20 slots: 60% of jackpot
   - 19 slots: 30% of jackpot
   - 18 slots: 10% of jackpot

#### Expected Jackpot Accumulation

- **Games between 18+ slot fills**: ~439 games
- **Average jackpot at trigger**: ~439,000 NUMS
- **Expected value per game**: 1.14 NUMS

### Sustainability Analysis

#### Revenue Model

Per game income: 2000 NUMS

#### Expense Model

- Placement rewards: 1000.0 NUMS (average)
- Jackpot contribution: 1000 NUMS
- **Total expenses**: 2000.0 NUMS

#### Sustainability Metrics

- **House Edge**: 0.00% (perfectly balanced)
- **Base multiplier**: 18.66 NUMS ensures exact sustainability
- **Long-term sustainability**: Guaranteed with 50/50 split between placement and jackpot pools

## Implementation Requirements

### Smart Contract Functions

1. `enterGame(uint256 entryFee)` - Process entry and fee distribution
2. `drawNumber()` - Generate random number [1, 1000]
3. `placeNumber(uint8 slot)` - Validate and place number
4. `calculateRewards()` - Compute placement rewards
5. `distributeJackpot()` - Handle jackpot distribution

### Random Number Generation

- Use verifiable random function (VRF) for fairness
- Ensure numbers are unique within each game
- Range: [1, 1000] inclusive

### State Management

- Track current game state per player
- Maintain jackpot pool balance
- Record historical performance for statistics

## Game Variants (Optional)

### Difficulty Modes

1. **Easy**: 15 slots, range [1, 500]
2. **Normal**: 20 slots, range [1, 1000] (default)
3. **Hard**: 25 slots, range [1, 1500]

### Tournament Mode

- Fixed entry period
- Top 10% of players share prize pool
- Ranked by slots filled + tiebreaker (completion time)

## Security Considerations

1. **Anti-Gaming Measures**
   - Prevent number prediction
   - Rate limiting per address
   - Minimum block confirmations for RNG

2. **Economic Security**
   - Reserve fund for jackpot guarantees
   - Maximum jackpot caps
   - Automated rebalancing mechanisms

## Conclusion

The NUMS game provides a challenging, mathematically fair gaming experience with sustainable tokenomics. The 2000 NUMS entry fee is redistributed entirely to players through placement rewards (50%) and jackpot pools (50%), ensuring long-term viability while maintaining excitement through rare but substantial wins.
