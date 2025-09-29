# NUMs Game Specification

## Scope and Assumptions
- **Objective**: Fill a sequence of 20 ordered slots with strictly increasing integers.
- **Randomness**: Each draw is provided by a verifiable random function (VRF) as an independent sample from the discrete uniform distribution over \([0, 1000]\).
- **Finality**: Once assigned, slot values are immutable. The game terminates immediately when the next draw cannot be placed without violating strict monotonicity.
- **Player agency**: Slots are filled sequentially from left to right; the \(k\)-th draw is committed to slot \(k\).

## Formal Model
Let \(N = 20\) be the number of slots and let random variables \(X_1, \ldots, X_N\) be i.i.d. with
\[ X_i \sim \mathrm{Uniform}\{0,1,\ldots,1000\}. \]

Define the *partial state* after placing slot \(k\) as the vector \((X_1, \ldots, X_k)\). The game remains *valid* at step \(k\) if
\[ X_1 < X_2 < \cdots < X_k. \]

Termination occurs at the minimal \(k \ge 2\) such that \(X_k \le X_{k-1}\). If no such \(k\) exists, the player reaches a perfect completion at slot 20.

## Probabilistic Outcomes
Because the draws are i.i.d., the probability that the first \(k\) slots are successfully filled equals the probability that \(k\) uniform samples arrive in strictly increasing order:
\[
P_k = \Pr[X_1 < X_2 < \cdots < X_k] = \frac{\binom{1001}{k}}{1001^k}, \quad k = 0,1,\ldots,20.
\]

The probability that the run ends *exactly* at slot \(k\) (i.e. slots \(1\ldots k-1\) succeed but slot \(k\) fails) is
\[
F_k = P_{k-1} - P_{k}, \quad k = 2,\ldots,20,
\]
with \(F_1 = 0\). A perfect game has probability \(P_{20}\).

### Outcome Table (Exact to 10 Significant Figures)

| Slot index \(k\) | Survival \(P_k\) | Failure at \(k\) \(F_k\) |
|:----------------:|-------------------|---------------------------|
| 1 | 1.000000000 × 10^0 | 0.000000000 × 10^0 |
| 2 | 4.995004995 × 10^-1 | 5.004995005 × 10^-1 |
| 3 | 1.661674988 × 10^-1 | 3.333330007 × 10^-1 |
| 4 | 4.141737359 × 10^-2 | 1.247501252 × 10^-1 |
| 5 | 8.250373919 × 10^-3 | 3.316699967 × 10^-2 |
| 6 | 1.368193877 × 10^-3 | 6.882180042 × 10^-3 |
| 7 | 1.942847021 × 10^-4 | 1.173909175 × 10^-3 |
| 8 | 2.411575847 × 10^-5 | 1.701689436 × 10^-4 |
| 9 | 2.658113904 × 10^-6 | 2.145764457 × 10^-5 |
| 10 | 2.634214778 × 10^-7 | 2.394692426 × 10^-6 |
| 11 | 2.370817224 × 10^-8 | 2.397133056 × 10^-7 |
| 12 | 1.953970239 × 10^-9 | 2.175420200 × 10^-8 |
| 13 | 1.485035401 × 10^-10 | 1.805466699 × 10^-9 |
| 14 | 1.046963733 × 10^-11 | 1.380339027 × 10^-10 |
| 15 | 6.882139226 × 10^-13 | 9.781423410 × 10^-12 |
| 16 | 4.236881416 × 10^-14 | 6.458451084 × 10^-13 |
| 17 | 2.452446492 × 10^-15 | 3.991636767 × 10^-14 |
| 18 | 1.339331417 × 10^-16 | 2.318513350 × 10^-15 |
| 19 | 6.922355452 × 10^-18 | 1.270107863 × 10^-16 |
| 20 | 3.395481046 × 10^-19 | 6.582807347 × 10^-18 |

### Aggregate Metrics
- **Perfect completion probability**: \(P_{20} \approx 3.40 \times 10^{-19}\).
- **Expected number of slots filled**:
  \[ \mathbb{E}[\text{slots filled}] = \sum_{k=1}^{20} P_k \approx 1.7169. \]
- **Median outcome**: Failing at slot 3 (i.e. filling exactly two slots) occurs with probability \(F_3 \approx 0.3333\), making it the single most likely termination point.

## Future Extensions
This document establishes the core combinatorial model required to reason about NUMs under uniform randomness. It provides the baseline distribution that downstream tokenomics and reward mechanics must respect. Subsequent sections can layer in:
- staking, entry fees, reward pools, and jackpots tied to deep-run events
- leaderboard scoring based on filled slots or rarity of outcomes
- incentives for repeated play using on-chain proof of draws and outcomes

These extensions only need to reference the probabilities tabulated above to ensure reward schedules remain solvent while offering attractive payouts.
