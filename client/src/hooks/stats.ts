import { DEFAULT_CHAIN_ID, dojoConfigs } from "@/config";
import { useQuery } from "@tanstack/react-query";
import { getChecksumAddress } from "starknet";

export interface Stats {
  total_games: number;
  average_score: number;
}

const fetchStats = async (playerAddress: string): Promise<Stats> => {
  const url = `${dojoConfigs[DEFAULT_CHAIN_ID].toriiUrl}/sql`;

  if (!url) {
    throw new Error(
      "VITE_TORII_SQL_URL is not defined in environment variables",
    );
  }

  // Validate address format (should be a hex string starting with 0x)
  if (!/^0x[a-fA-F0-9]+$/.test(playerAddress)) {
    throw new Error(`Invalid player address format: ${playerAddress}`);
  }

  const sqlQuery = `SELECT 
        COUNT(*) AS total_games,
        AVG(
            (CASE substr(score, -2, 1)
                WHEN 'a' THEN 10 WHEN 'b' THEN 11 WHEN 'c' THEN 12 
                WHEN 'd' THEN 13 WHEN 'e' THEN 14 WHEN 'f' THEN 15 
                ELSE CAST(substr(score, -2, 1) AS INT) END * 16) +
            (CASE substr(score, -1, 1)
                WHEN 'a' THEN 10 WHEN 'b' THEN 11 WHEN 'c' THEN 12 
                WHEN 'd' THEN 13 WHEN 'e' THEN 14 WHEN 'f' THEN 15 
                ELSE CAST(substr(score, -1, 1) AS INT) END)
        ) AS average_score
    FROM "NUMS-LeaderboardScore"
    WHERE player = '${playerAddress}';`;

  let data: any;

  try {
    // Torii SQL API accepts SQL queries as plain text
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
        `Failed to fetch stats: ${response.status} ${response.statusText}. ${errorText}`,
      );
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      // If response is not JSON, try parsing as text and then JSON
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
    console.error("Error fetching stats:", error);
    throw error;
  }

  // Parse the response - handle different possible formats
  // Format 1: Array of rows with column names as keys
  if (Array.isArray(data) && data.length > 0) {
    const row = data[0];
    return {
      total_games: Number(row.total_games) || 0,
      average_score: Number(row.average_score) || 0,
    };
  }

  // Format 2: Object with rows array
  if (data.rows && Array.isArray(data.rows) && data.rows.length > 0) {
    const row = data.rows[0];
    return {
      total_games: Number(row.total_games) || 0,
      average_score: Number(row.average_score) || 0,
    };
  }

  // Format 3: Direct object with column names as keys
  if (data.total_games !== undefined || data.average_score !== undefined) {
    return {
      total_games: Number(data.total_games) || 0,
      average_score: Number(data.average_score) || 0,
    };
  }

  // Format 4: Object with data property
  if (data.data && Array.isArray(data.data) && data.data.length > 0) {
    const row = data.data[0];
    return {
      total_games: Number(row.total_games) || 0,
      average_score: Number(row.average_score) || 0,
    };
  }

  // Default values if parsing fails
  console.warn("Unable to parse stats response:", data);
  return {
    total_games: 0,
    average_score: 0,
  };
};

export const useStats = (playerAddress: string | undefined) => {
  return useQuery<Stats>({
    queryKey: ["stats", playerAddress],
    queryFn: () => {
      if (!playerAddress) {
        throw new Error("Player address is required");
      }
      return fetchStats(getChecksumAddress(playerAddress).toLowerCase());
    },
    enabled: !!playerAddress,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });
};
