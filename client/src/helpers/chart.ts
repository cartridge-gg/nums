import { Game } from "@/models/game";

export interface ChartCalculationParams {
  slotCount: number;
  currentSupply: bigint;
  targetSupply: bigint;
  numsPrice: number; // Price in USD (e.g., 0.003)
  playPrice: number; // Play price for break-even calculation
}

export interface ChartCalculationResult {
  chartValues: number[]; // Array of cumulative reward values in NUMS (length = slotCount)
  chartAbscissa: number; // Break-even level (1-slotCount)
  maxPayout: number; // Maximum payout in USD
  maxPayoutNums: number; // Maximum payout in NUMS
}

export const ChartHelper = {
  /**
   * Calculate chart values for a game based on supply, target supply, slot count, and price
   * @param params - Chart calculation parameters
   * @returns Chart calculation result with values, abscissa, and payout information
   */
  calculate: (params: ChartCalculationParams): ChartCalculationResult => {
    const { slotCount, currentSupply, targetSupply, numsPrice, playPrice } =
      params;

    if (targetSupply === 0n || currentSupply === 0n) {
      return {
        chartValues: Array.from({ length: slotCount }, () => 0),
        chartAbscissa: 0,
        maxPayout: 0,
        maxPayoutNums: 0,
      };
    }

    // Calculate rewards in NUMS for each level (1-slotCount)
    const gameRewards = Game.rewards(slotCount, currentSupply, targetSupply);

    // Calculate cumulative sum of rewards
    const chartValues = gameRewards.reduce((acc, reward, index) => {
      const previousSum = index === 0 ? 0 : acc[index - 1];
      acc.push(previousSum + reward);
      return acc;
    }, [] as number[]);

    // Convert cumulative rewards to USD value
    const rewards = chartValues.map((reward) => reward * numsPrice);

    // Calculate break-even point (first level where cumulative reward value exceeds playPrice)
    let chartAbscissa = slotCount; // Default to last level if break-even is never reached
    if (rewards.length > 0) {
      const breakevenIndex = rewards.findIndex((value) => value > playPrice);
      chartAbscissa = breakevenIndex !== -1 ? breakevenIndex + 1 : slotCount;
    }

    // Calculate max payout
    const maxPayoutNums = chartValues[chartValues.length - 1] || 0;
    const maxPayout = maxPayoutNums * numsPrice;

    return {
      chartValues,
      chartAbscissa,
      maxPayout,
      maxPayoutNums,
    };
  },
};
