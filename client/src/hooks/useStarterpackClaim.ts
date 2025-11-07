import {
  KeysClause,
  type SchemaType,
  type StandardizedQueryResult,
  type SubscriptionCallbackArgs,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addAddressPadding } from "starknet";
import { NAMESPACE } from "@/config";
import { Claim, type ClaimModel } from "@/models/claim";
import { useDojoSdk } from "./dojo";

const ENTITIES_LIMIT = 10_000;

const getClaimQuery = (player: string) => {
  const clauses = KeysClause(
    [`${NAMESPACE}-${Claim.getModelName()}`],
    [addAddressPadding(player), undefined],
    "FixedLen",
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys()
    .withLimit(ENTITIES_LIMIT);
};

export const useStarterpackClaim = (player: string) => {
  const { sdk } = useDojoSdk();

  const [claims, setClaims] = useState<ClaimModel[]>([]);

  const subscriptionRef = useRef<any>(null);

  const claimQuery = useMemo(() => {
    if (!player || player === "0x0") return null;
    return getClaimQuery(player);
  }, [player]);

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
      const claims: ClaimModel[] = [];
      data.forEach((entity) => {
        if (BigInt(entity.entityId) === 0n) return;
        if (!entity.models[NAMESPACE]?.[Claim.getModelName()]) return;
        const claim = Claim.parse(entity as any);
        claims.push(claim);
      });
      setClaims([...claims]);
    },
    [player],
  );

  const refresh = useCallback(async () => {
    if (!claimQuery) return;
    if (subscriptionRef.current) {
      subscriptionRef.current = null;
    }

    const [result, subscription] = await sdk.subscribeEntityQuery({
      query: claimQuery,
      callback: onUpdate,
    });
    subscriptionRef.current = subscription;

    const items = result.getItems();
    if (items && items.length > 0) {
      onUpdate({ data: items, error: undefined });
    }
  }, [claimQuery]);

  useEffect(() => {
    refresh();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
      }
    };
  }, [subscriptionRef, sdk, claimQuery]);

  return {
    claims,
    refresh,
  };
};
