import { HomeScene } from "@/components/layouts/home-scene";
import { useAccount } from "@starknet-react/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAssets } from "@/hooks/assets";
import { useGames } from "@/hooks/games";
import { useActivities } from "@/hooks/activities";
import { usePurchaseModal } from "@/context/purchase-modal";
import { usePrices } from "@/context/prices";
import { useEntities } from "@/context/entities";
import { Game } from "@/models/game";

export const Home = () => {
  const { account } = useAccount();
  const { config } = useEntities();
  const { getNumsPrice } = usePrices();
  const { gameIds } = useAssets();
  const { games } = useGames(gameIds);
  const { data: allActivities = [] } = useActivities(account?.address);
  const { openPurchaseScene } = usePurchaseModal();

  // Filter activities to only include games that are over
  const activities = useMemo(() => {
    const overGameIds = new Set(games.filter((g) => g.over).map((g) => g.id));
    return allActivities.filter((activity) => overGameIds.has(activity.gameId));
  }, [allActivities, games]);
  const [gameId, setGameId] = useState<number | undefined>(undefined);

  const playPrice = 1.0; // TODO: Get actual play price

  // Chart data - calculate rewards for each level (1-20) based on current supply
  // Note: This is needed for activeGamesData calculation
  const chartValues = useMemo(() => {
    if (!config?.target_supply) {
      return Array.from({ length: 20 }, () => 0);
    }

    // Use the average supply from games, or target_supply if no games
    const currentSupply =
      games.length > 0
        ? games.reduce((sum, game) => sum + game.supply, 0n) /
          BigInt(games.length)
        : config.target_supply;

    const slotCount = config.slot_count || 20;

    // Get Nums price for conversion to USD
    const numsPrice = getNumsPrice();
    const price = numsPrice ? parseFloat(numsPrice) : 0.003; // Default fallback

    // Calculate rewards in Nums for each level
    const rewards = Game.rewards(
      slotCount,
      currentSupply,
      config.target_supply,
    );

    // Calculate cumulative sum of rewards
    const cumulativeRewards = rewards.reduce((acc, reward, index) => {
      const previousSum = index === 0 ? 0 : acc[index - 1];
      acc.push(previousSum + reward);
      return acc;
    }, [] as number[]);

    // Convert cumulative rewards to USD value
    return cumulativeRewards.map((reward) => reward * price);
  }, [config, games, getNumsPrice]);

  // Chart abscissa - find the first level where cumulative rewards (in USD) exceed playPrice
  const chartAbscissa = useMemo(() => {
    if (chartValues.length === 0) {
      return 0;
    }

    // Find the first level where cumulative reward value exceeds playPrice
    const breakevenIndex = chartValues.findIndex((value) => value > playPrice);

    // Return the level (1-indexed), or 20 (last level) if break-even is never reached
    return breakevenIndex !== -1 ? breakevenIndex + 1 : 20;
  }, [chartValues, playPrice]);

  // Transform games for Games component (only non-over games)
  const activeGamesData = useMemo(() => {
    // Get max payout from the last value of chartValues (level 20 cumulative reward)
    const maxPayoutValue =
      chartValues.length > 0 ? chartValues[chartValues.length - 1] : 0;
    const maxPayout = `$${maxPayoutValue.toFixed(2)}`;

    // Calculate breakEven (the level where cumulative rewards exceed playPrice)
    const breakEven = chartAbscissa.toString();

    return games
      .filter((game) => !game.over)
      .map((game) => ({
        gameId: game.id,
        score: game.level === 0 ? undefined : game.level,
        breakEven,
        payout: maxPayout,
      }));
  }, [games, chartValues, chartAbscissa]);

  // Set initial gameId to the first active game if available
  useEffect(() => {
    if (games.length > 0 && gameId === undefined) {
      const firstActiveGame = games.find((g) => !g.over);
      if (firstActiveGame) {
        setGameId(firstActiveGame.id);
      }
    }
  }, [games, gameId]);

  const handlePracticeClick = useCallback(() => {
    openPurchaseScene();
  }, [openPurchaseScene]);

  const handlePurchaseClick = useCallback(() => {
    openPurchaseScene();
  }, [openPurchaseScene]);

  return (
    <HomeScene
      gameId={gameId}
      activeGamesProps={{
        games: activeGamesData,
        gameId,
        setGameId,
      }}
      activitiesProps={{
        activities,
      }}
      onPracticeClick={handlePracticeClick}
      onPurchaseClick={handlePurchaseClick}
    />
  );
};
