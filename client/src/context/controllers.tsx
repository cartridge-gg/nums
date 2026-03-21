import type { Controller } from "@dojoengine/torii-client";
import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { queryKeys } from "@/api/keys";
import { toriiClientAtom } from "@/atoms";
import type { BigNumberish } from "starknet";
import { useQuery } from "@tanstack/react-query";

export const useControllers = () => {
  const client = useAtomValue(toriiClientAtom);

  const {
    data: controllers = [],
    isLoading: loading,
    refetch,
  } = useQuery<Controller[]>({
    queryKey: queryKeys.controllers(),
    queryFn: async () => {
      if (!client) throw new Error("Client not available");
      const res = await client.getControllers({
        contract_addresses: [],
        usernames: [],
        pagination: {
          cursor: undefined,
          direction: "Backward",
          limit: 50_000,
          order_by: [],
        },
      });
      return res.items as Controller[];
    },
    enabled: !!client,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const find = useCallback(
    (address: BigNumberish) => {
      try {
        return controllers?.find((i) => BigInt(i.address) === BigInt(address));
      } catch (_e: unknown) {
        return undefined;
      }
    },
    [controllers],
  );

  return {
    controllers: controllers ?? [],
    refresh,
    find,
    loading: loading || !client,
  };
};
