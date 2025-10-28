import { Game as GameEntity } from "@/bindings";
import { Game, GameModel } from "@/models/game";
import {
  ToriiQueryBuilder,
  ClauseBuilder,
} from "@dojoengine/sdk";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDojoSdk } from "./dojo";
import { NAMESPACE } from "@/config";

const getGameQuery = (gameId: number) => {
  const clauses = new ClauseBuilder().keys([`${NAMESPACE}-${Game.getModelName()}`], [gameId.toString()], "FixedLen");
  return new ToriiQueryBuilder()
    .withEntityModels([`${NAMESPACE}-Game`])
    .withClause(clauses.build());
};

export const useGame = (gameId: number) => {
  const { sdk } = useDojoSdk();

  const [game, setGame] = useState<GameModel | undefined>(undefined);

  const subscriptionRef = useRef<any>(null);

  const gameQuery = useMemo(() => {
    return getGameQuery(gameId);
  }, [gameId]);

  const onUpdate = useCallback(
    (res: { data: any }) => {
      const game = res.data![0].models.nums.Game as GameEntity;
      if (game) {
        setGame(GameModel.from(game.id.toString(), game));
      }
    },
    []
  );

  const refresh = useCallback(async () => {
    if (subscriptionRef.current) {
      subscriptionRef.current = null;
    }

    const [result, subscription] = await sdk.subscribeEntityQuery({
      query: gameQuery,
      callback: onUpdate,
    });
    subscriptionRef.current = subscription;

    const items = result.getItems();
    if (!items || items.length === 0) return;

    const game = items.find((i) => i.models.NUMS.Game);
    if (game) {
      setGame(GameModel.from(game.entityId, game.models.NUMS.Game as GameEntity));
    }
  }, [gameQuery, gameId]);

  useEffect(() => {
    refresh();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
      }
    };
  }, [sdk, gameQuery, gameId]);

  return {
    game,
    refresh,
  };
};
