import type { GetTokenRequest } from "@dojoengine/sdk";
import { useDojoSDK } from "@dojoengine/sdk/react";
import type { TokenContract } from "@dojoengine/torii-wasm";
import { useCallback, useEffect, useRef, useState } from "react";
import { addAddressPadding } from "starknet";
import { deepEqual } from "@/helpers";

export function useTokenContracts(
  request: GetTokenRequest & { contractType?: "ERC20" | "ERC721" | "ERC1155" },
) {
  const { sdk } = useDojoSDK();
  const [contracts, setContracts] = useState<TokenContract[]>([]);
  const requestRef = useRef<
    (GetTokenRequest & { contractType?: "ERC20" | "ERC721" | "ERC1155" }) | null
  >(null);

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
    setContracts(tokens.items);
  }, [sdk, request]);

  const refetch = useCallback(async () => {
    fetchTokens();
  }, []);

  useEffect(() => {
    if ((request?.contractAddresses || []).length === 0) return;
    if (!deepEqual(request, requestRef.current)) {
      requestRef.current = request;
      fetchTokens();
    }
  }, [request, requestRef]);

  return {
    contracts,
    refetch,
  };
}
