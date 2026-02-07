import { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { GameScene } from "@/components/scenes/game";
import { PurchaseScene } from "@/components/scenes/purchase";
import { Selections } from "@/components/containers/selections";
import { Places } from "@/components/containers/places";
import { Uses } from "@/components/containers/uses";
import { GameOver } from "@/components/containers/game-over";
import { useActions } from "@/hooks/actions";
import { useGame } from "@/hooks/game";
import { usePrices } from "@/context/prices";
import { usePurchaseModal } from "@/context/purchase-modal";
import { useGames } from "@/hooks/games";
import { useEntities } from "@/context/entities";
import { useLoading } from "@/context/loading";
import type { StageState } from "@/components/elements/stage";
import type { SelectionProps } from "@/components/elements/selection";
import type { PlaceProps } from "@/components/elements/place";
import type { PowerUpProps } from "@/components/elements/power-up";
import { Game as GameModel } from "@/models/game";
import { ChartHelper, Verifier } from "@/helpers";

export const Game = () => {
  const { set, select, apply, claim } = useActions();
  const { getNumsPrice } = usePrices();
  const { openPurchaseScene } = usePurchaseModal();
  const { games } = useGames();
  const { config, starterpack } = useEntities();
  const { isLoading, setLoading } = useLoading();
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
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Get game ID from search params
  const gameId = useMemo(() => {
    const idParam = searchParams.get("id");
    return idParam ? parseInt(idParam, 10) : null;
  }, [searchParams]);

  // Load game data
  const game = useGame(gameId);

  // Reset loading states when game model changes (transaction succeeded and data updated)
  useEffect(() => {
    if (!game) return;

    // Game model changed - reset loading states for slots/powers that are currently loading
    // This handles the latency between transaction success and data push

    // Reset slot loading states that are currently active (slots are 0-17)
    for (let i = 0; i < game.slot_count; i++) {
      setLoading("slot", i, false);
    }

    // Reset power loading states that are currently active (powers are 0-2)
    for (let i = 0; i < game.selected_powers.length; i++) {
      setLoading("power", i, false);
    }
  }, [game, setLoading]);

  const playPrice = useMemo(() => {
    return Number(starterpack?.price || 0n) / 10 ** 6 || 0;
  }, [starterpack]);

  const numsPrice = useMemo(() => {
    return parseFloat(getNumsPrice() || "0.0");
  }, [getNumsPrice]);

  // Calculate PurchaseScene props from game data
  const purchaseProps = useMemo(() => {
    if (!game || !config) return null;

    return {
      slotCount: game.slot_count,
      playPrice,
      numsPrice,
      multiplier: "1.0x",
      expiration: game.expiration,
      targetSupply: config.target_supply || 0n,
      currentSupply: game.supply,
    };
  }, [game, config, playPrice, numsPrice]);

  // Transform game data for Game
  const gameProps = useMemo(() => {
    if (!game || !purchaseProps) {
      return {
        powers: Array.from({ length: 3 }, () => ({})) as PowerUpProps[],
        slots: Array.from({ length: 18 }, () => ({
          value: 0,
          onSlotClick: () => {},
        })),
        stages: Array.from({ length: 18 }, () => ({})),
      };
    }

    const { chartAbscissa: breakEven } = ChartHelper.calculate({
      slotCount: purchaseProps.slotCount,
      currentSupply: purchaseProps.currentSupply,
      targetSupply: purchaseProps.targetSupply,
      numsPrice: purchaseProps.numsPrice,
      playPrice: purchaseProps.playPrice,
    });

    // Calculate stages based on level and rewards
    const stages: StageState[] = Array.from(
      { length: game.slot_count },
      (_, index) => {
        const stageLevel = index + 1;
        const isCompleted = stageLevel <= game.level;
        const isBreakeven = stageLevel >= breakEven;

        // Determine if stage has gem (simplified logic - can be enhanced)
        const hasGem = stageLevel % 4 === 0 && stageLevel <= 15;

        // Determine if stage has crown (last stage)
        const hasCrown = stageLevel === game.slot_count;

        return {
          completed: isCompleted,
          breakeven: isBreakeven,
          gem: hasGem,
          crown: hasCrown,
        };
      },
    );

    // Transform powers: combine available_powers and selected_powers
    const basePowers: PowerUpProps[] = game.selected_powers.map(
      (power, index) => ({
        power,
        status:
          !power.isNone() && game.available_powers[index] ? undefined : "used",
        highlighted:
          Verifier.isOver(
            game.number,
            game.level,
            game.slot_count,
            game.slots,
          ) && power.rescue(game),
      }),
    );

    // Check if any slot is loading
    const hasSlotLoading = game.slots.some((_, index) =>
      isLoading("slot", index),
    );

    return {
      powers: basePowers.map((power, index) => ({
        ...power,
        onClick: () => {
          // Open Uses modal instead of calling apply directly
          setSelectedPowerIndex(index);
          setShowUsesModal(true);
        },
        disabled: !!game.over || isLoading("power", index) || hasSlotLoading,
      })),
      onGameInfoClick: () => {
        setShowPurchaseModal(true);
      },
      slots: game.slots.map((slot, index) => {
        const slotLoading = isLoading("slot", index);
        return {
          value: slot,
          trap: game.getTrap(index),
          inactive: game.isInactive(index),
          loading: slotLoading,
          disabled: hasSlotLoading && !slotLoading, // Disable other slots when one is loading
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
        };
      }),
      stages,
    };
  }, [
    game,
    purchaseProps,
    set,
    setShowPlacesModal,
    setSelectedSlotIndex,
    setShowUsesModal,
    setSelectedPowerIndex,
    isLoading,
  ]);

  // Check if selectable powers exist and create selections
  const hasSelectablePowers = useMemo(() => {
    return game && game.selectable_powers.length > 0;
  }, [game]);

  const selections = useMemo<SelectionProps[]>(() => {
    if (!game || !hasSelectablePowers) return [];
    return game.selectable_powers.map((power, index) => ({
      power,
      loading: isLoading("power", index),
      onClick: () => select(game.id, index),
    }));
  }, [game, hasSelectablePowers, select, isLoading]);

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
      loading: isLoading("slot", selectedSlotIndex),
      onClick: () => {
        // Call set with the selected slot index
        set(game.id, selectedSlotIndex);
        // Close the modal
        setShowPlacesModal(false);
        setSelectedSlotIndex(null);
      },
    };
  }, [game, selectedSlotIndex, set, isLoading]);

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
      loading: isLoading("power", selectedPowerIndex),
      onClick: () => {
        // Call apply with the selected power index
        apply(game.id, selectedPowerIndex);
        // Close the modal
        setShowUsesModal(false);
        setSelectedPowerIndex(null);
      },
    };
  }, [game, selectedPowerIndex, apply, isLoading]);

  const handleCloseUsesModal = useCallback(() => {
    setShowUsesModal(false);
    setSelectedPowerIndex(null);
  }, []);

  const handleClosePurchaseModal = useCallback(() => {
    setShowPurchaseModal(false);
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
        game={game}
        powers={gameProps.powers}
        slots={gameProps.slots}
        stages={gameProps.stages}
        onGameInfoClick={gameProps.onGameInfoClick}
        className="md:max-h-[588px] p-3 md:p-0 md:pb-0"
      />
      {/* Overlay and Selections modal when selectable powers exist */}
      {hasSelectablePowers && selections.length > 0 && (
        <>
          {/* Overlay to block interactions with Game */}
          <div className="absolute inset-0 bg-black-900/80 z-40" />
          {/* Selections modal */}
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            <Selections selections={selections} className="max-w-2xl w-full" />
          </div>
        </>
      )}
      {/* Overlay and Places modal when selecting a trap */}
      {showPlacesModal && place && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
          <Places
            place={place}
            onClose={handleClosePlacesModal}
            className="w-full md:max-w-[416px]"
          />
        </div>
      )}
      {/* Overlay and Uses modal when selecting a power up */}
      {showUsesModal && use && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
          <Uses
            use={use}
            onClose={handleCloseUsesModal}
            className="w-full md:max-w-[416px]"
          />
        </div>
      )}
      {/* Overlay and PurchaseScene modal when GameInfo is clicked */}
      {showPurchaseModal && purchaseProps && (
        <div className="absolute inset-0 z-50 flex items-center justify-center m-2 md:m-6">
          <PurchaseScene
            slotCount={purchaseProps.slotCount}
            playPrice={purchaseProps.playPrice}
            numsPrice={purchaseProps.numsPrice}
            multiplier={purchaseProps.multiplier}
            expiration={purchaseProps.expiration}
            targetSupply={purchaseProps.targetSupply}
            currentSupply={purchaseProps.currentSupply}
            onClose={handleClosePurchaseModal}
            className="h-full w-full md:p-12 md:h-auto md:w-auto md:min-w-[848px]"
          />
        </div>
      )}
      {/* Overlay and GameOver modal when game is over */}
      {showGameOver && gameOverData && (
        <div className="absolute inset-0 z-50 flex items-center justify-center m-2 md:m-6">
          <GameOver
            stages={{ states: gameProps.stages }}
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
