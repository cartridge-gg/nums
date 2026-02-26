import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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

const DEFAULT_SUPPLY = 1000n;
const PRACTICE_HISTORY_KEY = "nums-practice-history";
const MAX_HISTORY = 50;

export interface PracticeActivity {
  gameId: number;
  score: number;
  timestamp: number;
}

interface PracticeContextType {
  game: Game | null;
  history: PracticeActivity[];
  start: (supply?: bigint) => void;
  setGame: (game: Game | null) => void;
  clearGame: () => void;
}

const PracticeContext = createContext<PracticeContextType>({
  game: null,
  history: [],
  start: (_supply?: bigint) => {},
  setGame: () => {},
  clearGame: () => {},
});

export const usePractice = () => useContext(PracticeContext);

const loadHistory = (): PracticeActivity[] => {
  try {
    const stored = localStorage.getItem(PRACTICE_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveHistory = (history: PracticeActivity[]) => {
  try {
    localStorage.setItem(PRACTICE_HISTORY_KEY, JSON.stringify(history));
  } catch {}
};

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
  const [history, setHistory] = useState<PracticeActivity[]>(loadHistory);
  const gameRef = useRef<Game | null>(null);
  gameRef.current = game;

  // Persist history to localStorage
  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const start = useCallback(
    (supply?: bigint) => {
      // Save current game to history if it's over
      const currentGame = gameRef.current;
      if (currentGame && currentGame.over > 0) {
        setHistory((prev) =>
          [
            {
              gameId: currentGame.id,
              score: currentGame.level,
              timestamp: currentGame.over,
            },
            ...prev,
          ].slice(0, MAX_HISTORY),
        );
      }

      // Use provided supply or fallback to currentSupply, then to default
      const supplyToUse = supply !== undefined ? supply : currentSupply;
      const effectiveSupply =
        supplyToUse !== undefined && supplyToUse > 0n
          ? supplyToUse
          : DEFAULT_SUPPLY;
      const newGame = createPracticeGame(effectiveSupply);
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
        history,
        start,
        setGame,
        clearGame,
      }}
    >
      {children}
    </PracticeContext.Provider>
  );
}
