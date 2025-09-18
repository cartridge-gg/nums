import { Game, NewWinner, Slot } from "@/bindings";
import {
  ToriiQueryBuilder,
  ClauseBuilder,
  MemberClause,
} from "@dojoengine/sdk";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BigNumberish, num } from "starknet";
import { useDojoSdk } from "./dojo";

const MAX_SLOTS = 20;
const EMPTY_SLOTS = Array.from({ length: MAX_SLOTS }, () => 0);

export const useGame = (gameId?: string) => {
  const { sdk } = useDojoSdk();

  const [game, setGame] = useState<Game | undefined>(undefined);
  const slots = useRef<number[]>([...EMPTY_SLOTS]);

  const subscriptionRef = useRef<any>(null);

  const gameQuery = useMemo(() => {
    return new ToriiQueryBuilder()
      .withEntityModels(["nums-Game", "nums-Slot"])
      .withClause(
        new ClauseBuilder()
          .compose()
          .or([
            new ClauseBuilder().where(
              "nums-Game",
              "game_id",
              "Eq",
              Number(gameId || 0)
            ),
            new ClauseBuilder().where(
              "nums-Slot",
              "game_id",
              "Eq",
              Number(gameId || 0)
            ),
          ])
          .build()
      );
  }, [gameId]);

  const onUpdate = useCallback(
    (res: { data: any }) => {
      const game = res.data![0].models.nums.Game as Game;
      if (game) {
        setGame(game);
      }

      const slot = res.data![0].models.nums.Slot as Slot;
      if (slot) {
        slots.current[Number(slot.index)] = Number(slot.number);
      }
    },
    [slots]
  );

  const clearSlots = useCallback(async () => {
    slots.current = [...EMPTY_SLOTS];
  }, [slots]);

  const refresh = useCallback(async () => {
    if (subscriptionRef.current) {
      subscriptionRef.current = null;
    }

    clearSlots();

    const [result, subscription] = await sdk.subscribeEntityQuery({
      query: gameQuery,
      callback: onUpdate,
    });
    subscriptionRef.current = subscription;

    const items = result.getItems();
    if (!items || items.length === 0) return;

    const game = items.find((i) => i.models.nums.Game);
    if (game) {
      setGame(game.models.nums.Game as Game);
    }

    const slotItems = items.filter((i) => i.models.nums.Slot);
    if (slotItems && slotItems.length > 0) {
      const items = slotItems.map((i) => i.models.nums.Slot as Slot);

      for (let item of items) {
        slots.current[Number(item.index)] = Number(item.number);
      }
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
    slots: slots.current,
    refresh,
    clearSlots,
  };
};
