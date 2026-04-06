import type React from "react";
import { createContext, useContext } from "react";
import type { Game as GameModel } from "@/models/game";

interface GamesContextType {
  playerGames: GameModel[];
  loading: boolean;
  refresh: () => Promise<unknown>;
}

const GamesContext = createContext<GamesContextType | undefined>(undefined);

export function GamesProvider({ children }: { children: React.ReactNode }) {
  const value: GamesContextType = {
    playerGames: [],
    loading: false,
    refresh: async () => [],
  };

  return (
    <GamesContext.Provider value={value}>{children}</GamesContext.Provider>
  );
}

export function useGames() {
  const context = useContext(GamesContext);
  if (!context) {
    throw new Error("useGames must be used within a GamesProvider");
  }
  return context;
}

export function useGame(gameId: number | null | undefined) {
  void gameId;
  return undefined;
}
