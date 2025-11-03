import {
  MemberClause,
  OrComposeClause,
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

const getRewardsQuery = (tournamentIds: number[]) => {
  if (tournamentIds.length === 0) return null;

  const clauses = OrComposeClause(
    tournamentIds.map((id) =>
      MemberClause(
        `${NAMESPACE}-${Reward.getModelName()}`,
        "tournament_id",
        "Eq",
        `0x${id.toString(16).padStart(16, "0")}`,
      ),
    ),
  );

  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys()
    .withLimit(ENTITIES_LIMIT);
};

export const useMultipleRewards = (tournamentIds: number[]) => {
  const { sdk } = useDojoSdk();

  const [rewards, setRewards] = useState<RewardModel[]>([]);

  const subscriptionRef = useRef<any>(null);

  const rewardsQuery = useMemo(() => {
    return getRewardsQuery(tournamentIds);
  }, [tournamentIds.join(",")]);

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
        .filter((reward) => tournamentIds.includes(reward.tournament_id));

      setRewards((prev) => {
        const deduped = parsedRewards.filter(
          (reward) =>
            !prev.some(
              (r) =>
                r.tournament_id === reward.tournament_id &&
                r.address === reward.address &&
                r.gameId === reward.gameId,
            ),
        );
        return [...prev, ...deduped];
      });
    },
    [tournamentIds.join(",")],
  );

  const refresh = useCallback(async () => {
    if (tournamentIds.length === 0 || !rewardsQuery) return;

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
  }, [rewardsQuery, tournamentIds.join(","), onUpdate]);

  useEffect(() => {
    refresh();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
      }
    };
  }, [subscriptionRef, sdk, rewardsQuery, tournamentIds.join(","), refresh]);

  return {
    rewards,
    refresh,
  };
};
