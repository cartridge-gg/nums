import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { GameScene } from "@/components/scenes/game";
import { PurchaseScene } from "@/components/scenes/purchase";
import { Selections } from "@/components/containers/selections";
import { Places } from "@/components/containers/places";
import { Uses } from "@/components/containers/uses";
import { GameOver } from "@/components/containers/game-over";
import { useActions } from "@/hooks/actions";
import { usePractice } from "@/context/practice";
import { useGame } from "@/context/games";
import { usePrices } from "@/context/prices";
import { usePurchaseModal } from "@/context/purchase-modal";
import { useGames } from "@/context/games";
import { useEntities } from "@/context/entities";
import { useAudio } from "@/context/audio";
import { useLoading } from "@/context/loading";
import { useHeader } from "@/hooks/header";
import { useMultiplier } from "@/hooks/multiplier";
import type { StageState } from "@/components/elements/stage";
import type { SelectionProps } from "@/components/elements/selection";
import type { PlaceProps } from "@/components/elements/place";
import type { PowerUpProps } from "@/components/elements/power-up";
import { Game as GameModel } from "@/models/game";
import {
  DEFAULT_DRAW_STAGE,
  DEFAULT_MAX_DRAW,
  DEFAULT_POWER_COUNT,
} from "@/constants";
import { Verifier } from "@/helpers";
import { LoadingScene } from "@/components/scenes";
import { useTutorial } from "@/context/tutorial";
import { usePostHog } from "@/context/posthog";
export const Game = () => {
  const {
    data: tutorialData,
    isActive: tutorialActive,
    next: tutorialNext,
  } = useTutorial();

  const { isPracticeMode, set, select, apply, claim } = useActions();
  const { capture } = usePostHog();
  const gameOverFiredRef = useRef<number | null>(null);

  const { game: practiceGame, start: startPractice } = usePractice();
  const { supply: currentSupply, username } = useHeader();
  const { getNumsPrice } = usePrices();
  const { openPurchaseScene } = usePurchaseModal();
  const { playerGames: games } = useGames();
  const { config, starterpacks } = useEntities();

  const activeStarterpack = useMemo(() => starterpacks[0], [starterpacks]);

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
  const { playPositive, playPower } = useAudio();
  const { isLoading, resetAll } = useLoading();
  const { id: idParam } = useParams<{ id: string }>();
  const [showGameOver, setShowGameOver] = useState(false);
  const [showPlacesModal, setShowPlacesModal] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(
    null,
  );
  const [showUsesModal, setShowUsesModal] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [selectedPowerIndex, setSelectedPowerIndex] = useState<number | null>(
    null,
  );
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [defaultLoading, setDefaultLoading] = useState(!isPracticeMode);

  // Get game ID from path params (only in blockchain mode)
  const gameId = useMemo(() => {
    if (isPracticeMode) return null;
    return idParam && !Number.isNaN(Number.parseInt(idParam, 10))
      ? Number.parseInt(idParam, 10)
      : null;
  }, [idParam, isPracticeMode]);

  // Load game data (only in blockchain mode)
  const blockchainGame = useGame(gameId);

  const game = isPracticeMode ? practiceGame : blockchainGame;

  // Track if we've initialized practice game for this practice mode session
  const practiceInitializedRef = useRef(false);

  // Track previous game.over to detect transition false → true (for GameOver)
  const prevOverRef = useRef<number>(0);
  const prevGameIdRef = useRef<number | null>(null);

  // Create a new practice game if none exists when entering practice mode
  // (Game is already cleared and created in home when clicking Practice button)
  useEffect(() => {
    if (!isPracticeMode) {
      // Reset flag when leaving practice mode
      practiceInitializedRef.current = false;
      return;
    }

    if (
      isPracticeMode &&
      !practiceInitializedRef.current &&
      !practiceGame &&
      currentSupply !== undefined &&
      currentSupply > 0n
    ) {
      startPractice(currentSupply, multiplier, activeStarterpack?.price);
      practiceInitializedRef.current = true;
    } else if (isPracticeMode && practiceGame) {
      // Mark as initialized if game already exists
      practiceInitializedRef.current = true;
    }
  }, [isPracticeMode, practiceGame, currentSupply, startPractice, multiplier]);

  // Reset loading states when game model changes (transaction succeeded and data updated)
  useEffect(() => {
    if (!game) return;
    resetAll("slot");
    resetAll("power");
    resetAll("select");
  }, [game, resetAll]);

  const basePrice = useMemo(() => {
    return Number(2000000n) / 10 ** 6;
  }, [config]);

  const numsPrice = useMemo(() => {
    return parseFloat(getNumsPrice() || "0.0");
  }, [getNumsPrice]);

  // Calculate PurchaseScene props from game data
  const purchaseProps = useMemo(() => {
    if (!game || !config) return null;

    return {
      slotCount: game.slot_count,
      basePrice: Number(game.price) / 10 ** 6,
      playPrice: Number(game.price) / 10 ** 6,
      numsPrice,
      multiplier: game.multiplier,
      expiration: game.expiration,
      targetSupply: config.target_supply || 0n,
      currentSupply: game.supply,
    };
  }, [game, config, basePrice, numsPrice]);

  // Transform game data for Game
  const gameProps = useMemo(() => {
    if (!game || !purchaseProps) {
      return {
        powers: Array.from(
          { length: DEFAULT_POWER_COUNT },
          () => ({}),
        ) as PowerUpProps[],
        slots: Array.from({ length: 18 }, () => ({
          value: 0,
          onSlotClick: () => {},
        })),
        stages: Array.from({ length: 18 }, () => ({})),
      };
    }

    const breakEven = game.getBreakEven(purchaseProps.numsPrice);

    let powerIndex = 0;
    const stages: StageState[] = Array.from(
      { length: game.slot_count },
      (_, index) => {
        const stageLevel = index + 1;
        const isCompleted = stageLevel <= game.level;
        const isBreakeven = stageLevel >= breakEven && !isPracticeMode;
        const hasGem =
          stageLevel % DEFAULT_DRAW_STAGE === 0 &&
          stageLevel <= DEFAULT_MAX_DRAW;
        const hasCrown = stageLevel === game.slot_count;

        let isUnlocked = isCompleted;
        if (hasGem) {
          isUnlocked = isCompleted && !!game.selected_powers[powerIndex];
          powerIndex++;
        }

        return {
          completed: isCompleted,
          breakeven: isBreakeven,
          gem: hasGem,
          crown: hasCrown,
          unlocked: isUnlocked,
        };
      },
    );

    // Transform powers: combine enabled_powers and selected_powers
    // Create array of DEFAULT_POWER_COUNT power-ups
    // Map existing selected powers, then add empty ones
    // Ensure enabled_powers has DEFAULT_POWER_COUNT elements
    const enabledPowers = [
      ...game.enabled_powers,
      ...Array(
        Math.max(0, DEFAULT_POWER_COUNT - game.enabled_powers.length),
      ).fill(false),
    ];

    const powersArray: PowerUpProps[] = Array.from(
      { length: DEFAULT_POWER_COUNT },
      (_, index) => {
        const power = game.selected_powers[index];
        if (power && !power.isNone()) {
          // Power exists and is not None
          return {
            power,
            status: enabledPowers[index] ? undefined : "used",
            highlighted: Verifier.isOver(
              game.number,
              game.level,
              game.slot_count,
              game.slots,
            ),
          };
        } else {
          // Empty slot (no power or None power)
          return {
            power: undefined, // No power for empty slot
            status: undefined,
            highlighted: false,
          };
        }
      },
    );

    // Check if any slot is loading
    const hasSlotLoading = game.slots.some((_, index) =>
      isLoading("slot", index),
    );

    // Check if any power is loading
    const hasPowerLoading = powersArray.some((_, index) =>
      isLoading("power", index),
    );

    const isOver = game.over > 0;
    const isSelectable = game.selectable_powers.length > 0;
    const onInstruction =
      isOver && !showGameOver
        ? () => {
            setShowGameOver(true);
          }
        : isSelectable && !showSelectionModal
          ? () => {
              setShowSelectionModal(true);
            }
          : undefined;

    return {
      powers: powersArray.map((power, index) => ({
        ...power,
        loading: isLoading("power", index),
        onClick: () => {
          if (power.power && !power.power.isNone()) {
            setSelectedPowerIndex(index);
            setShowUsesModal(true);
            if (tutorialActive) tutorialNext();
          }
        },
        disabled:
          isOver ||
          !power.power ||
          power.power.isNone() ||
          hasPowerLoading ||
          hasSlotLoading ||
          isSelectable ||
          (tutorialActive &&
            (!tutorialData?.anchor ||
              tutorialData.disabled ||
              tutorialData.anchor.type !== "power" ||
              (tutorialData.anchor as { type: "power"; index: number })
                .index !== index)),
      })),
      onGameInfo: () => {
        setShowPurchaseModal(true);
      },
      onInstruction: onInstruction,
      slots: game.slots.map((slot, index) => {
        const slotLoading = isLoading("slot", index);
        return {
          value: slot,
          highlight: isOver,
          trap: game.getTrap(index),
          inactive: game.isInactive(index),
          loading: slotLoading,
          disabled:
            (hasSlotLoading && !slotLoading) ||
            isOver ||
            isSelectable ||
            (tutorialActive &&
              (!tutorialData?.anchor ||
                tutorialData.disabled ||
                tutorialData.anchor.type !== "slot" ||
                (tutorialData.anchor as { type: "slot"; index: number })
                  .index !== index)),
          onSlotClick: () => {
            const trap = game.getTrap(index);
            if (trap && !trap.isNone() && !game.isInactive(index)) {
              // If slot has a trap, open the modal
              setSelectedSlotIndex(index);
              setShowPlacesModal(true);
              if (tutorialActive) tutorialNext();
            } else {
              // On desktop or no trap, call set directly
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
    showGameOver,
    showSelectionModal,
    isPracticeMode,
    set,
    setShowPlacesModal,
    setSelectedSlotIndex,
    setShowUsesModal,
    setSelectedPowerIndex,
    isLoading,
    setShowGameOver,
    setShowSelectionModal,
    tutorialActive,
    tutorialNext,
    tutorialData?.anchor,
    tutorialData?.disabled,
  ]);

  // Check if selectable powers exist and create selections
  const hasSelectablePowers = useMemo(() => {
    return game && game.selectable_powers.length > 0;
  }, [game]);

  const selections = useMemo<SelectionProps[]>(() => {
    if (!game || !hasSelectablePowers) return [];
    const hasAnyLoading = game.selectable_powers.some((_, i) =>
      isLoading("select", i),
    );
    return game.selectable_powers.map((power, index) => ({
      power,
      loading: isLoading("select", index),
      disabled: hasAnyLoading && !isLoading("select", index),
      onClick: () => {
        playPower();
        select(game.id, index);
      },
    }));
  }, [game, hasSelectablePowers, select, isLoading, setShowSelectionModal]);

  // Show GameOver modal when game.over transitions from false to true (not on claimed)
  useEffect(() => {
    if (!game) {
      prevOverRef.current = 0;
      prevGameIdRef.current = null;
      setShowGameOver(false);
      return;
    }

    // Reset refs when switching to a different game
    if (prevGameIdRef.current !== game.id) {
      prevGameIdRef.current = game.id;
      prevOverRef.current = game.over;
    }

    if (game.over === 0) {
      prevOverRef.current = 0;
      setShowGameOver(false);
      return;
    }

    // Transition: game.over went from 0 to > 0
    if (prevOverRef.current === 0) {
      playPositive();
      if (gameOverFiredRef.current !== game.id) {
        const slotsFilled = game.slots.filter((s: number) => s > 0).length;
        capture("game_over", {
          game_id: game.id,
          score: game.level,
          slots_filled: slotsFilled,
          mode: isPracticeMode ? "practice" : "real",
        });
        gameOverFiredRef.current = game.id;
      }
      const timer = setTimeout(() => {
        setShowGameOver(true);
      }, 2000);
      prevOverRef.current = game.over;
      return () => clearTimeout(timer);
    }

    prevOverRef.current = game.over;
  }, [game, playPositive, capture, isPracticeMode]);

  // Track practice/tutorial mode entry
  useEffect(() => {
    if (isPracticeMode) {
      const mode =
        window.location.pathname === "/tutorial"
          ? "tutorial_started"
          : "practice_mode_started";
      capture(mode, {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- fire once on mount

  // Show Selection modal after 2 seconds when selectable
  useEffect(() => {
    if (hasSelectablePowers && selections.length > 0) {
      if (tutorialActive) {
        setShowSelectionModal(true);
      } else {
        const timer = setTimeout(() => {
          setShowSelectionModal(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    } else {
      setShowSelectionModal(false);
    }
  }, [hasSelectablePowers, selections, tutorialActive]);

  // Calculate GameOver props
  const gameOverData = useMemo(() => {
    if (!game) return null;

    const numsPrice = getNumsPrice();
    const price = numsPrice ? parseFloat(numsPrice) : 0.0; // Default fallback
    const payout = game.reward;
    const value = payout * price;
    const score = game.level;
    const newGames = GameModel.deduplicate([game, ...games])
      .filter((g) => !g.over && !g.isExpired())
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

  const handlePlayAgain = useCallback(() => {
    if (isPracticeMode) {
      // Start a new practice game
      startPractice(currentSupply, multiplier, activeStarterpack?.price);
      setShowGameOver(false);
    }
  }, [isPracticeMode, startPractice, currentSupply, multiplier]);

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
        set(game.id, selectedSlotIndex);
        setShowPlacesModal(false);
        setSelectedSlotIndex(null);
        if (tutorialActive) tutorialNext();
      },
    };
  }, [game, selectedSlotIndex, set, isLoading, tutorialActive, tutorialNext]);

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
        apply(game.id, selectedPowerIndex);
        setShowUsesModal(false);
        setSelectedPowerIndex(null);
        if (tutorialActive) tutorialNext();
      },
    };
  }, [
    game,
    selectedPowerIndex,
    apply,
    isLoading,
    tutorialActive,
    tutorialNext,
  ]);

  const handleCloseUsesModal = useCallback(() => {
    setShowUsesModal(false);
    setSelectedPowerIndex(null);
  }, []);

  const handleClosePurchaseModal = useCallback(() => {
    setShowPurchaseModal(false);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setDefaultLoading(false);
    }, 2000);
  }, []);

  // Show loading state if game is not loaded
  if (!game || defaultLoading) return <LoadingScene />;

  return (
    <div className="flex items-center justify-center h-full">
      <GameScene
        key={game.id}
        game={game}
        multiplier={
          isPracticeMode
            ? 0
            : (starterpacks.find((sp) => sp.price === game.price)?.multiplier ??
              game.multiplier)
        }
        powers={gameProps.powers}
        slots={gameProps.slots}
        stages={gameProps.stages}
        share={
          blockchainGame
            ? {
                gameId: game.id,
                score: game.level,
                slots: game.slots,
                number: game.number,
                username,
              }
            : undefined
        }
        onGameInfo={blockchainGame ? gameProps.onGameInfo : undefined}
        onInstruction={gameProps.onInstruction}
        className="md:max-h-[588px] p-4 md:px-0 md:py-0"
      />
      {/* Overlay and Selections modal when selectable powers exist */}
      {showSelectionModal &&
        (!tutorialActive || tutorialData?.anchor?.type === "select") && (
          <>
            {/* Overlay to block interactions with Game */}
            <div className="absolute inset-0 bg-black-900/80 z-40" />
            {/* Selections modal */}
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
              <Selections
                selections={selections}
                onClose={() => setShowSelectionModal(false)}
                className="max-w-2xl w-full"
              />
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
        <div className="absolute inset-0 z-50 flex items-center justify-center m-3 md:m-6">
          <PurchaseScene
            slotCount={purchaseProps.slotCount}
            basePrice={purchaseProps.basePrice}
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
        <div className="absolute inset-0 z-50 flex-1 bg-black-700 backdrop-blur-[4px]">
          <div className="absolute inset-0 z-50 flex items-center justify-center m-3 md:m-6">
            <GameOver
              stages={{ states: gameProps.stages }}
              payout={gameOverData.payout}
              value={gameOverData.value}
              score={gameOverData.score}
              newGameId={gameOverData.newGameId}
              newGameCount={gameOverData.newGameCount}
              shareProps={
                blockchainGame
                  ? {
                      gameId: game.id,
                      score: game.level,
                      slots: game.slots,
                      number: game.number,
                      username,
                    }
                  : undefined
              }
              onClose={() => setShowGameOver(false)}
              onPurchase={() => openPurchaseScene()}
              onClaim={
                isPracticeMode ? null : game.claimed ? undefined : handleClaim
              }
              onPlayAgain={isPracticeMode ? handlePlayAgain : undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
};
