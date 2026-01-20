import { DEFAULT_CHAIN_ID, dojoConfigs } from "@/config";
import { useQuery } from "@tanstack/react-query";
import type { LeaderboardRowProps } from "@/components/elements/leaderboard-row";

export interface LeaderboardRowData {
  username: string;
  player: string;
  games_played: number;
  average_score: number;
}

const fetchLeaderboard = async (): Promise<LeaderboardRowData[]> => {
  const url = `${dojoConfigs[DEFAULT_CHAIN_ID].toriiUrl}/sql`;

  if (!url) {
    throw new Error("Torii SQL URL is not defined");
  }

  const sqlQuery = `SELECT 
    c.username,
    g.player,
    COUNT(*) AS games_played,
    AVG(
        (CASE substr(lower(g.score), -2, 1) WHEN 'a' THEN 10 WHEN 'b' THEN 11 WHEN 'c' THEN 12 WHEN 'd' THEN 13 WHEN 'e' THEN 14 WHEN 'f' THEN 15 ELSE CAST(substr(g.score, -2, 1) AS INT) END * 16) +
        (CASE substr(lower(g.score), -1, 1) WHEN 'a' THEN 10 WHEN 'b' THEN 11 WHEN 'c' THEN 12 WHEN 'd' THEN 13 WHEN 'e' THEN 14 WHEN 'f' THEN 15 ELSE CAST(substr(g.score, -1, 1) AS INT) END)
    ) AS average_score
FROM "NUMS-LeaderboardScore" as g
JOIN controllers as c ON c.address = g.player
GROUP BY player
ORDER BY average_score DESC;`;

  let data: any;

  try {
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
        `Failed to fetch leaderboard: ${response.status} ${response.statusText}. ${errorText}`,
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
    console.error("Error fetching leaderboard:", error);
    throw error;
  }

  // Parse the response - handle different possible formats
  let rows: LeaderboardRowData[] = [];

  // Format 1: Array of rows with column names as keys
  if (Array.isArray(data)) {
    rows = data.map((row: any) => ({
      username: row.username || "",
      player: row.player || "",
      games_played: Number(row.games_played) || 0,
      average_score: Number(row.average_score) || 0,
    }));
  }
  // Format 2: Object with rows array
  else if (data.rows && Array.isArray(data.rows)) {
    rows = data.rows.map((row: any) => ({
      username: row.username || "",
      player: row.player || "",
      games_played: Number(row.games_played) || 0,
      average_score: Number(row.average_score) || 0,
    }));
  }
  // Format 3: Object with data property
  else if (data.data && Array.isArray(data.data)) {
    rows = data.data.map((row: any) => ({
      username: row.username || "",
      player: row.player || "",
      games_played: Number(row.games_played) || 0,
      average_score: Number(row.average_score) || 0,
    }));
  }

  return rows;
};

const compareAddresses = (address1: string, address2: string): boolean => {
  if (!address1 || !address2) return false;

  try {
    // Normalize addresses: ensure they start with 0x and convert to lowercase
    const normalizeAddress = (addr: string): string => {
      const cleaned = addr.trim().toLowerCase();
      return cleaned.startsWith("0x") ? cleaned : `0x${cleaned}`;
    };

    const normalized1 = normalizeAddress(address1);
    const normalized2 = normalizeAddress(address2);

    // Compare as BigInt for exact match
    const addr1 = BigInt(normalized1);
    const addr2 = BigInt(normalized2);
    return addr1 === addr2;
  } catch {
    // If conversion fails, compare as normalized strings
    const normalizeAddress = (addr: string): string => {
      const cleaned = addr.trim().toLowerCase();
      return cleaned.startsWith("0x") ? cleaned : `0x${cleaned}`;
    };
    return normalizeAddress(address1) === normalizeAddress(address2);
  }
};

export const useLeaderboard = (
  currentUserAddress: string | undefined,
): {
  data: LeaderboardRowProps[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} => {
  const query = useQuery<LeaderboardRowData[]>({
    queryKey: ["leaderboard"],
    queryFn: fetchLeaderboard,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Transform data to LeaderboardRowProps with variant based on current user
  const transformedData = query.data?.map((row, index) => {
    const isCurrentUser =
      currentUserAddress && compareAddresses(row.player, currentUserAddress);

    return {
      rank: index + 1,
      username: row.username,
      total: row.games_played,
      score: row.average_score,
      variant: (isCurrentUser ? "primary" : "default") as "primary" | "default",
    } satisfies LeaderboardRowProps;
  });

  return {
    data: transformedData,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
};
