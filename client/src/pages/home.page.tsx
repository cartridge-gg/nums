import { HomeScene } from "@/components/scenes/home";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGames } from "@/hooks/games";
import { usePurchaseModal } from "@/context/purchase-modal";
import { usePrices } from "@/context/prices";
import { useEntities } from "@/context/entities";
import { useHeader } from "@/hooks/header";
import { ChartHelper } from "@/helpers/chart";

export const Home = () => {
  const navigate = useNavigate();
  const { config, starterpack } = useEntities();
  const { getNumsPrice } = usePrices();
  const { supply: currentSupply } = useHeader();
  const { games } = useGames();
  const { openPurchaseScene } = usePurchaseModal();
  const [gameId, setGameId] = useState<number | undefined>(undefined);

  const numsPrice = useMemo(() => {
    return parseFloat(getNumsPrice() || "0.0");
  }, [getNumsPrice]);

  const playPrice = useMemo(() => {
    return Number(starterpack?.price || 0n) / 10 ** 6;
  }, [starterpack]);

  // Chart data - calculate rewards for each level (1-20) based on current supply
  const chartData = useMemo(() => {
    return ChartHelper.calculate({
      slotCount: config?.slot_count || 20,
      currentSupply,
      targetSupply: config?.target_supply || 0n,
      numsPrice: numsPrice,
      playPrice,
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
        to: `/game?id=${game.id}`,
        timestamp: game.over,
      }));
  }, [games]);

  // Transform games for Games component (only non-over games)
  const gamesProps = useMemo(() => {
    // Existing game details
    const gameData = games
      .filter((game) => !game.over)
      .map((game) => {
        const { chartAbscissa, maxPayout } = ChartHelper.calculate({
          slotCount: game.slot_count,
          currentSupply: game.supply,
          targetSupply: config?.target_supply || 0n,
          numsPrice: numsPrice,
          playPrice,
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
  }, [games, chartData, chartAbscissa, gameId, setGameId]);

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
    // Navigate to practice mode (game will be created in game.page if needed)
    navigate("/practice");
  }, [navigate]);

  return (
    <HomeScene
      gameId={gameId}
      gamesProps={gamesProps}
      activitiesProps={{ activities }}
      onPurchase={handlePurchaseClick}
      onPractice={handlePracticeClick}
    />
  );
};
