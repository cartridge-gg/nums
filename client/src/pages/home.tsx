import { HomeScene, LoadingScene } from "@/components/scenes";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePreserveSearchNavigate } from "@/lib/router";
import { useGames } from "@/hooks/games";
import { usePurchaseModal } from "@/context/purchase-modal";
import { usePrices } from "@/context/prices";
import { useEntities } from "@/context/entities";
import { useHeader } from "@/hooks/header";
import { usePractice } from "@/context/practice";
import { useTutorial } from "@/context/tutorial";
import { ChartHelper } from "@/helpers/chart";
import { useMultiplier } from "@/hooks/multiplier";

export const Home = () => {
  const navigate = usePreserveSearchNavigate();
  const { config, starterpacks } = useEntities();
  const { getNumsPrice } = usePrices();
  const { supply: currentSupply } = useHeader();
  const { allGames, playerGames: games, loading } = useGames();
  const { openPurchaseScene } = usePurchaseModal();
  const { clearGame, start: startPractice } = usePractice();
  const { propose } = useTutorial();
  const [defaultLoading, setDefaultLoading] = useState(true);
  const [gameId, setGameId] = useState<number | undefined>(undefined);

  const numsPrice = useMemo(() => {
    return parseFloat(getNumsPrice() || "0.0");
  }, [getNumsPrice]);

  // Active starterpack (first available)
  const activeStarterpack = useMemo(() => starterpacks[0], [starterpacks]);

  const playPrice = useMemo(() => {
    return Number(activeStarterpack?.price || 2_000_000n) / 10 ** 6;
  }, [activeStarterpack]);

  // Estimate multiplier from on-chain formula via real Ekubo quote
  const { multiplier } = useMultiplier({
    basePrice: config?.base_price ?? 0n,
    packMultiplier: BigInt(activeStarterpack?.multiplier ?? 1),
    burnPercentage: BigInt(config?.burn_percentage ?? 0),
    slotCount: BigInt(config?.slot_count ?? 18),
    averageScore: BigInt(config?.average_score ?? 0),
    averageWeight: BigInt(config?.average_weigth ?? 0),
    currentSupply,
    targetSupply: config?.target_supply ?? 0n,
    quoteAddress: config?.quote ?? "",
  });

  // Chart data - calculate rewards for each level based on current supply
  const chartData = useMemo(() => {
    return ChartHelper.calculate({
      slotCount: config?.slot_count || 18,
      currentSupply,
      targetSupply: config?.target_supply || 0n,
      numsPrice,
      playPrice,
      multiplier,
    });
  }, [config, currentSupply, numsPrice, playPrice, multiplier]);

  const { chartAbscissa } = chartData;

  const playerActivities = useMemo(() => {
    const price = parseFloat(getNumsPrice() || "0.0");
    return games
      .filter((game) => !!game.over)
      .map((game) => ({
        gameId: `#${game.id}`,
        score: game.level,
        breakEven: chartAbscissa.toString(),
        payout: `+$${(game.reward * price).toFixed(2)}`,
        to: `/game/${game.id}`,
        timestamp: game.over,
        claimed: game.claimed,
        cells: [null, ...game.slots.map((slot) => slot !== 0), null],
      }));
  }, [games]);

  const allActivities = useMemo(() => {
    const price = parseFloat(getNumsPrice() || "0.0");
    return allGames
      .filter((game) => !!game.over)
      .map((game) => ({
        gameId: game.username,
        score: game.level,
        breakEven: chartAbscissa.toString(),
        payout: `+$${(game.reward * price).toFixed(2)}`,
        to: `/game/${game.id}`,
        timestamp: game.over,
        claimed: game.self ? game.claimed : true,
        cells: [null, ...game.slots.map((slot) => slot !== 0), null],
      }));
  }, [allGames]);

  // Transform games for Games component (only non-over games)
  const gamesProps = useMemo(() => {
    // Existing game details
    const now = Date.now();
    const gameData = games
      .filter((game) => !game.over && game.expiration * 1000 > now)
      .map((game) => {
        const gamePlayPrice = Number(game.price) / 10 ** 6;
        const { maxPayout } = ChartHelper.calculate({
          slotCount: game.slot_count,
          currentSupply: game.supply,
          targetSupply: config?.target_supply || 0n,
          numsPrice,
          playPrice: gamePlayPrice,
          multiplier: game.multiplier,
        });
        return {
          gameId: game.id,
          score: game.level === 0 ? undefined : game.level,
          expiration: game.expiration,
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
  }, [games, config, numsPrice, chartData, chartAbscissa, gameId, setGameId]);

  // Set initial gameId to the first active game if available
  useEffect(() => {
    const now = Date.now();
    if (games.length > 0 && gameId === undefined) {
      const firstActiveGame = games.find(
        (g) => !g.over && g.expiration * 1000 > now,
      );
      if (firstActiveGame) {
        setGameId(firstActiveGame.id);
      }
    }
  }, [games, gameId]);

  const handlePurchaseClick = useCallback(() => {
    propose(() => {
      openPurchaseScene();
    });
  }, [propose, openPurchaseScene]);

  const handlePracticeClick = useCallback(() => {
    propose(() => {
      if (currentSupply !== undefined && currentSupply > 0n) {
        clearGame();
        startPractice(currentSupply, multiplier, activeStarterpack?.price);
      }
      navigate("/practice");
    });
  }, [
    propose,
    navigate,
    clearGame,
    startPractice,
    currentSupply,
    multiplier,
    activeStarterpack?.price,
  ]);

  useEffect(() => {
    setTimeout(() => {
      setDefaultLoading(false);
    }, 3000);
  }, []);

  // Show loading state if the page is still loading
  if (loading || defaultLoading) return <LoadingScene />;

  return (
    <HomeScene
      className="md:py-16"
      gameId={gameId}
      games={gamesProps}
      allActivities={{ activities: allActivities }}
      playerActivities={{ activities: playerActivities }}
      onPurchase={handlePurchaseClick}
      onPractice={handlePracticeClick}
    />
  );
};
