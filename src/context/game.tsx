import { Game } from "@/bindings";
import { NAMESPACE } from "@/config";
import { useDojoSdk } from "@/hooks/dojo";
import { ClauseBuilder, ToriiQueryBuilder } from "@dojoengine/sdk";
import { useEntityQuery, useModels } from "@dojoengine/sdk/react";
import { useAccount } from "@starknet-react/core";
import { createContext, useCallback, useContext, useMemo } from "react";
import { BigNumberish, num } from "starknet";

type GameProviderProps = {
  children: React.ReactNode;
};

type GameProviderState = {
  games?: Game[];
  getGameById: (id: BigNumberish) => Game | undefined;
  getGameByJackpotId: (
    jackpotId: BigNumberish
  ) => (Game & { rank: number })[] | undefined;
};

const GameProviderContext = createContext<GameProviderState | undefined>(
  undefined
);

export function GameProvider({ children, ...props }: GameProviderProps) {
  const { sdk } = useDojoSdk();
  const { account } = useAccount();

  const gamesQuery = useMemo(() => {
    return new ToriiQueryBuilder()
      .withEntityModels([`${NAMESPACE}-Game`])
      .withClause(
        new ClauseBuilder()
          .keys(
            [`${NAMESPACE}-Game`],
            [undefined, undefined],
            // [undefined, num.toHex64(account?.address || 0)],
            "FixedLen"
          )
          .build()
      )
      .addOrderBy(`${NAMESPACE}-Game.game_id`, "Desc")
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
      return games.find((i) => i.game_id === id);
    },
    [games]
  );
  const getGameByJackpotId = useCallback(
    (jackpotId: BigNumberish) => {
      const filtered = games.filter((i) => i.jackpot_id === jackpotId);
      const sorted = filtered.sort((a, b) => Number(b.level) - Number(a.level));
      let rank = 1;
      const ranked = sorted.map((item, idx) => {
        if (idx === 0) {
          return {
            ...item,
            rank,
          };
        } else {
          if (sorted[idx - 1].level != sorted[idx].level) {
            rank += 1;
          }
          return {
            ...item,
            rank,
          };
        }
      }, 1);

      return ranked;
    },
    [games]
  );

  return (
    <GameProviderContext.Provider
      {...props}
      value={{
        games,
        getGameById,
        getGameByJackpotId,
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
