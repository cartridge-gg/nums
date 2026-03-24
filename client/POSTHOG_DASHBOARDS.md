# PostHog Dashboards & Funnels

Setup guide for visualizing Nums analytics in PostHog.

## Setup

1. Add `VITE_POSTHOG_KEY` to Vercel project env vars (preview + production)
2. Deploy — events will flow through the `/ingest` proxy (already configured in vercel.json)
3. Verify events in PostHog → Activity → Live Events

## Events Reference

| Event | Description | Key Properties |
|-------|-------------|----------------|
| `wallet_connected` | User connected their wallet | `address`, `username` |
| `wallet_disconnected` | User disconnected wallet | — |
| `purchase_modal_opened` | User opened the purchase screen | — |
| `purchase_modal_closed` | User closed purchase without buying | — |
| `purchase_confirmed` | User purchased a game bundle | `bundle_id`, `price` |
| `game_started` | Game initialized (real, practice, or tutorial) | `game_id`, `mode` |
| `slot_placed` | User placed a number in a slot | `game_id`, `slot_index`, `mode` |
| `power_selected` | User selected a power-up | `game_id`, `power_index`, `mode` |
| `power_applied` | User applied a power-up | `game_id`, `power_index`, `mode` |
| `game_over` | Game ended (no valid slot for drawn number) | `game_id`, `score`, `slots_filled`, `mode` |
| `reward_claimed` | User claimed their payout | `game_id`, `mode` |
| `quest_claimed` | User claimed a quest reward | `quest_id`, `interval_id` |
| `vault_deposit` | User deposited NUMS to vault | `amount` |
| `vault_withdraw` | User withdrew from vault | `amount` |
| `vault_redeem` | User redeemed vault shares | `amount` |
| `vault_claim` | User claimed vault yield | — |
| `vault_mint` | User minted vault shares | `amount` |
| `merkledrop_claimed` | User claimed a merkledrop | `tree_id` |
| `social_issue` | User issued a social bundle | `bundle_id` |
| `faucet_minted` | User used the faucet (testnet) | — |
| `practice_mode_started` | User entered practice mode | — |
| `tutorial_started` | User started the tutorial | — |

## User Properties

Set on `identify()` when wallet connects:

| Property | Type | Description |
|----------|------|-------------|
| `username` | `$set` | Cartridge controller username |
| `wallet_address` | `$set` | Starknet wallet address |
| `referrer` | `$set_once` | Referral source from `?ref=` URL param |

---

## Dashboard 1: Acquisition & Activation

**Purpose:** How are users finding us and do they convert?

### Funnel: Visitor → Player
```
Step 1: $pageview (any page)
Step 2: wallet_connected
Step 3: purchase_confirmed
Step 4: game_started
```
**Breakdown by:** `referrer` user property

### Insights to create:
- **Daily Active Wallets** — Unique users firing `wallet_connected` per day (line chart)
- **Wallet Connection Rate** — `wallet_connected` / `$pageview` unique users (trend)
- **Referral Source Breakdown** — `wallet_connected` broken down by `referrer` property (bar chart)
- **New vs Returning Wallets** — `wallet_connected` where `referrer` is set (first-time) vs not (pie chart)

---

## Dashboard 2: Purchase Conversion

**Purpose:** Where do users drop off in the purchase flow?

### Funnel: Purchase Flow
```
Step 1: purchase_modal_opened
Step 2: purchase_confirmed
```
**Conversion window:** 30 minutes

### Insights to create:
- **Purchase Conversion Rate** — Funnel completion % (trend, daily)
- **Modal Abandonment** — `purchase_modal_closed` / `purchase_modal_opened` (trend)
- **Revenue by Bundle** — `purchase_confirmed` count, broken down by `bundle_id` (bar chart)
- **Average Purchase Value** — `purchase_confirmed` with `price` as numeric property (trend)
- **Time to First Purchase** — Time from `wallet_connected` to first `purchase_confirmed` (histogram)

---

## Dashboard 3: Core Game Loop

**Purpose:** How deeply do players engage with the game?

### Funnel: Game Completion
```
Step 1: game_started (where mode = real)
Step 2: slot_placed (where mode = real)
Step 3: game_over (where mode = real)
Step 4: reward_claimed (where mode = real)
```

### Insights to create:
- **Games Started per Day** — `game_started` where `mode = real` (line chart, daily)
- **Average Score Distribution** — `game_over` with `score` as numeric property (histogram)
- **Slots Filled Distribution** — `game_over` with `slots_filled` as numeric property (histogram)
- **Claim Rate** — `reward_claimed` / `game_over` unique users per day (trend)
- **Power-Up Usage** — `power_applied` count per day (line chart)
- **Power-Up Selection Rate** — `power_selected` / `game_started` per game session (trend)
- **Slots Placed per Game** — `slot_placed` count grouped by `game_id` (histogram)

---

## Dashboard 4: Practice → Real Conversion

**Purpose:** Do practice players convert to paying players?

### Funnel: Practice to Purchase
```
Step 1: practice_mode_started
Step 2: purchase_confirmed
```
**Conversion window:** 7 days

### Insights to create:
- **Practice Mode Entries per Day** — `practice_mode_started` count (line chart)
- **Practice → Purchase Conversion** — Funnel completion % (trend)
- **Tutorial Completion** — `tutorial_started` → `game_over` where `mode = practice` (funnel)
- **Practice Session Depth** — `slot_placed` count where `mode = practice`, grouped by session (histogram)

---

## Dashboard 5: Retention & Engagement

**Purpose:** Are players coming back?

### Insights to create:
- **Retention Cohort** — Based on `wallet_connected` as first event, with `game_started` as returning event (retention table, weekly)
- **Daily/Weekly/Monthly Active Players** — Unique users firing `slot_placed` (line chart, 3 series)
- **Games per Player per Week** — `game_started` count per unique user per week (histogram)
- **Stickiness** — DAU/MAU ratio based on `slot_placed` events (trend)
- **Churn Risk** — Users with `game_over` in last 7 days but no `game_started` in last 3 days (cohort)

---

## Dashboard 6: Staking & Economy

**Purpose:** How is the vault/staking system being used?

### Insights to create:
- **Vault Operations per Day** — `vault_deposit` + `vault_withdraw` + `vault_redeem` + `vault_claim` (stacked area chart)
- **Net Vault Flow** — Deposits minus withdrawals per day (bar chart)
- **Vault Participation Rate** — Unique users with `vault_deposit` / unique users with `wallet_connected` (trend)
- **Quest Claim Rate** — `quest_claimed` per day (line chart)
- **Merkledrop Claim Rate** — `merkledrop_claimed` per day (line chart)

---

## Dashboard 7: Referrals

**Purpose:** Which referral sources drive the most valuable users?

### Insights to create:
- **Referral Traffic** — `wallet_connected` broken down by `referrer` user property (table)
- **Referral → Purchase Rate** — `purchase_confirmed` broken down by `referrer` (table with conversion rate)
- **Revenue by Referrer** — `purchase_confirmed` sum of `price` by `referrer` (bar chart)
- **Referral Lifetime Value** — Total `purchase_confirmed` events per referred user cohort (trend)

---

## Recommended Alerts

Set up PostHog actions + webhooks (or Slack integration):

| Alert | Condition | Why |
|-------|-----------|-----|
| Purchase drop | `purchase_confirmed` < 50% of 7-day avg | Revenue is declining |
| Wallet connect spike | `wallet_connected` > 200% of 7-day avg | Viral moment — check infra |
| Game completion crash | `game_over` / `game_started` < 0.5 | Possible game-breaking bug |
| Zero events | No events for 15 minutes | PostHog or proxy may be down |
