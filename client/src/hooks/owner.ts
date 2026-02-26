import {
  DEFAULT_CHAIN_ID,
  chains,
  dojoConfigs,
  getCollectionAddress,
} from "@/config";
import { useQuery } from "@tanstack/react-query";
import { useNetwork } from "@starknet-react/core";
import { getChecksumAddress } from "starknet";

const ZERO_BALANCE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

const fetchOwner = async (
  gameId: number,
  collectionAddress: string,
): Promise<string | undefined> => {
  const url = `${dojoConfigs[DEFAULT_CHAIN_ID].toriiUrl}/sql`;

  if (!url) {
    throw new Error("Torii SQL URL is not defined");
  }

  const tokenIdHex = `0x${gameId.toString(16).padStart(64, "0")}`;

  const sqlQuery = `SELECT account_address
FROM token_balances AS tb
WHERE tb.balance != '${ZERO_BALANCE}'
AND tb.contract_address = '${getChecksumAddress(collectionAddress).toLowerCase()}'
AND SUBSTR(tb.token_id, INSTR(tb.token_id, ':') + 1) = '${tokenIdHex}'
LIMIT 1000;`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: sqlQuery,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch owner: ${response.status} ${response.statusText}. ${errorText}`,
    );
  }

  const contentType = response.headers.get("content-type");
  let data: unknown;
  if (contentType?.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Unexpected response format: ${text.substring(0, 100)}`);
    }
  }

  let rows: { account_address?: string }[] = [];
  if (Array.isArray(data)) {
    rows = data;
  } else if (
    data &&
    typeof data === "object" &&
    "rows" in data &&
    Array.isArray((data as { rows: unknown }).rows)
  ) {
    rows = (data as { rows: { account_address?: string }[] }).rows;
  } else if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    Array.isArray((data as { data: unknown }).data)
  ) {
    rows = (data as { data: { account_address?: string }[] }).data;
  }

  return rows[0]?.account_address;
};

export const useOwner = (gameId?: number | null) => {
  const { chain } = useNetwork();
  const chainId = chain?.id ?? chains[DEFAULT_CHAIN_ID].id;
  const collectionAddress = getCollectionAddress(chainId);

  const query = useQuery({
    queryKey: ["owner", gameId, collectionAddress],
    queryFn: () => fetchOwner(gameId!, collectionAddress),
    enabled: gameId !== undefined && gameId !== null,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    owner: query.data,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
};
