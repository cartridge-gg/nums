# NUMS Game Design Document

## Top Line
- 30-120 second decision loops per run, with instant next-run replay.
- Fully asynchronous play on Starknet; players can run as many games as they hold.
- Claim-based payouts in NUMS immediately after a run ends.
- Push-your-luck number-placement strategy game: place a live random draw into ascending slots while traps and power-ups reshape risk.
- Built for players who like strategy under pressure, visible edge-seeking, and transparent onchain reward logic.

## Target Market
- Web3-native and adjacent strategy players who enjoy high-agency, high-variance outcomes.
- Puzzle/logic players who like fast sessions with meaningful choices.
- Competitive players motivated by leaderboard rank, quests, and achievement progression.
- Crypto users who value auditable mechanics, token-denominated rewards, and asynchronous play.

## Current Product Truth (Repo-Accurate)
- Core game currently runs on **18 slots** (not 20).
- Number range is **1-999**, unique draws per run.
- Each run starts with:
- 1 current number
- 1 next number preview
- 5 hidden traps distributed across the board
- Power-up offers every 4 filled slots up to slot 15 (max 3 selected powers total).
- Runs expire after **24 hours** if not completed.

## To Win
- Fill all 18 slots while maintaining ascending order.
- Or, more commonly, maximize filled slots before the board becomes unplayable.
- Final payout is based on filled-slot score and run multiplier.

## To Lose
- A run ends when the current number can no longer be legally placed and no selectable/usable power can rescue the state.
- If a run expires (24h), it is no longer playable.
- Low-slot outcomes can return less than expected value versus entry cost.

## Core Loop - To Play
1. Acquire a game via starterpack purchase.
2. Enter run with current number + next number preview.
3. Place current number into one empty slot that keeps strict ascending order.
4. Trigger trap if that slot has an unused trap.
5. Advance one level, update reward, and draw next number.
6. At level 4, 8, and 12, choose one of two offered powers.
7. Use selected powers tactically when needed.
8. On game over, claim NUMS payout and replay or purchase more runs.

## Traps (Board Hazards)
- `Bomb`: rerolls nearest placed neighbors around the triggered slot.
- `Lucky`: rerolls the value in the triggered slot.
- `Magnet`: pulls nearest numbers inward toward the triggered slot.
- `UFO`: relocates the triggered number to a random valid nearby empty window.
- `Windy`: pushes nearest numbers outward away from the triggered slot.

## Powers (Player Agency)
- `Reroll`: discard current number, draw a new one.
- `High`: redraw constrained above current number.
- `Low`: redraw constrained below current number.
- `Swap`: swap current and next numbers.
- `Double Up`: double current number (capped).
- `Halve`: halve current number (floored by slot min).
- `Mirror`: reflect current number within min/max amplitude.

## Reward & Economy Model
- Entry is sold through starterpacks with different reward multipliers.
- Price is quote-token based (USDC-style in current setup), with referral support.
- Purchase flow:
- Portion of entry is used to buy NUMS and burn it.
- Quote token value is also routed to vault rewards for stakers.
- Per-run reward is minted NUMS via a supply/target-aware formula.
- Reward multiplier scales by purchased starterpack tier and current token conditions.
- Claim is explicit: run must be over, then player claims to mint payout.

## Meta, Social, and Retention
- Leaderboard scoring based on final slot count and completion time.
- Daily quests with NUMS rewards and auto-claim hooks.
- Achievement tracks (grinder, filler thresholds, streak, references, claimer, daily master).
- Event feed and toasts surface recent starts/claims for social proof.
- Staking vault (`vNUMS`) adds long-loop retention and shared fee/reward participation.

## Why It’s Fun
- Every placement is meaningful and irreversible.
- Constant tension between immediate legality and future flexibility.
- Traps create volatility that can punish greed or open new lines.
- Powers provide clutch rescue moments without removing difficulty.
- Runs are short, readable, and replayable with transparent progression.
- High rolls feel earned because players still navigate strict ordering constraints.

## To Begin
1. Connect wallet.
2. Acquire quote token if needed (faucet on supported test environments).
3. Open purchase flow and select starterpack multiplier tier.
4. Purchase game(s), then enter a run.
5. Place numbers, select/use powers, survive as long as possible.
6. Claim payout when run ends.

## Theme Direction
- Current visual language: neon/glitch arcade puzzle aesthetic.
- Core fantasy: “precision under chaos” rather than pure gambling.
- Future theme layers can lean into cosmic signal/noise, competitive circuit, or data-heist motifs without changing mechanics.

## Optional Roadmap Features
- Blitz-only real-money reward mode (already hinted in UI copy).
- Expanded power catalog already scaffolded in client type system (king/erase/foresight/override/gem/ribbon/square/wildcard).
- Additional trap/power seasonal rotations for live-ops freshness.
- Tournament formats with fixed windows and pooled rewards.
- Cosmetic progression tied to leaderboard, achievements, or stake status.
