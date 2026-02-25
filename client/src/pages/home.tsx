import { HomeScene, LoadingScene } from "@/components/scenes";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePreserveSearchNavigate } from "@/lib/router";
import { useGames } from "@/hooks/games";
import { usePurchaseModal } from "@/context/purchase-modal";
import { usePrices } from "@/context/prices";
import { useEntities } from "@/context/entities";
import { useHeader } from "@/hooks/header";
import { usePractice } from "@/context/practice";
import { ChartHelper } from "@/helpers/chart";

export const Home = () => {
  const navigate = usePreserveSearchNavigate();
  const { config, starterpacks } = useEntities();
  const { getNumsPrice } = usePrices();
  const { supply: currentSupply } = useHeader();
  const { games, loading } = useGames();
  const { openPurchaseScene } = usePurchaseModal();
  const { clearGame, start: startPractice } = usePractice();
  const [defaultLoading, setDefaultLoading] = useState(true);
  const [gameId, setGameId] = useState<number | undefined>(undefined);

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

  // Transform games for Games component (only non-over games)
  const gamesProps = useMemo(() => {
    // Existing game details
    const gameData = games
      .filter((game) => !game.over)
      .map((game) => {
        const starterpack = starterpacks.find(
          (starterpack) => starterpack.multiplier === game.multiplier,
        );
        const playPrice = Number(starterpack?.price || 0n) / 10 ** 6;
        const { chartAbscissa, maxPayout } = ChartHelper.calculate({
          slotCount: game.slot_count,
          currentSupply: game.supply,
          targetSupply: config?.target_supply || 0n,
          numsPrice: numsPrice,
          playPrice,
          multiplier: game.multiplier,
        });
        return {
          gameId: game.id,
          score: game.level === 0 ? undefined : game.level,
          breakEven: chartAbscissa,
          payout: `$${maxPayout.toFixed(2)}`,
        };
      });

    const newGame = {
      breakEven: chartAbscissa.toString(),
      payout: `$${chartData.maxPayout.toFixed(2)}`,
    };

    return {
      games: [...gameData, newGame],
      gameId,
      setGameId,
    };
  }, [starterpacks, games, chartData, chartAbscissa, gameId, setGameId]);

  // Set initial gameId to the first active game if available
  useEffect(() => {
    if (games.length > 0 && gameId === undefined) {
      const firstActiveGame = games.find((g) => !g.over);
      if (firstActiveGame) {
        setGameId(firstActiveGame.id);
      }
    }
  }, [games, gameId]);

  const handlePurchaseClick = useCallback(() => {
    openPurchaseScene();
  }, [openPurchaseScene]);

  const handlePracticeClick = useCallback(() => {
    // Clear existing game and create a new one immediately to avoid showing old game
    if (currentSupply !== undefined && currentSupply > 0n) {
      clearGame();
      startPractice(currentSupply);
    }
    // Navigate to practice mode
    navigate("/practice");
  }, [navigate, clearGame, startPractice, currentSupply]);

  useEffect(() => {
    setTimeout(() => {
      setDefaultLoading(false);
    }, 3000);
  }, []);

  // Show loading state if the page is still loading
  if (loading || defaultLoading) return <LoadingScene />;

  return (
    <HomeScene
      className="md:p-16"
      gameId={gameId}
      gamesProps={gamesProps}
      activitiesProps={{ activities }}
      onPurchase={handlePurchaseClick}
      onPractice={handlePracticeClick}
    />
  );
};
