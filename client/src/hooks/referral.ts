import { useQuery } from "@tanstack/react-query";
import { useAccount } from "@starknet-react/core";
import { getChecksumAddress } from "starknet";
import { PROTOCOL_FEE, REFERRAL_FEE } from "@/constants";
import { useEntities } from "@/context/entities";

export interface Referral {
  username: string;
  recipient: string;
  payment_token: string;
  amount: number;
  referrer: string;
  executed_at: string;
}

const ARCADE_TORII_SQL_URL = `${import.meta.env.VITE_TORII_ARCADE_URL}/sql`;

const MODEL_ID =
  "0x07a079295990e43441a7389fdc3b9ba063c6cd6aee16fb846f598c42a9f04ff7:0x06e1f6f6ed6b1d58c790b45fea70226d9a9ea380626d8fdf0050a730c24ffb84";

const fetchReferrals = async (
  referrerAddress: string,
  starterpackIds: number[],
): Promise<Referral[]> => {
  if (!ARCADE_TORII_SQL_URL) {
    throw new Error(
      "VITE_TORII_ARCADE_URL is not defined in environment variables",
    );
  }

  if (!/^0x[a-fA-F0-9]+$/.test(referrerAddress)) {
    throw new Error(`Invalid referrer address format: ${referrerAddress}`);
  }

  const sqlQuery = `SELECT
    c.username AS username,
    data->>'$.recipient' AS recipient,
    data->>'$.payment_token' AS payment_token,
    data->>'$.amount' AS amount,
    data->>'$.referrer.Some' AS referrer,
    data->>'$.starterpack_id' AS starterpack_id,
    executed_at
FROM event_messages_historical
JOIN controllers AS c ON c.address = data->>'$.recipient'
WHERE model_id = '${MODEL_ID}'
AND data->>'$.referrer.Some' IS NOT NULL
AND data->>'$.referrer.Some' = '${referrerAddress}'
AND data->>'$.starterpack_id' IN (${starterpackIds.join(",")})
LIMIT 1000;`;

  let data: any;

  try {
    const response = await fetch(ARCADE_TORII_SQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: sqlQuery,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch referrals: ${response.status} ${response.statusText}. ${errorText}`,
      );
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `Unexpected response format: ${text.substring(0, 100)}`,
        );
      }
    }
  } catch (error) {
    console.error("Error fetching referrals:", error);
    throw error;
  }

  let rows: any[] = [];
  if (Array.isArray(data)) {
    rows = data;
  } else if (data.rows && Array.isArray(data.rows)) {
    rows = data.rows;
  } else if (data.data && Array.isArray(data.data)) {
    rows = data.data;
  }

  return rows.map((row) => ({
    username: row.username || "",
    recipient: row.recipient || "",
    payment_token: row.payment_token || "",
    amount:
      (Number(row.amount) / 10 ** 6) * (1 - PROTOCOL_FEE) * REFERRAL_FEE || 0,
    referrer: row.referrer || "",
    executed_at: row.executed_at || "",
  }));
};

export const useReferral = () => {
  const { address } = useAccount();
  const { starterpacks } = useEntities();

  const query = useQuery<Referral[]>({
    queryKey: [
      "referrals",
      address,
      starterpacks.map((starterpack) => starterpack.id),
    ],
    queryFn: () => {
      if (!address) {
        throw new Error("Account address is required");
      }
      const starterpackIds = starterpacks.map((starterpack) => starterpack.id);
      return fetchReferrals(
        getChecksumAddress(BigInt(address)).toLowerCase(),
        starterpackIds,
      );
    },
    enabled: !!address,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
};
