import {
  ClauseBuilder,
  type SchemaType,
  type StandardizedQueryResult,
  type SubscriptionCallbackArgs,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NAMESPACE } from "@/config";
import { Reward, type RewardModel } from "@/models/reward";
import { useDojoSdk } from "./dojo";

const ENTITIES_LIMIT = 10_000;

const getRewardsQuery = (tournamentId: number) => {
  const model: `${string}-${string}` = `${NAMESPACE}-${Reward.getModelName()}`;
  const key = `0x${tournamentId.toString(16).padStart(16, "0")}`;
  const clauses = new ClauseBuilder().keys([model], [key, undefined, undefined], "FixedLen");
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys()
    .withLimit(ENTITIES_LIMIT);
};

export const useRewards = (tournamentId: number) => {
  const { sdk } = useDojoSdk();

  const [rewards, setRewards] = useState<RewardModel[]>([]);

  const subscriptionRef = useRef<any>(null);

  const rewardsQuery = useMemo(() => {
    return getRewardsQuery(tournamentId);
  }, [tournamentId]);

  const onUpdate = useCallback(
    ({
      data,
      error,
    }: SubscriptionCallbackArgs<
      StandardizedQueryResult<SchemaType>,
      Error
    >) => {
      if (error || !data || data.length === 0) return;

      const parsedRewards = data
        .filter((entity) => BigInt(entity.entityId) !== 0n)
        .filter((entity) => entity.models[NAMESPACE]?.[Reward.getModelName()])
        .map((entity) => Reward.parse(entity as any))
        .filter((reward) => reward.tournament_id === tournamentId);

      setRewards(parsedRewards);
    },
    [tournamentId],
  );

  const refresh = useCallback(async () => {
    if (subscriptionRef.current) {
      subscriptionRef.current = null;
    }

    const [result, subscription] = await sdk.subscribeEntityQuery({
      query: rewardsQuery,
      callback: onUpdate,
    });
    subscriptionRef.current = subscription;

    const items = result.getItems();
    if (items && items.length > 0) {
      onUpdate({ data: items, error: undefined });
    }
  }, [rewardsQuery, tournamentId, onUpdate]);

  useEffect(() => {
    refresh();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
      }
    };
  }, [subscriptionRef, sdk, rewardsQuery, tournamentId, refresh]);

  return {
    rewards,
    refresh,
  };
};

