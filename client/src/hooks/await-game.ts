import type { SubscriptionCallbackArgs } from "@dojoengine/sdk";
import type * as torii from "@dojoengine/torii-wasm";
import { useCallback, useRef } from "react";
import { Game as GameApi } from "@/api/torii/game";
import { NAMESPACE } from "@/constants";
import { useEntities } from "@/context/entities";
import { useGames } from "@/context/games";
import type { RawGame } from "@/models";
import { Game as GameModel } from "@/models/game";

const DEFAULT_TIMEOUT_MS = 30_000;

export type AwaitedNewGame = {
  promise: Promise<GameModel>;
  cancel: () => void;
};

export function useAwaitNewGame() {
  const { client } = useEntities();
  const { playerGames } = useGames();
  const clientRef = useRef(client);
  clientRef.current = client;
  const playerGamesRef = useRef(playerGames);
  playerGamesRef.current = playerGames;

  return useCallback(
    (timeoutMs: number = DEFAULT_TIMEOUT_MS): AwaitedNewGame => {
      const currentClient = clientRef.current;
      if (!currentClient) {
        return {
          promise: Promise.reject(new Error("appchain Torii client not ready")),
          cancel: () => {},
        };
      }

      const knownIds = new Set(playerGamesRef.current.map((g) => g.id));
      const modelKey = `${NAMESPACE}-${GameModel.getModelName()}`;

      let subscription: torii.Subscription | undefined;
      let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
      let settled = false;

      const cleanup = () => {
        settled = true;
        if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
        subscription?.cancel();
        subscription = undefined;
      };

      const promise = new Promise<GameModel>((resolve, reject) => {
        timeoutHandle = setTimeout(() => {
          if (settled) return;
          cleanup();
          reject(new Error("Timed out waiting for new Game on appchain Torii"));
        }, timeoutMs);

        const clause = GameApi.allQuery().build().clause;
        currentClient
          .onEntityUpdated(
            clause,
            [],
            (data: SubscriptionCallbackArgs<torii.Entity[], Error>) => {
              if (settled) return;
              if (!data || data.error) return;
              const entities = (data.data ?? []) as torii.Entity[];
              for (const e of entities) {
                const raw = e.models[modelKey];
                if (!raw) continue;
                const parsed = GameModel.parse(raw as unknown as RawGame);
                if (parsed && !knownIds.has(parsed.id)) {
                  cleanup();
                  resolve(parsed);
                  return;
                }
              }
            },
          )
          .then((sub) => {
            if (settled) {
              sub.cancel();
              return;
            }
            subscription = sub;
          })
          .catch((err) => {
            if (settled) return;
            cleanup();
            reject(err);
          });
      });

      return {
        promise,
        cancel: () => {
          if (settled) return;
          cleanup();
        },
      };
    },
    [],
  );
}
