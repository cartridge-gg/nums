import type React from "react";
import { createContext, useCallback, useContext, useState } from "react";
import { Game } from "@/models/game";
import { Random } from "@/helpers/random";
import { Trap } from "@/types/trap";
import { useHeader } from "@/hooks/header";
import {
  DEFAULT_SLOT_COUNT,
  DEFAULT_SLOT_MIN,
  DEFAULT_SLOT_MAX,
  DEFAULT_MULTIPLIER,
  DEFAULT_POWER_COUNT,
} from "@/constants";

interface PracticeContextType {
  game: Game | null;
  start: (supply?: bigint) => void;
  setGame: (game: Game | null) => void;
  clearGame: () => void;
}

const PracticeContext = createContext<PracticeContextType>({
  game: null,
  start: (_supply?: bigint) => {},
  setGame: () => {},
  clearGame: () => {},
});

export const usePractice = () => useContext(PracticeContext);

/**
 * Create a new practice game
 */
const createPracticeGame = (supply: bigint): Game => {
  const gameId = Math.floor(Math.random() * 1000000);
  const mockTimestamp = Math.floor(Date.now() / 1000);

  const game = new Game(
    gameId,
    false, // claimed
    DEFAULT_MULTIPLIER,
    0, // level
    DEFAULT_SLOT_COUNT,
    DEFAULT_SLOT_MIN,
    DEFAULT_SLOT_MAX,
    0, // number
    0, // next_number
    [], // selectable_powers
    [], // selected_powers (start empty, will be filled as powers are selected)
    Array(DEFAULT_POWER_COUNT).fill(false), // enabled_powers
    Array(DEFAULT_SLOT_COUNT).fill(false), // disabled_traps
    0, // reward
    0, // over
    mockTimestamp + 24 * 60 * 60, // expiration (1 day)
    Array(DEFAULT_SLOT_COUNT)
      .fill(0)
      .map(() => Trap.from(0)), // traps
    Array(DEFAULT_SLOT_COUNT).fill(0), // slots
    supply, // supply (use current supply like a classic game)
  );

  return game;
};

export function PracticeProvider({ children }: { children: React.ReactNode }) {
  const { supply: currentSupply } = useHeader();
  const [game, setGameState] = useState<Game | null>(null);

  const start = useCallback(
    (supply?: bigint) => {
      // Use provided supply or fallback to currentSupply from header
      const supplyToUse = supply !== undefined ? supply : currentSupply;
      const newGame = createPracticeGame(supplyToUse);
      const rand = new Random(BigInt(newGame.id));
      newGame.start(rand);
      setGameState(newGame);
    },
    [currentSupply],
  );

  const setGame = useCallback((newGame: Game | null) => {
    setGameState(newGame);
  }, []);

  const clearGame = useCallback(() => {
    setGameState(null);
  }, []);

  return (
    <PracticeContext.Provider
      value={{
        game,
        start,
        setGame,
        clearGame,
      }}
    >
      {children}
    </PracticeContext.Provider>
  );
}
