import {
  KeysClause,
  type SchemaType,
  type StandardizedQueryResult,
  type SubscriptionCallbackArgs,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NAMESPACE } from "@/config";
import { Starterpack, type StarterpackModel } from "@/models/starterpack";
import { useDojoSdk } from "./dojo";

const ENTITIES_LIMIT = 10_000;

const getStarterpackQuery = () => {
  const clauses = KeysClause(
    [`${NAMESPACE}-${Starterpack.getModelName()}`],
    [],
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys()
    .withLimit(ENTITIES_LIMIT);
};

export const useStarterpacks = () => {
  const { sdk } = useDojoSdk();

  const [starterpacks, setStarterpacks] = useState<StarterpackModel[]>([]);

  const subscriptionRef = useRef<any>(null);

  const starterpackQuery = useMemo(() => {
    return getStarterpackQuery();
  }, []);

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
      const starterpacks: StarterpackModel[] = [];
      data.forEach((entity) => {
        if (BigInt(entity.entityId) === 0n) return;
        if (!entity.models[NAMESPACE]?.[Starterpack.getModelName()]) return;
        const starterpack = Starterpack.parse(entity as any);
        starterpacks.push(starterpack);
      });
      setStarterpacks((prev) => {
        const deduped = starterpacks.filter(
          (starterpack) => !prev.some((g) => g.id === starterpack.id),
        );
        return [...prev, ...deduped];
      });
    },
    [],
  );

  const refresh = useCallback(async () => {
    if (!starterpackQuery) return;
    if (subscriptionRef.current) {
      subscriptionRef.current = null;
    }

    const [result, subscription] = await sdk.subscribeEntityQuery({
      query: starterpackQuery,
      callback: onUpdate,
    });
    subscriptionRef.current = subscription;

    const items = result.getItems();
    if (items && items.length > 0) {
      onUpdate({ data: items, error: undefined });
    }
  }, [starterpackQuery]);

  useEffect(() => {
    refresh();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
      }
    };
  }, [subscriptionRef, sdk, starterpackQuery]);

  return {
    starterpacks,
    refresh,
  };
};
