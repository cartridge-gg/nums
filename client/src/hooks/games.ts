import {
  ClauseBuilder,
  type SubscriptionCallbackArgs,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type * as torii from "@dojoengine/torii-wasm";
import { NAMESPACE } from "@/constants";
import { Game } from "@/models/game";
import { useEntities } from "@/context/entities";
import type { RawGame } from "@/models";
import { useAssets } from "@/hooks/assets";
import { useAccount } from "@starknet-react/core";
import { useControllers } from "@/context/controllers";

const ENTITIES_LIMIT = 10_000;

const getGamesQuery = () => {
  const clauses = new ClauseBuilder().keys(
    [`${NAMESPACE}-${Game.getModelName()}`],
    [undefined],
    "FixedLen",
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys()
    .withLimit(ENTITIES_LIMIT);
};

export const useGames = () => {
  const { isConnected } = useAccount();
  const { controllers } = useControllers();
  const { client, scores } = useEntities();
  const { gameIds, isLoading: assetsLoading } = useAssets();

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
    // Wait for assets to load before fetching games
    if (!client) return;
    // Cancel existing subscriptions
    setLoading(true);
    subscriptionRef.current = null;

    // Create queries
    const query = getGamesQuery();

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
        setLoading(false);
      });
  }, [client, onUpdate, setLoading]);

  useEffect(() => {
    refresh();
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
      }
    };
  }, [gameIdsKey, refresh, isConnected, setLoading]);

  const playerGames = useMemo(() => {
    return games.filter((game) => gameIds.includes(game.id));
  }, [games, gameIds]);

  const allGames = useMemo(() => {
    if (!controllers) return [];
    return games
      .map((game) => {
        const score = scores.find((score) => score.game_id === game.id);
        if (!score) return undefined;
        const username = controllers.find(
          (controller) => BigInt(controller.address) === BigInt(score.player),
        )?.username;
        if (!username) return undefined;
        return {
          ...game,
          username: username,
          score: score.score,
        };
      })
      .filter((game) => game !== undefined);
  }, [games, scores, controllers]);

  return {
    playerGames,
    allGames,
    loading: loading || assetsLoading,
    refresh,
  };
};
