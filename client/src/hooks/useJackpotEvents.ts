import { GameCreated } from "./../bindings/typescript/models.gen";
import { Game, NewWinner } from "@/bindings";
import { ToriiQueryBuilder, ClauseBuilder } from "@dojoengine/sdk";
import { useEffect, useMemo, useRef, useState } from "react";
import { BigNumberish, num } from "starknet";
import { useDojoSdk } from "./dojo";
import { useAccount } from "@starknet-react/core";
import { NAMESPACE } from "@/config";

export const useJackpotEvents = (
  jackpotId: BigNumberish,
  callback: (type: string, event: any) => void
) => {
  const { sdk } = useDojoSdk();
  const { account } = useAccount();

  const subscriptionRef = useRef<any>(null);

  const jackpotEventsQuery = useMemo(() => {
    if (!jackpotId) return undefined;
    return new ToriiQueryBuilder()
      .withEntityModels([`${NAMESPACE}-GameCreated`, `${NAMESPACE}-NewWinner`])
      .withClause(
        new ClauseBuilder()
          .keys(
            [`${NAMESPACE}-GameCreated`, `${NAMESPACE}-NewWinner`],
            [undefined, BigInt(jackpotId).toString()],
            "FixedLen"
          )
          .build()
      )
      .includeHashedKeys();
  }, [jackpotId]);

  useEffect(() => {
    const initAsync = async () => {
      if (subscriptionRef.current) {
        subscriptionRef.current = null;
      }
     
      const [items, subscription] = await sdk.subscribeEventQuery({
        query: jackpotEventsQuery!,
        callback: (res) => {
          const newWinner = res.data![0].models.nums.NewWinner as NewWinner;
          const gameCreated = res.data![0].models.nums
            .GameCreated as GameCreated;

          newWinner && callback("NewWinner", newWinner);
          gameCreated && callback("GameCreated", gameCreated);
        },
      });

      subscriptionRef.current = subscription;
    };

    if (account && jackpotEventsQuery) {
      initAsync();
    }
  }, [jackpotEventsQuery, account]);

  return () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.cancel();
    }
  };
};
