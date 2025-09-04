import { Game } from "@/bindings";
import { useDojoSdk } from "@/hooks/dojo";
import { ClauseBuilder, ToriiQueryBuilder } from "@dojoengine/sdk";
import { useEntityQuery, useModels } from "@dojoengine/sdk/react";
import { useAccount } from "@starknet-react/core";
import { createContext, useCallback, useContext, useMemo } from "react";

type GameProviderProps = {
  children: React.ReactNode;
};

type GameProviderState = {
  games?: Game[];
  getGameById: (id: number) => Game | undefined;
};

const GameProviderContext = createContext<GameProviderState | undefined>(
  undefined
);

export function GameProvider({ children, ...props }: GameProviderProps) {
  const { sdk } = useDojoSdk();
  const { account } = useAccount();

  const gamesQuery = useMemo(() => {
    return new ToriiQueryBuilder()
      .withEntityModels(["nums-Game"])
      .withClause(
        new ClauseBuilder()
          .keys(["nums-Game"], [undefined, account?.address], "FixedLen")
          .build()
      )
      .addOrderBy("nums-Game.game_id", "Desc")
      .withLimit(5)
      .includeHashedKeys();
  }, [account?.address]);

  useEntityQuery(gamesQuery);

  const gamesItems = useModels("nums-Game");

  const { games } = useMemo(() => {
    const games = Object.keys(gamesItems).flatMap((key) => {
      return Object.values(gamesItems[key] as Game[]);
    });

    // if (games) {
    //   console.log("games", games);
    // }

    return {
      games,
    };
  }, [gamesItems]);

  const getGameById = useCallback(
    (id: Number) => {
      return games.find((i) => i.game_id === id);
    },
    [games]
  );

  return (
    <GameProviderContext.Provider
      {...props}
      value={{
        games,
        getGameById,
      }}
    >
      {children}
    </GameProviderContext.Provider>
  );
}

export const useGames = () => {
  const context = useContext(GameProviderContext);

  if (context === undefined)
    throw new Error("useGames must be used within a GameProvider");

  return context;
};
