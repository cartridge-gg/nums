import { Game } from "@/bindings";
import { NAMESPACE } from "@/config";
import { ClauseBuilder, ToriiQueryBuilder } from "@dojoengine/sdk";
import { useEntityQuery, useModels } from "@dojoengine/sdk/react";
import { useAccount } from "@starknet-react/core";
import { createContext, useCallback, useContext, useMemo } from "react";
import { BigNumberish } from "starknet";

type GameProviderProps = {
  children: React.ReactNode;
};

type GameProviderState = {
  games?: Game[];
  getGameById: (id: BigNumberish) => Game | undefined;
};

const GameProviderContext = createContext<GameProviderState | undefined>(
  undefined
);

export function GameProvider({ children, ...props }: GameProviderProps) {
  const { account } = useAccount();

  const gamesQuery = useMemo(() => {
    return new ToriiQueryBuilder()
      .withEntityModels([`${NAMESPACE}-Game`])
      .withClause(
        new ClauseBuilder()
          .keys(
            [`${NAMESPACE}-Game`],
            [undefined, undefined],
            "FixedLen"
          )
          .build()
      )
      .addOrderBy(`${NAMESPACE}-Game.id`, "Desc")
      .withLimit(50_000)
      .includeHashedKeys();
  }, [account?.address]);

  useEntityQuery(gamesQuery);

  const gamesItems = useModels(`${NAMESPACE}-Game`);

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
    (id: BigNumberish) => {
      return games.find((i) => i.id === id);
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
