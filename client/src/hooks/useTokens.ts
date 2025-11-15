import type {
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
import { useCallback, useEffect, useRef, useState } from "react";
import { addAddressPadding, num } from "starknet";
import { deepEqual } from "@/helpers/deepEqual";

export function useTokens(
  request: GetTokenRequest &
    GetTokenBalanceRequest & { contractType?: "ERC20" | "ERC721" | "ERC1155" },
) {
  const { sdk } = useDojoSDK();
  const [tokens, setTokens] = useState<TokenContract[]>([]);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const requestRef = useRef<(GetTokenRequest & GetTokenBalanceRequest) | null>(
    null,
  );
  const subscriptionRef = useRef<Subscription | null>(null);

  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
      }
    };
  }, []);

  const fetchTokens = useCallback(async () => {
    const contractType = request.contractType || "ERC20";
    const tokens = await sdk.client.getTokenContracts({
      contract_addresses: request.contractAddresses
        ? request.contractAddresses.map((i: any) => addAddressPadding(i))
        : [],
      contract_types: [contractType],
      pagination: {
        cursor: undefined,
        direction: "Backward",
        limit: 1_000,
        order_by: [],
      },
    });
    setTokens(tokens.items);
  }, [sdk, request]);

  const fetchTokenBalances = useCallback(async () => {
    if (!requestRef.current) return;
    const [tokenBalances, subscription] = await sdk.subscribeTokenBalance({
      contractAddresses: requestRef.current.contractAddresses
        ? requestRef.current.contractAddresses.map((i: any) =>
            addAddressPadding(num.toHex64(i)),
          )
        : [],
      accountAddresses: requestRef.current.accountAddresses
        ? requestRef.current.accountAddresses.map((i: any) =>
            addAddressPadding(num.toHex64(i)),
          )
        : [],
      callback: ({ data, error }: SubscriptionCallbackArgs<TokenBalance>) => {
        if (error) {
          console.error(error);
          return;
        }
        setTokenBalances((prev) => update(prev, data));
      },
    });

    if (subscriptionRef.current) {
      subscriptionRef.current.cancel();
    }

    subscriptionRef.current = subscription;
    setTokenBalances(tokenBalances.items);
  }, [sdk, subscriptionRef, request]);

  useEffect(() => {
    if ((request?.accountAddresses || []).length === 0) return;
    if (!deepEqual(request, requestRef.current)) {
      requestRef.current = request;
      fetchTokens();
      fetchTokenBalances();
    }
  }, [request]);

  function getBalance(token: TokenContract): TokenBalance | undefined {
    return tokenBalances.find(
      (balance) =>
        BigInt(balance.contract_address) === BigInt(token.contract_address),
    );
  }

  function toDecimal(
    token: TokenContract,
    balance: TokenBalance | undefined,
  ): bigint {
    return BigInt(balance?.balance ?? "0") / 10n ** BigInt(token.decimals);
  }

  const refetchBalances = useCallback(async () => {
    fetchTokens();
    fetchTokenBalances();
  }, []);

  return {
    tokens,
    balances: tokenBalances,
    getBalance,
    toDecimal,
    refetchBalances,
  };
}

function update(
  previousBalances: TokenBalance[],
  newBalance: TokenBalance,
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
      BigInt(balance.account_address) === BigInt(newBalance.account_address),
  );

  // If balance doesn't exist, append it to the list
  if (existingBalanceIndex === -1) {
    return [...previousBalances, newBalance];
  }

  // If balance exists, update it while preserving order
  return previousBalances.map((balance, index) =>
    index === existingBalanceIndex ? newBalance : balance,
  );
}
