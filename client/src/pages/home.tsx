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

const DEFAULT_SUPPLY = 1000n;

export const Home = () => {
  const navigate = usePreserveSearchNavigate();
  const { account } = useAccount();
  const { config, starterpacks } = useEntities();
  const { getNumsPrice } = usePrices();
  const { supply: currentSupply, handleConnect } = useHeader();
  const { games, loading } = useGames();
  const {
    clearGame,
    start: startPractice,
    history: practiceHistory,
  } = usePractice();
  const [defaultLoading, setDefaultLoading] = useState(true);
  const [gameId, setGameId] = useState<number | undefined>(undefined);

  const isConnected = !!account?.address;

  const effectiveSupply =
    currentSupply !== undefined && currentSupply > 0n
      ? currentSupply
      : DEFAULT_SUPPLY;

  const numsPrice = useMemo(() => {
    return parseFloat(getNumsPrice() || "0.0");
  }, [getNumsPrice]);

  const playPrice = useMemo(() => {
    return Number(config?.entry_price || 0n) / 10 ** 6;
  }, [config]);

  const chartData = useMemo(() => {
    return ChartHelper.calculate({
      slotCount: config?.slot_count || 20,
      currentSupply: effectiveSupply,
      targetSupply: config?.target_supply || 0n,
      numsPrice: numsPrice,
      playPrice,
      multiplier: 1,
    });
  }, [config, effectiveSupply, numsPrice, playPrice]);

  const { chartAbscissa } = chartData;

  const activities = useMemo(() => {
    const price = parseFloat(getNumsPrice() || "0.0");

    // Blockchain game activities
    const blockchainActivities = games
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

    // Practice game activities
    const practiceActivities = practiceHistory.map((activity) => ({
      gameId: activity.gameId,
      score: activity.score,
      breakEven: "0",
      payout: "Practice",
      to: "#",
      timestamp: activity.timestamp,
      claimed: true,
    }));

    return [...blockchainActivities, ...practiceActivities].sort(
      (a, b) => b.timestamp - a.timestamp,
    );
  }, [games, practiceHistory, getNumsPrice, chartAbscissa]);

  // Transform games for Games component (only non-over games, no new game card)
  const gamesProps = useMemo(() => {
    const now = Date.now();
    const gameData = games
      .filter((game) => !game.over && game.expiration * 1000 > now)
      .map((game) => {
        const starterpack = starterpacks.find(
          (sp) => sp.multiplier === game.multiplier,
        );
        const spPrice = Number(starterpack?.price || 0n) / 10 ** 6;
        const { maxPayout } = ChartHelper.calculate({
          slotCount: game.slot_count,
          currentSupply: game.supply,
          targetSupply: config?.target_supply || 0n,
          numsPrice: numsPrice,
          playPrice: spPrice,
          multiplier: game.multiplier,
        });
        return {
          gameId: game.id,
          score: game.level === 0 ? undefined : game.level,
          expiration: game.expiration,
          payout: `$${maxPayout.toFixed(2)}`,
        };
      });

    if (gameData.length === 0) return undefined;

    return {
      games: gameData,
      gameId,
      setGameId,
    };
  }, [starterpacks, games, config, numsPrice, gameId, setGameId]);

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

  const handlePracticeClick = useCallback(() => {
    clearGame();
    startPractice(effectiveSupply);
    navigate("/practice");
  }, [navigate, clearGame, startPractice, effectiveSupply]);

  useEffect(() => {
    setTimeout(() => {
      setDefaultLoading(false);
    }, 3000);
  }, []);

  if (loading || defaultLoading) return <LoadingScene />;

  return (
    <HomeScene
      className="md:p-16"
      gameId={gameId}
      gamesProps={gamesProps}
      activitiesProps={{ activities }}
      isConnected={isConnected}
      onConnect={handleConnect}
      onPractice={handlePracticeClick}
    />
  );
};
