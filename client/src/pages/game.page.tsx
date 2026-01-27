import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { GameScene } from "@/components/layouts/game-scene";
import { Selections } from "@/components/containers/selections";
import { GameOver } from "@/components/containers/game-over";
import { useActions } from "@/hooks/actions";
import { useGame } from "@/hooks/game";
import { usePrices } from "@/context/prices";
import type { StageState } from "@/components/elements/stage";
import type { SelectionProps } from "@/components/elements/selection";
import type { PowerUpProps } from "@/components/elements/power-up";
import type { StatProps } from "@/components/elements/stat";

export const Game = () => {
  const { set, select, apply } = useActions();
  const { getNumsPrice } = usePrices();
  const [searchParams] = useSearchParams();
  const [showGameOver, setShowGameOver] = useState(false);

  // Get game ID from search params
  const gameId = useMemo(() => {
    const idParam = searchParams.get("id");
    return idParam ? parseInt(idParam, 10) : null;
  }, [searchParams]);

  // Load game data
  const game = useGame(gameId);

  // Transform game data for GameScene
  const gameSceneData = useMemo(() => {
    if (!game) {
      return {
        currentNumber: 0,
        nextNumber: 0,
        powers: Array.from({ length: 4 }, () => ({})),
        slots: Array.from({ length: 20 }, () => ({
          value: 0,
          onSlotClick: () => {},
        })),
        stages: Array.from({ length: 20 }, () => ({})),
      };
    }

    // Transform powers: combine available_powers and selected_powers
    const powers: PowerUpProps[] = game.selected_powers.map((power, index) => ({
      power,
      status:
        !power.isNone() && game.available_powers[index] ? undefined : "used",
    }));

    // Calculate stages based on level and rewards
    const stages: StageState[] = Array.from({ length: 20 }, (_, index) => {
      const stageLevel = index + 1;
      const isCompleted = stageLevel <= game.level;
      const isBreakeven = index === 13;

      // Determine if stage has gem (simplified logic - can be enhanced)
      const hasGem = stageLevel % 4 === 0;

      // Determine if stage has crown (last stage)
      const hasCrown = stageLevel === 20;

      return {
        completed: isCompleted,
        breakeven: isBreakeven,
        gem: hasGem,
        crown: hasCrown,
      };
    });

    return {
      currentNumber: game.number,
      nextNumber: game.next_number,
      powers: powers.map((power, index) => ({
        ...power,
        onClick: () => apply(game.id, index),
        disabled: game.over,
      })),
      slots: game.slots.map((slot, index) => ({
        value: slot,
        onSlotClick: () => set(game.id, index),
      })),
      stages,
    };
  }, [game, set]);

  // Check if selectable powers exist and create selections
  const hasSelectablePowers = useMemo(() => {
    return game && game.selectable_powers.length > 0;
  }, [game]);

  const selections = useMemo<SelectionProps[]>(() => {
    if (!game || !hasSelectablePowers) return [];
    return game.selectable_powers.map((power, index) => ({
      power,
      onClick: () => select(game.id, index),
    }));
  }, [game, hasSelectablePowers, select]);

  // Show GameOver modal after 2 seconds when game is over
  useEffect(() => {
    if (game?.over) {
      const timer = setTimeout(() => {
        setShowGameOver(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShowGameOver(false);
    }
  }, [game?.over]);

  // Calculate stats for GameOver
  const gameOverStats = useMemo<StatProps[]>(() => {
    if (!game) return [];

    const numsPrice = getNumsPrice();
    const price = numsPrice ? parseFloat(numsPrice) : 0.003; // Default fallback
    const rewardInUsd = (game.reward / 1e18) * price;

    return [
      {
        title: "score",
        content: game.level.toString(),
      },
      {
        title: "earned",
        content: `${(game.reward / 1e18).toLocaleString()} Nums ~ $${rewardInUsd.toFixed(2)}`,
      },
    ];
  }, [game, getNumsPrice]);

  // Show loading state if game ID is invalid or game is not loaded
  if (!gameId || !game) {
    return (
      <div className="text-white-100 text-xl">
        {!gameId ? "Game ID not found" : "Loading game..."}
      </div>
    );
  }

  return (
    <>
      <GameScene
        currentNumber={gameSceneData.currentNumber}
        nextNumber={gameSceneData.nextNumber}
        powers={gameSceneData.powers}
        slots={gameSceneData.slots}
        stages={gameSceneData.stages}
        className="md:max-h-[588px] p-6 pb-8 md:p-0 md:pb-0"
      />
      {/* Overlay and Selections modal when selectable powers exist */}
      {hasSelectablePowers && selections.length > 0 && (
        <>
          {/* Overlay to block interactions with GameScene */}
          <div className="absolute inset-0 bg-black-900/80 z-40" />
          {/* Selections modal */}
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            <Selections selections={selections} className="max-w-2xl w-full" />
          </div>
        </>
      )}
      {/* Overlay and GameOver modal when game is over */}
      {showGameOver && gameOverStats.length > 0 && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
          <GameOver stats={gameOverStats} />
        </div>
      )}
    </>
  );
};
