import {
  KeysClause,
  type SubscriptionCallbackArgs,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import { useCallback, useEffect, useRef, useState } from "react";
import type * as torii from "@dojoengine/torii-wasm";
import { NAMESPACE } from "@/constants";
import { Game } from "@/models/game";
import { useEntities } from "@/context/entities";
import type { RawGame } from "@/models";

const ENTITIES_LIMIT = 1;

const getGameQuery = (gameId: number) => {
  const clauses = KeysClause(
    [`${NAMESPACE}-${Game.getModelName()}`],
    [`0x${gameId.toString(16).padStart(16, "0")}`],
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys()
    .withLimit(ENTITIES_LIMIT);
};

export const useGame = (gameId: number | null | undefined) => {
  const { client } = useEntities();

  const [game, setGame] = useState<Game | undefined>(undefined);

  const subscriptionRef = useRef<any>(null);

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
      // Find the game matching the requested gameId
      const foundGame = games.find((g) => g.id === gameId);
      if (foundGame) {
        setGame(foundGame);
      }
    },
    [gameId],
  );

  // Refresh function to fetch and subscribe to data
  const refresh = useCallback(async () => {
    if (!gameId || !client) return;

    // Cancel existing subscriptions
    subscriptionRef.current = null;

    // Create queries
    const query = getGameQuery(gameId);

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
  }, [client, gameId, onUpdate]);

  useEffect(() => {
    refresh();
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
      }
    };
  }, [refresh]);

  return game;
};
