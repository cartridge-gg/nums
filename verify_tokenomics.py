#!/usr/bin/env python3
"""Verify the sustainability of the NUMS tokenomics model."""

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

total_games = 284029
entry_fee = 2000
placement_pool_ratio = 0.5
jackpot_pool_ratio = 0.5

def calculate_placement_reward(slots_filled, base_multiplier=10.14):
    """Calculate placement reward using triangular number formula."""
    return sum(i * base_multiplier for i in range(1, slots_filled + 1))

def find_optimal_multiplier():
    """Find the base multiplier that makes placement rewards sustainable."""
    target_payout = entry_fee * placement_pool_ratio
    
    total_weighted_slots = sum(slots * count * (slots * (slots + 1) / 2) for slots, count in distribution)
    optimal_multiplier = (target_payout * total_games) / total_weighted_slots
    
    return optimal_multiplier

def verify_sustainability(base_multiplier):
    """Verify the sustainability of the tokenomics model."""
    print(f"\n=== NUMS Tokenomics Verification ===")
    print(f"Entry Fee: {entry_fee} NUMS")
    print(f"Placement Pool: {entry_fee * placement_pool_ratio} NUMS per game")
    print(f"Jackpot Pool: {entry_fee * jackpot_pool_ratio} NUMS per game")
    print(f"Base Multiplier: {base_multiplier:.4f} NUMS")
    
    total_placement_rewards = 0
    
    print(f"\n{'Slots':<6} {'Games':<8} {'Prob %':<8} {'Reward':<10} {'Total Payout':<12}")
    print("-" * 50)
    
    for slots, count in distribution:
        prob = (count / total_games) * 100
        reward = calculate_placement_reward(slots, base_multiplier)
        total_payout = reward * count
        total_placement_rewards += total_payout
        
        print(f"{slots:<6} {count:<8} {prob:<8.3f} {reward:<10.1f} {total_payout:<12,.0f}")
    
    avg_placement_reward = total_placement_rewards / total_games
    avg_placement_pool = entry_fee * placement_pool_ratio
    
    print(f"\n=== Sustainability Analysis ===")
    print(f"Total Games: {total_games:,}")
    print(f"Total Placement Rewards Paid: {total_placement_rewards:,.0f} NUMS")
    print(f"Average Placement Reward: {avg_placement_reward:.2f} NUMS")
    print(f"Target Average (from pool): {avg_placement_pool:.2f} NUMS")
    print(f"Difference: {avg_placement_reward - avg_placement_pool:.2f} NUMS")
    print(f"Sustainability Rate: {(avg_placement_pool / avg_placement_reward * 100):.2f}%")
    
    # Jackpot analysis
    print(f"\n=== Jackpot Analysis ===")
    jackpot_triggers = sum(count for slots, count in distribution if slots >= 18)
    jackpot_frequency = total_games / jackpot_triggers if jackpot_triggers > 0 else float('inf')
    
    print(f"Games with 18+ slots: {jackpot_triggers}")
    print(f"Jackpot trigger frequency: 1 in {jackpot_frequency:.0f} games")
    print(f"Average jackpot accumulation: {jackpot_frequency * entry_fee * jackpot_pool_ratio:,.0f} NUMS")
    
    # Overall sustainability
    total_income = entry_fee * total_games
    total_expenses = total_placement_rewards + (entry_fee * jackpot_pool_ratio * total_games)
    
    print(f"\n=== Overall Economics ===")
    print(f"Total Income: {total_income:,} NUMS")
    print(f"Total Placement Rewards: {total_placement_rewards:,.0f} NUMS")
    print(f"Total Jackpot Contributions: {entry_fee * jackpot_pool_ratio * total_games:,.0f} NUMS")
    print(f"Total Expenses: {total_expenses:,.0f} NUMS")
    print(f"Net Result: {total_income - total_expenses:,.0f} NUMS")
    print(f"House Edge: {((total_income - total_expenses) / total_income * 100):.4f}%")

# Find and verify optimal multiplier
optimal_multiplier = find_optimal_multiplier()
print(f"\nOptimal Base Multiplier: {optimal_multiplier:.6f} NUMS")

# Verify with suggested multiplier
verify_sustainability(10.14)

print("\n" + "="*50)
print("Verification with optimal multiplier:")
verify_sustainability(optimal_multiplier)