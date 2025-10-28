import { Game, NewWinner, Slot } from "@/bindings";
import {
  ToriiQueryBuilder,
  ClauseBuilder,
  MemberClause,
} from "@dojoengine/sdk";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BigNumberish, num } from "starknet";
import { useDojoSdk } from "./dojo";
import { useAccount } from "@starknet-react/core";
import { NAMESPACE } from "@/config";

export const useFreeGame = () => {
  const { sdk } = useDojoSdk();
  const { account } = useAccount();

  const [hasFreeGame, setHasFreeGame] = useState(false);

  const freeGameQuery = useMemo(() => {
    if (!account) return undefined;

    return new ToriiQueryBuilder()
      .withEntityModels([`${NAMESPACE}-FreeGame`])
      .withClause(
        new ClauseBuilder()
          .keys([`${NAMESPACE}-FreeGame`], [num.toHex64(account?.address)], "FixedLen")
          .build()
      );
  }, [account]);

  const refresh = useCallback(async () => {
    if (!freeGameQuery) return;

    const result = await sdk.getEntities({
      query: freeGameQuery,
    });

    const items = result.getItems();

    if (items.length === 0) {
      setHasFreeGame(true);
    }
  }, [freeGameQuery]);

  useEffect(() => {
    refresh();
  }, [sdk, freeGameQuery]);

  return {
    hasFreeGame,
    refresh,
  };
};
