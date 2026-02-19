import { DEFAULT_CHAIN_ID, dojoConfigs } from "@/config";
import { useQuery } from "@tanstack/react-query";
import { getChecksumAddress } from "starknet";

export interface Activity {
  gameId: number;
  score: number;
  payout: string;
  to: string;
  timestamp: number; // Unix timestamp in seconds
}

const fetchActivities = async (playerAddress: string): Promise<Activity[]> => {
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
        game_id,
        score,
        timestamp
    FROM "NUMS-LeaderboardScore"
    WHERE player = '${playerAddress}'
    ORDER BY timestamp DESC
    LIMIT 50;`;

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
        `Failed to fetch activities: ${response.status} ${response.statusText}. ${errorText}`,
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
    console.error("Error fetching activities:", error);
    throw error;
  }

  // Parse the response
  let rows: any[] = [];
  if (Array.isArray(data)) {
    rows = data;
  } else if (data.rows && Array.isArray(data.rows)) {
    rows = data.rows;
  } else if (data.data && Array.isArray(data.data)) {
    rows = data.data;
  }

  // Convert score from hex string to number
  const parseScore = (scoreHex: string): number => {
    const score = scoreHex.toLowerCase();
    const secondLast = score[score.length - 2];
    const last = score[score.length - 1];

    const parseHex = (char: string): number => {
      if (char >= "0" && char <= "9") return parseInt(char, 16);
      if (char === "a") return 10;
      if (char === "b") return 11;
      if (char === "c") return 12;
      if (char === "d") return 13;
      if (char === "e") return 14;
      if (char === "f") return 15;
      return 0;
    };

    return parseHex(secondLast) * 16 + parseHex(last);
  };

  // Calculate payout (simplified - you may need to adjust based on actual reward calculation)
  const calculatePayout = (score: number): string => {
    // This is a placeholder - adjust based on your actual payout calculation
    const payout = score * 0.05; // Example: 5 cents per score point
    return `+$${payout.toFixed(2)}`;
  };

  return rows.map((row) => {
    const gameId = Number(row.game_id) || 0;
    const score = parseScore(row.score || "0");
    const timestamp = Number(row.timestamp) || 0;

    return {
      gameId,
      score,
      payout: calculatePayout(score),
      to: `/game?id=${gameId}`,
      timestamp,
    };
  });
};

export const useActivities = (playerAddress: string | undefined) => {
  return useQuery<Activity[]>({
    queryKey: ["activities", playerAddress],
    queryFn: () => {
      if (!playerAddress) {
        throw new Error("Player address is required");
      }
      return fetchActivities(getChecksumAddress(playerAddress).toLowerCase());
    },
    enabled: !!playerAddress,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });
};
