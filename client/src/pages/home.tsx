import { HomeScene } from "@/components/scenes";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePreserveSearchNavigate } from "@/lib/router";
import { useEntities } from "@/context/entities";
import { useHeader } from "@/hooks/header";
import { usePractice } from "@/context/practice";
import { useTutorial } from "@/context/tutorial";
import { ChartHelper } from "@/helpers/chart";
import { Rewarder } from "@/helpers/rewarder";
import {
  OFFLINE_CURRENT_SUPPLY,
  OFFLINE_NUMS_PRICE,
  OFFLINE_NUMS_PRICE_MICRO,
} from "@/constants/offline";

export const Home = () => {
  const navigate = usePreserveSearchNavigate();
  const { config, starterpacks } = useEntities();
  const { isConnected, handleConnect } = useHeader();
  const {
    start: startPractice,
    games: practiceGames,
    continueGame,
  } = usePractice();
  const { propose } = useTutorial();
  const [gameId, setGameId] = useState<number | undefined>(undefined);

  // Active starterpack (first available)
  const activeStarterpack = useMemo(() => starterpacks[0], [starterpacks]);

  const playPrice = useMemo(() => {
    return Number(activeStarterpack?.price || 2_000_000n) / 10 ** 6;
  }, [activeStarterpack]);

  const multiplier = useMemo(() => {
    if (!config || !activeStarterpack) return 1;
    return Rewarder.estimate(
      config.base_price,
      BigInt(activeStarterpack.multiplier),
      BigInt(config.burn_percentage),
      BigInt(config.slot_count),
      BigInt(config.average_score),
      BigInt(config.average_weigth),
      OFFLINE_CURRENT_SUPPLY,
      config.target_supply,
      OFFLINE_NUMS_PRICE_MICRO,
    );
  }, [activeStarterpack, config]);

  // Chart data - calculate rewards for each level based on current supply
  const chartData = useMemo(() => {
    return ChartHelper.calculate({
      slotCount: config?.slot_count || 18,
      currentSupply: OFFLINE_CURRENT_SUPPLY,
      targetSupply: config?.target_supply || 0n,
      numsPrice: OFFLINE_NUMS_PRICE,
      playPrice,
      multiplier,
    });
  }, [config, playPrice, multiplier]);

  const { chartAbscissa } = chartData;

  const practiceActivities = useMemo(() => {
    return practiceGames
      .filter((game) => !!game.over)
      .map((game) => ({
        gameId: `#${game.id}`,
        breakEven: chartAbscissa.toString(),
        payout: "Practice",
        to: `/practice/${game.id}`,
        timestamp: game.over,
        claimed: true,
        cells: [null, ...game.slots.map((slot) => slot !== 0), null],
      }));
  }, [practiceGames, chartAbscissa]);

  // Transform games for Games component (only non-over games)
  const gamesProps = useMemo(() => {
    const practiceGameData = practiceGames
      .filter((game) => game.over === 0)
      .map((game) => ({
        gameId: game.id,
        score: game.level === 0 ? undefined : game.level,
        expiration: game.expiration,
        payout: "Practice",
      }));

    const newGame = {
      breakEven: chartAbscissa.toString(),
      payout: `$${chartData.maxPayout.toFixed(2)}`,
    };

    return {
      games: [...practiceGameData, newGame],
      gameId,
      setGameId,
    };
  }, [
    practiceGames,
    chartData,
    chartAbscissa,
    gameId,
    setGameId,
  ]);

  // Set initial gameId to the first active game if available
  useEffect(() => {
    if (gameId !== undefined) return;

    const firstPracticeGame = practiceGames.find((g) => g.over === 0);
    if (firstPracticeGame) {
      setGameId(firstPracticeGame.id);
    }
  }, [practiceGames, gameId]);

  const handlePracticeClick = useCallback(() => {
    if (!isConnected) {
      handleConnect();
      return;
    }

    propose(() => {
      const practiceGame = startPractice(
        OFFLINE_CURRENT_SUPPLY,
        multiplier,
        activeStarterpack?.price,
      );
      navigate(`/practice/${practiceGame.id}`);
    });
  }, [
    propose,
    navigate,
    startPractice,
    multiplier,
    activeStarterpack?.price,
    isConnected,
    handleConnect,
  ]);

  const handleStartGameClick = useCallback(() => {
    handlePracticeClick();
  }, [handlePracticeClick]);

  const handleContinueClick = useCallback(() => {
    if (!isConnected) {
      handleConnect();
      return;
    }

    if (!gameId) return;

    // Check if it's a practice game
    const practiceGame = practiceGames.find(
      (g) => g.id === gameId && g.over === 0,
    );
    if (practiceGame) {
      continueGame(gameId);
      navigate(`/practice/${gameId}`);
    }
  }, [gameId, practiceGames, continueGame, navigate, isConnected, handleConnect]);

  return (
    <HomeScene
      className="md:py-16"
      gameId={gameId}
      games={gamesProps}
      banners={[]}
      allActivities={{ activities: practiceActivities }}
      playerActivities={{ activities: practiceActivities }}
      onStartGame={handleStartGameClick}
      onContinue={handleContinueClick}
    />
  );
};
