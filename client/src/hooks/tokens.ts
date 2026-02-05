import type { GetTokenBalanceRequest, GetTokenRequest } from "@dojoengine/sdk";
import type {
  ContractType,
  Subscription,
  TokenBalance,
  TokenContract,
  TokenTransfer,
} from "@dojoengine/torii-wasm";
import { useAccount } from "@starknet-react/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { addAddressPadding, num } from "starknet";
import { useEntities } from "@/context/entities";
import { equal } from "@/helpers";

const CONTRACT_LIMIT = 1_000;
const BALANCE_LIMIT = 1_000;

export function toDecimal(
  token: TokenContract,
  balance: TokenBalance | undefined,
): number {
  const rawBalance = BigInt(balance?.balance ?? "0");
  const divisor = 10n ** BigInt(token.decimals);
  // Convert to number with decimal precision
  return Number(rawBalance) / Number(divisor);
}

export function useTokenContracts(
  request: GetTokenRequest & { contractType?: ContractType },
) {
  const { client } = useEntities();
  const [contracts, setContracts] = useState<TokenContract[]>([]);
  const requestRef = useRef<
    (GetTokenRequest & { contractType?: ContractType }) | null
  >(null);

  const subscriptionRef = useRef<Subscription | null>(null);

  const fetchTokens = useCallback(async () => {
    if (!client) return;
    const contractType = request.contractType || "ERC20";
    const contractAddresses =
      request.contractAddresses?.map((i: string) => addAddressPadding(i)) || [];
    const tokens = await client.getTokenContracts({
      contract_addresses: contractAddresses,
      contract_types: [contractType],
      pagination: {
        cursor: undefined,
        direction: "Backward",
        limit: CONTRACT_LIMIT,
        order_by: [],
      },
    });
    // Subscribe to token transfer to update the token supply
    const subscription = await client.onTokenTransferUpdated(
      contractAddresses,
      [],
      [],
      async (_data: TokenTransfer) => {
        const tokens = await client.getTokenContracts({
          contract_addresses: contractAddresses,
          contract_types: [contractType],
          pagination: {
            cursor: undefined,
            direction: "Backward",
            limit: CONTRACT_LIMIT,
            order_by: [],
          },
        });
        setContracts(tokens.items);
      },
    );
    if (subscriptionRef.current) {
      subscriptionRef.current.cancel();
    }
    subscriptionRef.current = subscription;
    setContracts(tokens.items);
  }, [client, request]);

  const refetch = useCallback(async () => {
    fetchTokens();
  }, [fetchTokens]);

  useEffect(() => {
    if (!client) return;
    if (equal(request, requestRef.current)) return;
    requestRef.current = request;
    refetch();
  }, [request, refetch, client]);

  return {
    contracts,
    refetch,
  };
}

export function useTokens(
  request: GetTokenRequest &
    GetTokenBalanceRequest & { contractType?: ContractType },
) {
  const { account } = useAccount();
  const { client } = useEntities();
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const requestRef = useRef<(GetTokenRequest & GetTokenBalanceRequest) | null>(
    null,
  );
  const subscriptionRef = useRef<Subscription | null>(null);

  const { contracts } = useTokenContracts(request);

  const fetchBalances = useCallback(async () => {
    if (!requestRef.current || !client || !account) return;
    const contractAddresses =
      request.contractAddresses?.map((i: string) =>
        addAddressPadding(num.toHex64(i)),
      ) || [];
    const accountAddresses =
      request.accountAddresses?.map((i: string) =>
        addAddressPadding(num.toHex64(i)),
      ) || [];
    // Fetch initial balance
    const balances = await client.getTokenBalances({
      contract_addresses: contractAddresses,
      account_addresses: accountAddresses,
      token_ids: [],
      pagination: {
        cursor: undefined,
        direction: "Backward",
        limit: BALANCE_LIMIT,
        order_by: [],
      },
    });
    // Subscribe to balance updates
    const subscription = await client.onTokenBalanceUpdated(
      contractAddresses,
      accountAddresses,
      [],
      async (data: TokenBalance) => {
        setTokenBalances((prev) => update(prev, data));
      },
    );

    if (subscriptionRef.current) {
      subscriptionRef.current.cancel();
    }
    subscriptionRef.current = subscription;
    setTokenBalances(balances.items);
  }, [client, account, request.contractAddresses, request.accountAddresses]);

  useEffect(() => {
    if (
      (request?.accountAddresses || []).length === 0 ||
      (contracts || []).length === 0
    )
      return;
    if (!equal(request, requestRef.current)) {
      requestRef.current = request;
      fetchBalances();
    }
  }, [contracts, fetchBalances, request]);

  const refetch = useCallback(async () => {
    fetchBalances();
  }, [fetchBalances]);

  return {
    tokenContracts: contracts,
    tokenBalances,
    refetch,
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
