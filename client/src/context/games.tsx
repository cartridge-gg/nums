import type React from "react";
import type { SubscriptionCallbackArgs } from "@dojoengine/sdk";
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import type * as torii from "@dojoengine/torii-wasm";
import { NAMESPACE } from "@/constants";
import { Game as GameModel } from "@/models/game";
import { useEntities } from "@/context/entities";
import { useAssets } from "@/hooks/assets";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Game } from "@/api/torii/game";
import type { RawGame } from "@/models";

interface GamesContextType {
  playerGames: GameModel[];
  loading: boolean;
  refresh: () => Promise<unknown>;
}

const GamesContext = createContext<GamesContextType | undefined>(undefined);

export function GamesProvider({ children }: { children: React.ReactNode }) {
  const { client } = useEntities();
  const { gameIds, isLoading: assetsLoading } = useAssets();

  const queryClient = useQueryClient();
  const queryKey = Game.keys.all();
  const subscriptionRef = useRef<torii.Subscription | null>(null);

  const {
    data: games = [],
    isLoading: loading,
    refetch: refresh,
  } = useQuery<GameModel[]>({
    queryKey,
    queryFn: async () => {
      if (!client) throw new Error("Client not available");
      const result = await client.getEntities(Game.allQuery().build());
      return GameModel.deduplicate(Game.parse(result.items));
    },
    enabled: !!client,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const onSubscriptionUpdate = useCallback(
    (data: SubscriptionCallbackArgs<torii.Entity[], Error>) => {
      if (!data || data.error) return;
      const newGames: GameModel[] = [];
      (data.data || [data] || []).forEach((entity) => {
        if (entity.models[`${NAMESPACE}-${GameModel.getModelName()}`]) {
          const model = entity.models[
            `${NAMESPACE}-${GameModel.getModelName()}`
          ] as unknown as RawGame;
          const parsed = GameModel.parse(model);
          if (parsed) newGames.push(parsed);
        }
      });
      if (newGames.length === 0) return;
      queryClient.setQueryData<GameModel[]>(queryKey, (prev) =>
        GameModel.deduplicate([...newGames, ...(prev || [])]),
      );
    },
    [queryClient, queryKey],
  );

  useEffect(() => {
    if (!client) return;

    const query = Game.allQuery();

    client
      .onEntityUpdated(query.build().clause, [], onSubscriptionUpdate)
      .then((sub) => {
        if (subscriptionRef.current) {
          subscriptionRef.current.cancel();
        }
        subscriptionRef.current = sub;
      });

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
        subscriptionRef.current = null;
      }
    };
  }, [client, onSubscriptionUpdate]);

  const gameIdsKey = gameIds
    .slice()
    .sort((a, b) => a - b)
    .join(",");
  const prevGameIdsKeyRef = useRef(gameIdsKey);

  useEffect(() => {
    if (prevGameIdsKeyRef.current === gameIdsKey) return;
    prevGameIdsKeyRef.current = gameIdsKey;
    refresh();
  }, [gameIdsKey, refresh]);

  const playerGames = useMemo(() => {
    return games.filter((game) => gameIds.includes(game.id));
  }, [games, gameIds]);

  const value: GamesContextType = {
    playerGames,
    loading: loading || assetsLoading,
    refresh,
  };

  return (
    <GamesContext.Provider value={value}>{children}</GamesContext.Provider>
  );
}

export function useGames() {
  const context = useContext(GamesContext);
  if (!context) {
    throw new Error("useGames must be used within a GamesProvider");
  }
  return context;
}

export function useGame(gameId: number | null | undefined) {
  const { client } = useEntities();
  const queryClient = useQueryClient();
  const queryKey = Game.keys.byId(gameId ?? 0);
  const subscriptionRef = useRef<torii.Subscription | null>(null);

  const { data: game } = useQuery<GameModel | undefined>({
    queryKey,
    queryFn: async () => {
      if (!client || !gameId || gameId <= 0) return undefined;
      const result = await client.getEntities(Game.byIdQuery(gameId).build());
      return Game.parseOne(result.items, gameId);
    },
    enabled: !!client && !!gameId && gameId > 0,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const onSubscriptionUpdate = useCallback(
    (data: SubscriptionCallbackArgs<torii.Entity[], Error>) => {
      if (!data || data.error || !gameId) return;
      (data.data || [data] || []).forEach((entity) => {
        const key = `${NAMESPACE}-${GameModel.getModelName()}`;
        if (entity.models[key]) {
          const parsed = GameModel.parse(
            entity.models[key] as unknown as RawGame,
          );
          if (parsed && parsed.id === gameId) {
            queryClient.setQueryData<GameModel | undefined>(queryKey, parsed);
          }
        }
      });
    },
    [queryClient, queryKey, gameId],
  );

  useEffect(() => {
    if (!client || !gameId || gameId <= 0) return;

    const query = Game.byIdQuery(gameId);

    client
      .onEntityUpdated(query.build().clause, [], onSubscriptionUpdate)
      .then((sub) => {
        if (subscriptionRef.current) {
          subscriptionRef.current.cancel();
        }
        subscriptionRef.current = sub;
      });

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
        subscriptionRef.current = null;
      }
    };
  }, [client, gameId, onSubscriptionUpdate]);

  return game;
}
