import { HomeScene, LoadingScene } from "@/components/scenes";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePreserveSearchNavigate } from "@/lib/router";
import { useGames } from "@/hooks/games";
import { usePrices } from "@/context/prices";
import { useEntities } from "@/context/entities";
import { useHeader } from "@/hooks/header";
import { usePractice } from "@/context/practice";
import { ChartHelper } from "@/helpers/chart";
import { useAccount } from "@starknet-react/core";

export const Home = () => {
  const navigate = usePreserveSearchNavigate();
  const { account } = useAccount();
  const { config } = useEntities();
  const { getNumsPrice } = usePrices();
  const { supply: currentSupply, handleConnect } = useHeader();
  const { games, loading } = useGames();
  const { clearGame, start: startPractice } = usePractice();
  const [defaultLoading, setDefaultLoading] = useState(true);

  const isConnected = !!account?.address;

  const numsPrice = useMemo(() => {
    return parseFloat(getNumsPrice() || "0.0");
  }, [getNumsPrice]);

  const playPrice = useMemo(() => {
    return Number(config?.entry_price || 0n) / 10 ** 6;
  }, [config]);

  // Chart data - calculate rewards for each level (1-20) based on current supply
  const chartData = useMemo(() => {
    return ChartHelper.calculate({
      slotCount: config?.slot_count || 20,
      currentSupply,
      targetSupply: config?.target_supply || 0n,
      numsPrice: numsPrice,
      playPrice,
      multiplier: 1,
    });
  }, [config, currentSupply, getNumsPrice, numsPrice, playPrice]);

  const { chartAbscissa } = chartData;

  const activities = useMemo(() => {
    const price = parseFloat(getNumsPrice() || "0.0");
    return games
      .filter((game) => !!game.over)
      .map((game) => ({
        gameId: game.id,
        score: game.level,
        breakEven: chartAbscissa.toString(),
        payout: `+$${(game.reward * price).toFixed(2)}`,
        to: `/game/${game.id}`,
        timestamp: game.over,
        claimed: game.claimed,
      }));
  }, [games]);

  const handlePracticeClick = useCallback(() => {
    if (currentSupply !== undefined && currentSupply > 0n) {
      clearGame();
      startPractice(currentSupply);
    }
    navigate("/practice");
  }, [navigate, clearGame, startPractice, currentSupply]);

  useEffect(() => {
    setTimeout(() => {
      setDefaultLoading(false);
    }, 3000);
  }, []);

  if (loading || defaultLoading) return <LoadingScene />;

  return (
    <HomeScene
      className="md:p-16"
      activitiesProps={{ activities }}
      isConnected={isConnected}
      onConnect={handleConnect}
      onPractice={handlePracticeClick}
    />
  );
};
