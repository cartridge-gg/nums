import {
  MemberClause,
  OrComposeClause,
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

const getGameQuery = (gameIds: number[]) => {
  const clauses = OrComposeClause(
    gameIds.map((id) =>
      MemberClause(
        `${NAMESPACE}-${Game.getModelName()}`,
        "id",
        "Eq",
        `0x${id.toString(16).padStart(16, "0")}`,
      ),
    ),
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys()
    .withLimit(ENTITIES_LIMIT);
};

export const useGames = (gameIds: number[]) => {
  const { sdk } = useDojoSdk();

  const [games, setGames] = useState<GameModel[]>([]);

  const subscriptionRef = useRef<any>(null);

  const gameQuery = useMemo(() => {
    if (gameIds.length === 0) return null;
    return getGameQuery(gameIds);
  }, [gameIds]);

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
      const games: GameModel[] = [];
      data.forEach((entity) => {
        if (BigInt(entity.entityId) === 0n) return;
        if (!entity.models[NAMESPACE]?.[Game.getModelName()]) return;
        const game = Game.parse(entity as any);
        games.push(game);
      });
      setGames((prev) => {
        const deduped = games.filter(
          (game) => !prev.some((g) => g.id === game.id),
        );
        return [...prev, ...deduped];
      });
    },
    [],
  );

  const refresh = useCallback(async () => {
    if (gameIds.length === 0 || !gameQuery) return;
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
  }, [gameQuery, gameIds]);

  useEffect(() => {
    refresh();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
      }
    };
  }, [subscriptionRef, sdk, gameQuery, gameIds]);

  return {
    games,
    refresh,
  };
};
