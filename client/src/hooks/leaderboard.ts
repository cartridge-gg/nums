import { DEFAULT_CHAIN_ID, dojoConfigs } from "@/config";
import { useQuery } from "@tanstack/react-query";

export interface LeaderboardRowData {
  username: string;
  player: string;
  games_played: number;
  games_played_day: number | null;
  games_played_week: number | null;
  total_reward: number;
  total_reward_day: number | null;
  total_reward_week: number | null;
}

export type RangeType = "1D" | "1W" | "All";

const fetchLeaderboard = async (): Promise<LeaderboardRowData[]> => {
  const url = `${dojoConfigs[DEFAULT_CHAIN_ID].toriiUrl}/sql`;

  if (!url) {
    throw new Error("Torii SQL URL is not defined");
  }

  const sqlQuery = `WITH RawData AS (
    SELECT 
        c.username,
        s.player,
        s.internal_executed_at,
        -- CONVERSION REWARD (6 derniers digits hexa)
        (CASE substr(lower(g.reward), -6, 1) WHEN 'a' THEN 10 WHEN 'b' THEN 11 WHEN 'c' THEN 12 WHEN 'd' THEN 13 WHEN 'e' THEN 14 WHEN 'f' THEN 15 ELSE CAST(NULLIF(substr(g.reward, -6, 1), '') AS INT) END * 1048576) +
        (CASE substr(lower(g.reward), -5, 1) WHEN 'a' THEN 10 WHEN 'b' THEN 11 WHEN 'c' THEN 12 WHEN 'd' THEN 13 WHEN 'e' THEN 14 WHEN 'f' THEN 15 ELSE CAST(NULLIF(substr(g.reward, -5, 1), '') AS INT) END * 65536) +
        (CASE substr(lower(g.reward), -4, 1) WHEN 'a' THEN 10 WHEN 'b' THEN 11 WHEN 'c' THEN 12 WHEN 'd' THEN 13 WHEN 'e' THEN 14 WHEN 'f' THEN 15 ELSE CAST(NULLIF(substr(g.reward, -4, 1), '') AS INT) END * 4096) +
        (CASE substr(lower(g.reward), -3, 1) WHEN 'a' THEN 10 WHEN 'b' THEN 11 WHEN 'c' THEN 12 WHEN 'd' THEN 13 WHEN 'e' THEN 14 WHEN 'f' THEN 15 ELSE CAST(NULLIF(substr(g.reward, -3, 1), '') AS INT) END * 256) +
        (CASE substr(lower(g.reward), -2, 1) WHEN 'a' THEN 10 WHEN 'b' THEN 11 WHEN 'c' THEN 12 WHEN 'd' THEN 13 WHEN 'e' THEN 14 WHEN 'f' THEN 15 ELSE CAST(NULLIF(substr(g.reward, -2, 1), '') AS INT) END * 16) +
        (CASE substr(lower(g.reward), -1, 1) WHEN 'a' THEN 10 WHEN 'b' THEN 11 WHEN 'c' THEN 12 WHEN 'd' THEN 13 WHEN 'e' THEN 14 WHEN 'f' THEN 15 ELSE CAST(NULLIF(substr(g.reward, -1, 1), '') AS INT) END)
        AS reward_decimal,

        -- Flags temporels
        CASE WHEN date(s.internal_executed_at) = date('now') THEN 1 ELSE 0 END AS is_today,
        CASE WHEN strftime('%Y-%W', s.internal_executed_at) = strftime('%Y-%W', 'now') THEN 1 ELSE 0 END AS is_this_week
    FROM "NUMS-LeaderboardScore" AS s
    JOIN "NUMS-Game" AS g ON 
        -- Nettoyage des 0x et des 0 à gauche pour la jointure
        LTRIM(lower(s.game_id), '0x') = LTRIM(lower(g.id), '0x')
    JOIN controllers AS c ON c.address = s.player
)

SELECT 
    username,
    player,
    COUNT(*) AS games_played,
    SUM(reward_decimal) AS total_reward,

    -- Statistiques Jour
    SUM(is_today) AS games_played_day,
    SUM(CASE WHEN is_today = 1 THEN reward_decimal ELSE 0 END) AS total_reward_day,

    -- Statistiques Semaine
    SUM(is_this_week) AS games_played_week,
    SUM(CASE WHEN is_this_week = 1 THEN reward_decimal ELSE 0 END) AS total_reward_week

FROM RawData
GROUP BY player, username
ORDER BY total_reward DESC;`;

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
      games_played_day:
        row.games_played_day != null ? Number(row.games_played_day) : null,
      games_played_week:
        row.games_played_week != null ? Number(row.games_played_week) : null,
      total_reward: Number(row.total_reward) || 0,
      total_reward_day:
        row.total_reward_day != null ? Number(row.total_reward_day) : null,
      total_reward_week:
        row.total_reward_week != null ? Number(row.total_reward_week) : null,
    }));
  }
  // Format 2: Object with rows array
  else if (data.rows && Array.isArray(data.rows)) {
    rows = data.rows.map((row: any) => ({
      username: row.username || "",
      player: row.player || "",
      games_played: Number(row.games_played) || 0,
      games_played_day:
        row.games_played_day != null ? Number(row.games_played_day) : null,
      games_played_week:
        row.games_played_week != null ? Number(row.games_played_week) : null,
      total_reward: Number(row.total_reward) || 0,
      total_reward_day:
        row.total_reward_day != null ? Number(row.total_reward_day) : null,
      total_reward_week:
        row.total_reward_week != null ? Number(row.total_reward_week) : null,
    }));
  }
  // Format 3: Object with data property
  else if (data.data && Array.isArray(data.data)) {
    rows = data.data.map((row: any) => ({
      username: row.username || "",
      player: row.player || "",
      games_played: Number(row.games_played) || 0,
      games_played_day:
        row.games_played_day != null ? Number(row.games_played_day) : null,
      games_played_week:
        row.games_played_week != null ? Number(row.games_played_week) : null,
      total_reward: Number(row.total_reward) || 0,
      total_reward_day:
        row.total_reward_day != null ? Number(row.total_reward_day) : null,
      total_reward_week:
        row.total_reward_week != null ? Number(row.total_reward_week) : null,
    }));
  }

  return rows;
};

export const useLeaderboard = (): {
  data: LeaderboardRowData[] | undefined;
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

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
};
