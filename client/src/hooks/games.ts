import {
  MemberClause,
  OrComposeClause,
  type SubscriptionCallbackArgs,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type * as torii from "@dojoengine/torii-wasm";
import { NAMESPACE } from "@/constants";
import { Game } from "@/models/game";
import { useEntities } from "@/context/entities";
import type { RawGame } from "@/models";

const ENTITIES_LIMIT = 10_000;

const getGamesQuery = (gameIds: number[]) => {
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
  const { client } = useEntities();

  const [games, setGames] = useState<Game[]>([]);

  const subscriptionRef = useRef<any>(null);

  // Create a stable key from gameIds for comparison
  // Use ref to track previous value and only update if content actually changed
  const prevKeyRef = useRef<string>("");
  const currentKey = gameIds
    .slice()
    .sort((a, b) => a - b)
    .join(",");
  const gameIdsKey = useMemo(() => {
    if (currentKey !== prevKeyRef.current) {
      prevKeyRef.current = currentKey;
    }
    return prevKeyRef.current;
  }, [currentKey]);

  const onUpdate = useCallback(
    (data: SubscriptionCallbackArgs<torii.Entity[], Error>) => {
      if (!data || data.error) return;
      const games: Game[] = [];
      (data.data || [data] || []).forEach((entity) => {
        if (entity.models[`${NAMESPACE}-${Game.getModelName()}`]) {
          const model = entity.models[
            `${NAMESPACE}-${Game.getModelName()}`
          ] as unknown as RawGame;
          const parsed = Game.parse(model);
          if (parsed) games.push(parsed);
        }
      });
      setGames((prev) => Game.deduplicate([...games, ...prev]));
    },
    [],
  );

  // Refresh function to fetch and subscribe to data
  const refresh = useCallback(async () => {
    if (gameIds.length === 0 || !client) return;

    // Cancel existing subscriptions
    subscriptionRef.current = null;

    // Create queries
    const query = getGamesQuery(gameIds);

    // Fetch initial data
    await Promise.all([
      client
        .getEntities(query.build())
        .then((result) => onUpdate({ data: result.items, error: undefined })),
    ]);

    // Subscribe to entity and event updates
    client
      .onEntityUpdated(query.build().clause, [], onUpdate)
      .then((response) => {
        subscriptionRef.current = response;
      });
  }, [client, gameIdsKey, onUpdate]);

  useEffect(() => {
    refresh();
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
      }
    };
  }, [gameIdsKey, refresh]);

  return {
    games,
    refresh,
  };
};
