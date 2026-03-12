# NUMS Game Design Document

## Top Line
- 30-120 second decision loops per run, with instant start of a new run.
- Fully asynchronous play; players can run as many games as they want.
- Skill-based real-money game with immediate post-run payout.
- Push-your-luck number-placement strategy game: place a live random draw into ascending slots while traps and power-ups reshape risk.
- Built for players who like strategy under pressure, visible edge-seeking, and transparent reward logic.

## Target Market
- Strategy players who enjoy high-agency, high-variance outcomes.
- Puzzle/logic players who like fast sessions with meaningful choices.
- Competitive players motivated by leaderboard rank, quests, and achievement progression.
- Real-money skill-game players who want outcomes driven by decision quality, not pure chance.

## Current Product Truth (Repo-Accurate)
- Core game currently runs on **18 slots**.
- Number range is **1-999**, unique draws per run.
- Each run starts with 1 current number, 1 next-number preview, and 5 hidden traps distributed across the board.
- Power-up offers at slot 4, 8, and 12 (max 3 selected powers total).
- Runs expire after **24 hours** if not completed.

## To Win
- Fill all 18 slots while maintaining ascending order.
- Fill as many slots as possible before the board becomes unplayable.
- Final payout is based on filled-slot score and run multiplier.

## To Lose
- A run ends when the current number can no longer be legally placed and no usable power can rescue the state.
- In that state, slot selection is disabled in the next client version.
- If a run expires (24h), it is no longer playable.
- If the run ends below break-even, the payout can be lower than the entry cost.

## Core Loop - To Play
1. Buy into a run at a known entry price and payout profile.
2. Enter run with current number + next number preview.
3. Place current number into one empty slot that keeps strict ascending order.
4. Trigger trap if that slot has an unused trap.
5. Advance one level, update reward, and draw next number.
6. At level 4, 8, and 12, choose one of two offered powers.
7. Use selected powers tactically when needed.
8. On game over, claim payout, then start another run if desired.

## Traps (Board Hazards)
- Any trap-driven reroll still resolves to a value that preserves a valid ascending grid.
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
- Entry is sold in multiple price tiers with different reward multipliers.
- Players see expected break-even point and max reward before they start.
- Purchase flow uses a split model: one portion is burned to support game economy and one portion is recognized as game revenue.
- Per-run reward scales with score and selected entry tier.
- Claim is explicit: run must be over, then player claims payout.

## Meta, Social, and Retention
- Leaderboards rank by total rewards earned across daily, weekly, and all-time windows.
- Daily quests are currently TBD.
- Achievement tracks exist, and achievement reward amounts are TBD.

## Why It’s Fun
- Every placement is meaningful and irreversible.
- Constant tension between immediate legality and future flexibility.
- Traps create volatility that can punish greed or open new lines.
- Powers provide clutch rescue moments without removing difficulty.
- Runs are short, readable, and replayable with transparent progression.
- High rolls feel earned because players still navigate strict ordering constraints.

## To Begin
1. Open the game and choose a run entry tier.
2. Review entry fee, break-even level, and max reward.
3. Buy into the run and start playing immediately.
4. Place numbers, select/use powers, survive as long as possible.
5. Claim payout when run ends.

## Theme Direction
- Current visual language: modernized pixel-retro game aesthetic.
- Core fantasy: “precision under chaos” rather than pure gambling.
- Future theme layers can lean into cosmic signal/noise, competitive circuit, or data-heist motifs without changing mechanics.

## Optional Roadmap Features
- Blitz-only real-money reward mode (already hinted in UI copy).
- Expanded power catalog already scaffolded in client type system (king/erase/foresight/override/gem/ribbon/square/wildcard).
- Additional trap/power seasonal rotations for live-ops freshness.
- Tournament formats with fixed windows and pooled rewards.
- Cosmetic progression tied to leaderboard, achievements, or stake status.
