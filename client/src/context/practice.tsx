import type React from "react";
import { createContext, useCallback, useContext, useState } from "react";
import { Game } from "@/models/game";
import { Random } from "@/helpers/random";
import { useHeader } from "@/hooks/header";

interface PracticeContextType {
  game: Game | null;
  start: (supply?: bigint, multiplier?: number, price?: bigint) => void;
  setGame: (game: Game | null) => void;
  clearGame: () => void;
}

const PracticeContext = createContext<PracticeContextType>({
  game: null,
  start: (_supply?: bigint, _multiplier?: number, _price?: bigint) => {},
  setGame: () => {},
  clearGame: () => {},
});

export const usePractice = () => useContext(PracticeContext);

export function PracticeProvider({ children }: { children: React.ReactNode }) {
  const { supply: currentSupply } = useHeader();
  const [game, setGameState] = useState<Game | null>(null);

  const start = useCallback(
    (supply?: bigint, multiplier?: number, price?: bigint) => {
      const supplyToUse = supply !== undefined ? supply : currentSupply;
      const newGame = Game.create(supplyToUse, multiplier, price);
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
