import { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { GameScene } from "@/components/layouts/game-scene";
import { Selections } from "@/components/containers/selections";
import { Places } from "@/components/containers/places";
import { Uses } from "@/components/containers/uses";
import { GameOver } from "@/components/containers/game-over";
import { useActions } from "@/hooks/actions";
import { useGame } from "@/hooks/game";
import { usePrices } from "@/context/prices";
import { usePurchaseModal } from "@/context/purchase-modal";
import { useAssets } from "@/hooks/assets";
import { useGames } from "@/hooks/games";
import type { StageState } from "@/components/elements/stage";
import type { SelectionProps } from "@/components/elements/selection";
import type { PlaceProps } from "@/components/elements/place";
import type { PowerUpProps } from "@/components/elements/power-up";
import { Game as GameModel } from "@/models/game";

export const Game = () => {
  const { set, select, apply, claim } = useActions();
  const { getNumsPrice } = usePrices();
  const { openPurchaseScene } = usePurchaseModal();
  const { gameIds } = useAssets();
  const { games } = useGames(gameIds);
  const [searchParams] = useSearchParams();
  const [showGameOver, setShowGameOver] = useState(false);
  const [showPlacesModal, setShowPlacesModal] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(
    null,
  );
  const [showUsesModal, setShowUsesModal] = useState(false);
  const [selectedPowerIndex, setSelectedPowerIndex] = useState<number | null>(
    null,
  );

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
        powers: Array.from({ length: 3 }, () => ({})),
        slots: Array.from({ length: 20 }, () => ({
          value: 0,
          onSlotClick: () => {},
        })),
        stages: Array.from({ length: 18 }, () => ({})),
      };
    }

    // Transform powers: combine available_powers and selected_powers
    const powers: PowerUpProps[] = game.selected_powers.map((power, index) => ({
      power,
      status:
        !power.isNone() && game.available_powers[index] ? undefined : "used",
    }));

    // Calculate stages based on level and rewards
    const stages: StageState[] = Array.from({ length: 18 }, (_, index) => {
      const stageLevel = index + 3;
      const isCompleted = stageLevel <= game.level + 2;
      const isBreakeven = index === 13;

      // Determine if stage has gem (simplified logic - can be enhanced)
      const hasGem = stageLevel % 6 === 0;

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
        onClick: () => {
          // Open Uses modal instead of calling apply directly
          setSelectedPowerIndex(index);
          setShowUsesModal(true);
        },
        disabled: game.over,
      })),
      slots: game.slots.map((slot, index) => ({
        value: slot,
        trap: game.getTrap(index),
        inactive: game.isInactive(index),
        onSlotClick: () => {
          const trap = game.getTrap(index);
          if (trap && !trap.isNone()) {
            // If slot has a trap, open the modal
            setSelectedSlotIndex(index);
            setShowPlacesModal(true);
          } else {
            // If no trap, call set directly
            set(game.id, index);
          }
        },
      })),
      stages,
    };
  }, [
    game,
    set,
    setShowPlacesModal,
    setSelectedSlotIndex,
    setShowUsesModal,
    setSelectedPowerIndex,
  ]);

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

  // Calculate GameOver props
  const gameOverData = useMemo(() => {
    if (!game) return null;

    const numsPrice = getNumsPrice();
    const price = numsPrice ? parseFloat(numsPrice) : 0.0; // Default fallback
    const payout = game.reward;
    const value = payout * price;
    const score = game.level;
    const newGames = GameModel.deduplicate([game, ...games])
      .filter((g) => !g.over)
      .sort((a, b) => b.id - a.id);
    const newGameId = newGames[0]?.id || 0;
    const newGameCount = newGames.length;

    return {
      payout,
      value,
      score,
      newGameId,
      newGameCount,
    };
  }, [game, getNumsPrice, games]);

  const handleClaim = useCallback(() => {
    if (!game || game.claimed) return;
    claim(game.id);
  }, [game, claim]);

  const handleSpecate = useCallback(() => {
    setShowGameOver(false);
  }, [setShowGameOver]);

  const handlePurchase = useCallback(() => {
    openPurchaseScene();
  }, [openPurchaseScene]);

  // Create place props for the modal (only the trap on the selected slot)
  const place = useMemo<PlaceProps | null>(() => {
    if (!game || selectedSlotIndex === null) return null;

    // Get the trap on the selected slot
    const trap = game.getTrap(selectedSlotIndex);
    if (!trap || trap.isNone()) return null;

    // Return single trap
    return {
      trap,
      onClick: () => {
        // Call set with the selected slot index
        set(game.id, selectedSlotIndex);
        // Close the modal
        setShowPlacesModal(false);
        setSelectedSlotIndex(null);
      },
    };
  }, [game, selectedSlotIndex, set]);

  const handleClosePlacesModal = useCallback(() => {
    setShowPlacesModal(false);
    setSelectedSlotIndex(null);
  }, []);

  // Create use props for the modal (only the power at the selected index)
  const use = useMemo<SelectionProps | null>(() => {
    if (!game || selectedPowerIndex === null) return null;

    // Get the power at the selected index
    const power = game.selected_powers[selectedPowerIndex];
    if (!power || power.isNone()) return null;

    // Return single power
    return {
      power,
      onClick: () => {
        // Call apply with the selected power index
        apply(game.id, selectedPowerIndex);
        // Close the modal
        setShowUsesModal(false);
        setSelectedPowerIndex(null);
      },
    };
  }, [game, selectedPowerIndex, apply]);

  const handleCloseUsesModal = useCallback(() => {
    setShowUsesModal(false);
    setSelectedPowerIndex(null);
  }, []);

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
        key={game.id}
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
      {/* Overlay and Places modal when selecting a trap */}
      {showPlacesModal && place && (
        <>
          {/* Overlay to block interactions with GameScene */}
          <div className="absolute inset-0 bg-black-900/80 z-40" />
          {/* Places modal */}
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            <Places
              place={place}
              onClose={handleClosePlacesModal}
              className="w-full md:max-w-[416px]"
            />
          </div>
        </>
      )}
      {/* Overlay and Uses modal when selecting a power up */}
      {showUsesModal && use && (
        <>
          {/* Overlay to block interactions with GameScene */}
          <div className="absolute inset-0 bg-black-900/80 z-40" />
          {/* Uses modal */}
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            <Uses
              use={use}
              onClose={handleCloseUsesModal}
              className="w-full md:max-w-[416px]"
            />
          </div>
        </>
      )}
      {/* Overlay and GameOver modal when game is over */}
      {showGameOver && gameOverData && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
          <GameOver
            stages={{ states: gameSceneData.stages }}
            payout={gameOverData.payout}
            value={gameOverData.value}
            score={gameOverData.score}
            newGameId={gameOverData.newGameId}
            newGameCount={gameOverData.newGameCount}
            onSpecate={handleSpecate}
            onPurchase={handlePurchase}
            onClaim={game.claimed ? undefined : handleClaim}
          />
        </div>
      )}
    </>
  );
};
