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
  const { games: blockchainGames } = useGames();
  const {
    clearGame,
    start: startPractice,
    games: practiceGames,
    continueGame,
  } = usePractice();
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
    const blockchainActivities = blockchainGames
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

    // Practice game activities (completed games only)
    const practiceActivities = practiceGames
      .filter((game) => game.over > 0)
      .map((game) => ({
        gameId: game.id,
        score: game.level,
        breakEven: "0",
        payout: "Practice",
        to: "#",
        timestamp: game.over,
        claimed: true,
      }));

    return [...blockchainActivities, ...practiceActivities].sort(
      (a, b) => b.timestamp - a.timestamp,
    );
  }, [blockchainGames, practiceGames, getNumsPrice, chartAbscissa]);

  // Build games carousel from blockchain + active practice games
  const gamesProps = useMemo(() => {
    const now = Date.now();

    // Active blockchain games
    const blockchainGameData = blockchainGames
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

    // Active practice games
    const practiceGameData = practiceGames
      .filter((game) => game.over === 0)
      .map((game) => ({
        gameId: game.id,
        score: game.level === 0 ? undefined : game.level,
        expiration: game.expiration,
        payout: "Practice",
      }));

    const allGames = [...blockchainGameData, ...practiceGameData];
    if (allGames.length === 0) return undefined;

    return {
      games: allGames,
      gameId,
      setGameId,
    };
  }, [
    starterpacks,
    blockchainGames,
    practiceGames,
    config,
    numsPrice,
    gameId,
    setGameId,
  ]);

  // Set initial gameId to the first active game
  useEffect(() => {
    const now = Date.now();
    if (gameId !== undefined) return;

    const firstBlockchainGame = blockchainGames.find(
      (g) => !g.over && g.expiration * 1000 > now,
    );
    if (firstBlockchainGame) {
      setGameId(firstBlockchainGame.id);
      return;
    }

    const firstPracticeGame = practiceGames.find((g) => g.over === 0);
    if (firstPracticeGame) {
      setGameId(firstPracticeGame.id);
    }
  }, [blockchainGames, practiceGames, gameId]);

  const handlePracticeClick = useCallback(() => {
    clearGame();
    startPractice(effectiveSupply);
    navigate("/practice");
  }, [navigate, clearGame, startPractice, effectiveSupply]);

  const handleContinueClick = useCallback(() => {
    if (!gameId) return;

    // Check if it's a practice game
    const practiceGame = practiceGames.find(
      (g) => g.id === gameId && g.over === 0,
    );
    if (practiceGame) {
      continueGame(gameId);
      navigate("/practice");
      return;
    }

    // Otherwise it's a blockchain game
    navigate(`/game/${gameId}`);
  }, [gameId, practiceGames, continueGame, navigate]);

  return (
    <HomeScene
      className="md:p-16"
      gameId={gameId}
      gamesProps={gamesProps}
      activitiesProps={{ activities }}
      isConnected={isConnected}
      onConnect={handleConnect}
      onPractice={handlePracticeClick}
      onContinue={handleContinueClick}
    />
  );
};
