import {
  ClauseBuilder,
  type SchemaType,
  type StandardizedQueryResult,
  type SubscriptionCallbackArgs,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NAMESPACE } from "@/config";
import { Game, type GameModel } from "@/models/game";
import { useDojoSdk } from "./dojo";

const ENTITIES_LIMIT = 10_000;

const getGameQuery = (gameId: number) => {
  const model: `${string}-${string}` = `${NAMESPACE}-${Game.getModelName()}`;
  const key = `0x${gameId.toString(16).padStart(16, "0")}`;
  const clauses = new ClauseBuilder().keys([model], [key], "FixedLen");
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys()
    .withLimit(ENTITIES_LIMIT);
};

export const useGame = (gameId: number) => {
  const { sdk } = useDojoSdk();

  const [game, setGame] = useState<GameModel | undefined>(undefined);

  const subscriptionRef = useRef<any>(null);

  const gameQuery = useMemo(() => {
    return getGameQuery(gameId);
  }, [gameId]);

  const onUpdate = useCallback(
    ({
      data,
      error,
    }: SubscriptionCallbackArgs<
      StandardizedQueryResult<SchemaType>,
      Error
    >) => {
      if (
        error ||
        !data ||
        data.length === 0 ||
        BigInt(data[0].entityId) === 0n
      )
        return;
      const entity = data[0];
      if (BigInt(entity.entityId) === 0n) return;
      if (!entity.models[NAMESPACE]?.[Game.getModelName()]) return;
      const game = Game.parse(entity as any);
      setGame(game);
    },
    [gameId],
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
    if (items && items.length > 0) {
      onUpdate({ data: items, error: undefined });
    }
  }, [gameQuery, gameId, onUpdate]);

  useEffect(() => {
    refresh();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
      }
    };
  }, [subscriptionRef, sdk, gameQuery, gameId, refresh]);

  return {
    game,
    refresh,
  };
};
