import { Game, NewWinner } from "@/bindings";
import { ToriiQueryBuilder, ClauseBuilder } from "@dojoengine/sdk";
import { useEffect, useMemo, useRef, useState } from "react";
import { BigNumberish, num } from "starknet";
import { useDojoSdk } from "./dojo";

export const useGame = (gameId?: string) => {
  const { sdk } = useDojoSdk();
  const [game, setGame] = useState<Game | undefined>(undefined);

  const subscriptionRef = useRef<any>(null);

  const gameQuery = useMemo(() => {
    return (
      new ToriiQueryBuilder()
        // .withEntityModels(["nums-Game", "nums-Slot"])
        //   .withLimit(1)
        .withClause(
          new ClauseBuilder()
            .compose()
            .or([
              new ClauseBuilder().where(
                "nums-Game",
                "game_id",
                "Eq",
                Number(gameId || 0).toString()
              ),
              new ClauseBuilder().where(
                "nums-Slot",
                "game_id",
                "Eq",
                Number(gameId || 0).toString()
              ),
            ])
            .build()
        )
        // .includeHashedKeys()
    );
  }, [gameId]);

  useEffect(() => {
    const initAsync = async () => {
      if (subscriptionRef.current) {
        if (subscriptionRef.current) {
          subscriptionRef.current.cancel();
        }
      }
      const [items, subscription] = await sdk.subscribeEntityQuery({
        query: gameQuery,
        callback: (res) => {
          const game = res.data![0].models.nums.Game as Game;
        },
      });
      subscriptionRef.current = subscription;

      const games = items.getItems();
      if (!games || games.length === 0) return;

      setGame(games[0].models.nums.Game as Game);
    };

    initAsync();

    // return () => {
    //   if (subscriptionRef.current) {
    //     subscriptionRef.current.cancel();
    //   }
    // };
  }, [gameQuery]);

  return {
    game,
  };
};
