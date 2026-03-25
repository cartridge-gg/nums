import type { SubscriptionCallbackArgs } from "@dojoengine/sdk";
import { useCallback, useEffect, useRef } from "react";
import type * as torii from "@dojoengine/torii-wasm";
import { NAMESPACE } from "@/constants";
import { Game as GameModel } from "@/models/game";
import { useAtomValue } from "jotai";
import { toriiClientAtom } from "@/atoms";
import { Game } from "@/api/torii/game";
import type { RawGame } from "@/models";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useGame = (gameId: number | null | undefined) => {
  const client = useAtomValue(toriiClientAtom);
  const queryClient = useQueryClient();
  const subscriptionRef = useRef<torii.Subscription | null>(null);

  const queryKey = gameId ? Game.keys.byId(gameId) : ["game", null];

  const { data: game } = useQuery<GameModel | undefined>({
    queryKey,
    queryFn: async () => {
      if (!client || !gameId) return undefined;
      const result = await client.getEntities(Game.byIdQuery(gameId).build());
      return Game.parseOne(result.items, gameId);
    },
    enabled: !!client && !!gameId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const onUpdate = useCallback(
    (data: SubscriptionCallbackArgs<torii.Entity[], Error>) => {
      if (!data || data.error || !gameId) return;
      const games: GameModel[] = [];
      (data.data || [data] || []).forEach((entity) => {
        if (entity.models[`${NAMESPACE}-${GameModel.getModelName()}`]) {
          const model = entity.models[
            `${NAMESPACE}-${GameModel.getModelName()}`
          ] as unknown as RawGame;
          const parsed = GameModel.parse(model);
          if (parsed) games.push(parsed);
        }
      });
      const foundGame = games.find((g) => g.id === gameId);
      if (foundGame) {
        console.log(`GAME UPDATED AT ${new Date().toISOString()}: ${foundGame.id}`);
        queryClient.setQueryData(Game.keys.byId(gameId), foundGame);
      }
    },
    [gameId, queryClient],
  );

  useEffect(() => {
    if (!client || !gameId) return;

    const query = Game.byIdQuery(gameId);

    client.onEntityUpdated(query.build().clause, [], onUpdate).then((sub) => {
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
  }, [client, gameId, onUpdate]);

  return game;
};
