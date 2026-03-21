import type { GetTokenBalanceRequest, GetTokenRequest } from "@dojoengine/sdk";
import type {
  ContractType,
  Subscription,
  TokenBalance,
  TokenContract,
} from "@dojoengine/torii-wasm";
import { useAccount } from "@starknet-react/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addAddressPadding, num } from "starknet";
import { useAtomValue } from "jotai";
import { toriiClientAtom } from "@/atoms";
import { queryKeys } from "@/api/keys";
import {
  fetchTokenContracts,
  fetchTokenBalances,
  updateTokenBalance,
} from "@/api/torii/tokens";
import { useQuery } from "@tanstack/react-query";

export function toDecimal(
  token: TokenContract,
  balance: TokenBalance | undefined,
): number {
  const rawBalance = BigInt(balance?.balance ?? "0");
  const divisor = 10n ** BigInt(token.decimals);
  return Number(rawBalance) / Number(divisor);
}

export function useTokenContracts(
  request: GetTokenRequest & { contractType?: ContractType },
) {
  const client = useAtomValue(toriiClientAtom);
  const contractType = request.contractType || "ERC20";

  const contractAddressesKey = JSON.stringify(request.contractAddresses);
  const contractAddresses = useMemo(
    () =>
      request.contractAddresses?.map((i: string) => addAddressPadding(i)) || [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [contractAddressesKey],
  );

  const queryKey = useMemo(
    () => queryKeys.tokens.contracts(contractAddresses, contractType),
    [contractAddresses, contractType],
  );

  const {
    data: contracts = [],
    isLoading: loading,
    refetch,
  } = useQuery<TokenContract[]>({
    queryKey,
    queryFn: async () => {
      if (!client) throw new Error("Client not available");
      return fetchTokenContracts(
        client,
        contractAddresses,
        contractType as "ERC20" | "ERC721",
      );
    },
    enabled: !!client && contractAddresses.length > 0,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });

  return { contracts, loading, refetch };
}

export function useTokens(
  request: GetTokenRequest &
    GetTokenBalanceRequest & { contractType?: ContractType },
) {
  const { account } = useAccount();
  const client = useAtomValue(toriiClientAtom);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const subscriptionRef = useRef<Subscription | null>(null);

  const { contracts, loading: contractsLoading } = useTokenContracts(request);

  const contractAddressesKey = JSON.stringify(request.contractAddresses);
  const contractAddresses = useMemo(
    () =>
      request.contractAddresses?.map((i: string) =>
        addAddressPadding(num.toHex64(i)),
      ) || [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [contractAddressesKey],
  );

  const accountAddressesKey = JSON.stringify(request.accountAddresses);
  const accountAddresses = useMemo(
    () =>
      request.accountAddresses?.map((i: string) =>
        addAddressPadding(num.toHex64(i)),
      ) || [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accountAddressesKey],
  );

  const stableKey = `${contractAddressesKey}:${accountAddressesKey}`;

  useEffect(() => {
    if (
      !client ||
      !account ||
      contractsLoading ||
      contracts.length === 0 ||
      accountAddresses.length === 0 ||
      contractAddresses.length === 0
    )
      return;

    let cancelled = false;

    const fetchAndSubscribe = async () => {
      setLoading(true);

      const balances = await fetchTokenBalances(
        client,
        contractAddresses,
        accountAddresses,
      );

      if (cancelled) return;
      setTokenBalances(balances);

      const subscription = await client.onTokenBalanceUpdated(
        contractAddresses,
        accountAddresses,
        [],
        async (data: TokenBalance) => {
          if (!cancelled) {
            setTokenBalances((prev) => updateTokenBalance(prev, data));
          }
        },
      );

      if (cancelled) {
        subscription.cancel();
      } else {
        if (subscriptionRef.current) {
          subscriptionRef.current.cancel();
        }
        subscriptionRef.current = subscription;
      }

      setLoading(false);
    };

    fetchAndSubscribe();

    return () => {
      cancelled = true;
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
        subscriptionRef.current = null;
      }
    };
  }, [
    client,
    account,
    contractsLoading,
    contracts.length,
    stableKey,
    contractAddresses,
    accountAddresses,
  ]);

  const refetch = useCallback(() => {
    if (!client || !account) return;
    fetchTokenBalances(client, contractAddresses, accountAddresses).then(
      setTokenBalances,
    );
  }, [client, account, contractAddresses, accountAddresses]);

  return {
    tokenContracts: contracts,
    tokenBalances,
    loading: loading || contractsLoading,
    refetch,
  };
}
