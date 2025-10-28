#!/usr/bin/env python3
"""Calculate the correct base multiplier for sustainable tokenomics."""

# Empirical distribution data
distribution = [
    (1, 1384),
    (2, 3114),
    (3, 6051),
    (4, 10089),
    (5, 14870),
    (6, 20627),
    (7, 25708),
    (8, 30051),
    (9, 32896),
    (10, 33229),
    (11, 31185),
    (12, 25931),
    (13, 20297),
    (14, 13937),
    (15, 8190),
    (16, 4106),
    (17, 1719),
    (18, 523),
    (19, 117),
    (20, 5)
]

total_games = sum(count for _, count in distribution)
target_avg_payout = 1000  # NUMS per game from placement pool

# Calculate expected number of slots filled
expected_slots = sum(slots * count for slots, count in distribution) / total_games
print(f"Expected slots filled per game: {expected_slots:.2f}")

# Calculate the sum of triangular numbers weighted by probability
weighted_triangular_sum = 0
for slots, count in distribution:
    prob = count / total_games
    triangular_number = slots * (slots + 1) / 2
    weighted_triangular_sum += prob * triangular_number

print(f"Weighted triangular sum: {weighted_triangular_sum:.2f}")

# Calculate base multiplier
# Total payout = sum(games[i] * reward[i]) = sum(games[i] * triangular[i] * multiplier)
# Average payout = total payout / total games = multiplier * weighted_triangular_sum
# We want average payout = 1000
base_multiplier = target_avg_payout / weighted_triangular_sum

print(f"\nCorrect base multiplier: {base_multiplier:.4f} NUMS")

# Verify the calculation
total_payout = 0
print(f"\nVerification:")
print(f"{'Slots':<6} {'Count':<8} {'Prob':<8} {'Reward':<10} {'Total':<12}")
print("-" * 50)

for slots, count in distribution:
    prob = count / total_games
    triangular = slots * (slots + 1) / 2
    reward = triangular * base_multiplier
    game_total = reward * count
    total_payout += game_total
    if slots <= 5 or slots >= 15 or slots == 10:  # Show sample rows
        print(f"{slots:<6} {count:<8} {prob:.4f}   {reward:<10.1f} {game_total:<12,.0f}")

print(f"\nTotal payout: {total_payout:,.0f} NUMS")
print(f"Average payout per game: {total_payout/total_games:.2f} NUMS")
print(f"Target: {target_avg_payout} NUMS")
print(f"Difference: {abs(total_payout/total_games - target_avg_payout):.4f} NUMS")