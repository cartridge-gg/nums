import {
  ClauseBuilder,
  type SchemaType,
  type StandardizedQueryResult,
  type SubscriptionCallbackArgs,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NAMESPACE } from "@/config";
import { Leaderboard, type LeaderboardModel } from "@/models/leaderboard";
import { useDojoSdk } from "./dojo";

const ENTITIES_LIMIT = 10_000;

const getLeaderboardQuery = (tournamentId: number) => {
  const model: `${string}-${string}` = `${NAMESPACE}-${Leaderboard.getModelName()}`;
  const key = `0x${tournamentId.toString(16).padStart(16, "0")}`;
  const clauses = new ClauseBuilder().keys([model], [key], "FixedLen");
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys()
    .withLimit(ENTITIES_LIMIT);
};

export const useLeaderboard = (tournamentId: number) => {
  const { sdk } = useDojoSdk();

  const [leaderboard, setLeaderboard] = useState<LeaderboardModel | undefined>(
    undefined,
  );

  const subscriptionRef = useRef<any>(null);

  const leaderboardQuery = useMemo(() => {
    return getLeaderboardQuery(tournamentId);
  }, [tournamentId]);

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
      const entity = data[0];
      if (BigInt(entity.entityId) === 0n) return;
      if (!entity.models[NAMESPACE]?.[Leaderboard.getModelName()]) return;
      const leaderboard = Leaderboard.parse(entity as any);
      setLeaderboard(leaderboard);
    },
    [tournamentId],
  );

  const refresh = useCallback(async () => {
    if (subscriptionRef.current) {
      subscriptionRef.current = null;
    }

    const [result, subscription] = await sdk.subscribeEntityQuery({
      query: leaderboardQuery,
      callback: onUpdate,
    });
    subscriptionRef.current = subscription;

    const items = result.getItems();
    if (items && items.length > 0) {
      onUpdate({ data: items, error: undefined });
    }
  }, [leaderboardQuery, tournamentId, onUpdate]);

  useEffect(() => {
    refresh();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
      }
    };
  }, [subscriptionRef, sdk, leaderboardQuery, tournamentId, refresh]);

  return {
    leaderboard:
      leaderboard?.tournament_id === tournamentId ? leaderboard : undefined,
    refresh,
  };
};
