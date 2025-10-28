import {
  GetTokenBalanceRequest,
  GetTokenRequest,
  SubscriptionCallbackArgs,
} from "@dojoengine/sdk";
import { useDojoSDK } from "@dojoengine/sdk/react";
import type {
  Subscription,
  TokenBalance,
  TokenContract,
} from "@dojoengine/torii-wasm";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { deepEqual } from "@/helpers/deepEqual";
import { addAddressPadding, num } from "starknet";
import { useAccount } from "@starknet-react/core";

export function useAssets(
  request: GetTokenRequest & GetTokenBalanceRequest,
  accountRequired = true
) {
  const { sdk } = useDojoSDK();
  const [tokens, setTokens] = useState<TokenContract[]>([]);
  const requestRef = useRef<(GetTokenRequest & GetTokenBalanceRequest) | null>(
    null
  );
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const subscriptionRef = useRef<Subscription | null>(null);

  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
      }
    };
  }, []);

  const fetchTokens = useCallback(async () => {
    const tokens = await sdk.client.getTokenContracts({
      contract_addresses: request.contractAddresses
        ? request.contractAddresses.map((i: any) => num.toHex64(i))
        : [],
      contract_types: ['ERC721'],
      pagination: {
        cursor: undefined,
        direction: "Backward",
        limit: 1_000,
        order_by: [],
      },
    });
    setTokens(tokens.items);
  }, [sdk]);

  const fetchTokenBalances = useCallback(async () => {
    if (!requestRef.current) return;
    const [tokenBalances, subscription] = await sdk.subscribeTokenBalance({
      contractAddresses: requestRef.current.contractAddresses
        ? requestRef.current.contractAddresses.map((i: any) => num.toHex64(i))
        : [],
      accountAddresses: requestRef.current.accountAddresses
        ? requestRef.current.accountAddresses.map((i: any) => num.toHex64(i))
        : [],
      tokenIds: requestRef.current.tokenIds
        ? requestRef.current.tokenIds.map((i: any) => num.toHex64(i))
        : [],
      callback: ({ data, error }: SubscriptionCallbackArgs<TokenBalance>) => {
        if (error) {
          console.error(error);
          return;
        }
        setTokenBalances((prev) => updateTokenBalancesList(prev, data));
      },
    });

    if (subscriptionRef.current) {
      subscriptionRef.current.cancel();
    }

    subscriptionRef.current = subscription;
    setTokenBalances(tokenBalances.items);
  }, [sdk]);

  useEffect(() => {
    if (!deepEqual(request, requestRef.current)) {
      requestRef.current = request;
      fetchTokens();

      if (
        accountRequired &&
        (!request.accountAddresses || request.accountAddresses.length === 0)
      ) {
      } else {
        fetchTokenBalances();
      }
    }
  }, [request]);

  function getBalance(token: TokenContract): TokenBalance | undefined {
    return tokenBalances.find(
      (balance) => 
        BigInt(balance.contract_address) === BigInt(token.contract_address)
    );
  }

  function toDecimal(
    token: TokenContract,
    balance: TokenBalance | undefined
  ): number {
    return Number.parseInt(balance?.balance ?? "0", 16) * 10 ** -token.decimals;
  }

  const refetchBalances = useCallback(async () => {
    fetchTokens();
    fetchTokenBalances();
  }, []);

  // Extract token IDs (gameIds) with non-zero balance for ERC721 tokens
  const assets = useMemo(() => {
    return tokenBalances
      .filter((balance) => {
        // Only include ERC721 tokens with balance > 0
        const balanceValue = BigInt(balance.balance || "0x0");
        return balanceValue > 0n;
      })
      .map((balance) => {
        // Convert token_id from hex to number
        const tokenId = balance.token_id || "0x0";
        return parseInt(tokenId, 16);
      })
      .filter((id) => id > 0); // Filter out invalid IDs
  }, [tokenBalances]);

  return {
    tokens,
    balances: tokenBalances,
    assets,
    gameIds: assets, // Alias for convenience
    getBalance,
    toDecimal,
    refetchBalances,
  };
}

/**
 * Hook to get player's game IDs via subscription to TokenBalances (ERC721)
 * Simplified wrapper around useAssets for the common use case of getting player's games
 * 
 * @returns Object with gameIds array and loading/error states
 */
export const usePlayerGames = () => {
  const { address } = useAccount();

  const { assets } = useAssets(
    {
      accountAddresses: address ? [addAddressPadding(address)] : [],
      contractAddresses: [], // Empty to get all ERC721 tokens
      tokenIds: [], // Empty to get all token IDs
    },
    true // Account required
  );

  return {
    gameIds: assets,
    isLoading: false, // Subscription doesn't have explicit loading state
    error: null,
  };
};

function updateTokenBalancesList(
  previousBalances: TokenBalance[],
  newBalance: TokenBalance
): TokenBalance[] {
  if (
    BigInt(newBalance.account_address) === 0n &&
    BigInt(newBalance.contract_address) === 0n
  ) {
    return previousBalances;
  }
  const existingBalanceIndex = previousBalances.findIndex(
    (balance) =>
      BigInt(balance.token_id || 0) === BigInt(newBalance.token_id || 0) &&
      BigInt(balance.contract_address) ===
        BigInt(newBalance.contract_address) &&
      BigInt(balance.account_address) === BigInt(newBalance.account_address)
  );

  // If balance doesn't exist, append it to the list
  if (existingBalanceIndex === -1) {
    return [...previousBalances, newBalance];
  }

  // If balance exists, update it while preserving order
  return previousBalances.map((balance, index) =>
    index === existingBalanceIndex ? newBalance : balance
  );
}

//
