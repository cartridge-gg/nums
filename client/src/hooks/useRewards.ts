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

const getRewardsQuery = (gameIds: number[]) => {
  const clauses = OrComposeClause(
    gameIds.map((id) =>
      MemberClause(
        `${NAMESPACE}-${Reward.getModelName()}`,
        "game_id",
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

export const useRewards = (gameIds: number[]) => {
  const { sdk } = useDojoSdk();

  const [rewards, setRewards] = useState<RewardModel[]>([]);

  const subscriptionRef = useRef<any>(null);

  const rewardsQuery = useMemo(() => {
    if (gameIds.length === 0) return null;
    return getRewardsQuery(gameIds);
  }, [gameIds]);

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
      const rewards: RewardModel[] = [];
      data.forEach((entity) => {
        if (BigInt(entity.entityId) === 0n) return;
        if (!entity.models[NAMESPACE]?.[Reward.getModelName()]) return;
        const reward = Reward.parse(entity as any);
        rewards.push(reward);
      });
      setRewards((prev) => {
        const deduped = rewards.filter(
          (reward) => !prev.some((r) => r.identifier === reward.identifier),
        );
        return [...prev, ...deduped];
      });
    },
    [],
  );

  const refresh = useCallback(async () => {
    if (gameIds.length === 0 || !rewardsQuery) return;
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
  }, [rewardsQuery, gameIds]);

  useEffect(() => {
    refresh();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
      }
    };
  }, [subscriptionRef, sdk, rewardsQuery, gameIds]);

  return {
    rewards,
    refresh,
  };
};
