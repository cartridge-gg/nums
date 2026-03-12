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
import { Power } from "@/types/power";
import { useHeader } from "@/hooks/header";
import {
  DEFAULT_SLOT_COUNT,
  DEFAULT_SLOT_MIN,
  DEFAULT_SLOT_MAX,
  DEFAULT_MULTIPLIER,
  DEFAULT_POWER_COUNT,
} from "@/constants";

const DEFAULT_SUPPLY = 1000n;
const PRACTICE_GAMES_KEY = "nums-practice-games";
const MAX_STORED_GAMES = 50;

// Serialized game shape for localStorage
interface SerializedGame {
  id: number;
  claimed: boolean;
  multiplier: number;
  level: number;
  slot_count: number;
  slot_min: number;
  slot_max: number;
  number: number;
  next_number: number;
  selectable_powers: number[];
  selected_powers: number[];
  enabled_powers: boolean[];
  disabled_traps: boolean[];
  reward: number;
  over: number;
  expiration: number;
  traps: number[];
  slots: number[];
  supply: string;
}

function serializeGame(game: Game): SerializedGame {
  return {
    id: game.id,
    claimed: game.claimed,
    multiplier: game.multiplier,
    level: game.level,
    slot_count: game.slot_count,
    slot_min: game.slot_min,
    slot_max: game.slot_max,
    number: game.number,
    next_number: game.next_number,
    selectable_powers: game.selectable_powers.map((p) => p.into()),
    selected_powers: game.selected_powers.map((p) => p.into()),
    enabled_powers: game.enabled_powers,
    disabled_traps: game.disabled_traps,
    reward: game.reward,
    over: game.over,
    expiration: game.expiration,
    traps: game.traps.map((t) => t.into()),
    slots: game.slots,
    supply: game.supply.toString(),
  };
}

function deserializeGame(raw: SerializedGame): Game {
  return new Game(
    raw.id,
    raw.claimed,
    raw.multiplier,
    raw.level,
    raw.slot_count,
    raw.slot_min,
    raw.slot_max,
    raw.number,
    raw.next_number,
    (raw.selectable_powers || []).map((idx: number) => Power.from(idx)),
    (raw.selected_powers || []).map((idx: number) => Power.from(idx)),
    raw.enabled_powers,
    raw.disabled_traps,
    raw.reward,
    raw.over,
    raw.expiration,
    (raw.traps || []).map((idx: number) => Trap.from(idx)),
    raw.slots,
    BigInt(raw.supply),
  );
}

function loadGames(): Game[] {
  try {
    const stored = localStorage.getItem(PRACTICE_GAMES_KEY);
    if (!stored) return [];
    const parsed: SerializedGame[] = JSON.parse(stored);
    return parsed.map(deserializeGame);
  } catch {
    return [];
  }
}

function saveGames(games: Game[]) {
  try {
    const serialized = games.map(serializeGame);
    localStorage.setItem(PRACTICE_GAMES_KEY, JSON.stringify(serialized));
  } catch {}
}

interface PracticeContextType {
  game: Game | null;
  games: Game[];
  start: (supply?: bigint) => void;
  setGame: (game: Game | null) => void;
  clearGame: () => void;
  continueGame: (gameId: number) => void;
}

const PracticeContext = createContext<PracticeContextType>({
  game: null,
  games: [],
  start: (_supply?: bigint) => {},
  setGame: () => {},
  clearGame: () => {},
  continueGame: () => {},
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
    [], // selected_powers
    Array(DEFAULT_POWER_COUNT).fill(false), // enabled_powers
    Array(DEFAULT_SLOT_COUNT).fill(false), // disabled_traps
    0, // reward
    0, // over
    mockTimestamp + 24 * 60 * 60, // expiration (1 day)
    Array(DEFAULT_SLOT_COUNT)
      .fill(0)
      .map(() => Trap.from(0)), // traps
    Array(DEFAULT_SLOT_COUNT).fill(0), // slots
    supply,
  );

  return game;
};

export function PracticeProvider({ children }: { children: React.ReactNode }) {
  const { supply: currentSupply } = useHeader();
  const [game, setGameState] = useState<Game | null>(null);
  const [storedGames, setStoredGames] = useState<Game[]>(loadGames);
  const gameRef = useRef<Game | null>(null);
  gameRef.current = game;

  // Persist games to localStorage whenever stored games change
  useEffect(() => {
    saveGames(storedGames);
  }, [storedGames]);

  // Save active game to storage whenever it changes
  useEffect(() => {
    if (!game) return;
    setStoredGames((prev) => {
      const filtered = prev.filter((g) => g.id !== game.id);
      return [game, ...filtered].slice(0, MAX_STORED_GAMES);
    });
  }, [game]);

  // Load the most recent active game on mount
  useEffect(() => {
    if (game) return;
    const activeGame = storedGames.find((g) => g.over === 0);
    if (activeGame) {
      setGameState(activeGame);
    }
  }, []); // Only on mount

  const start = useCallback(
    (supply?: bigint) => {
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

  const continueGame = useCallback(
    (gameId: number) => {
      const found = storedGames.find((g) => g.id === gameId);
      if (found) {
        setGameState(found);
      }
    },
    [storedGames],
  );

  // All stored games (active + completed)
  const games = storedGames;

  return (
    <PracticeContext.Provider
      value={{
        game,
        games,
        start,
        setGame,
        clearGame,
        continueGame,
      }}
    >
      {children}
    </PracticeContext.Provider>
  );
}
