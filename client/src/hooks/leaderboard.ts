import { DEFAULT_CHAIN_ID, dojoConfigs } from "@/config";
import { useQuery } from "@tanstack/react-query";

export interface LeaderboardRowData {
  username: string;
  player: string;
  games_played: number;
  games_played_day: number | null;
  games_played_week: number | null;
  average_score: number;
  average_score_day: number | null;
  average_score_week: number | null;
}

export type RangeType = "1D" | "1W" | "All";

const fetchLeaderboard = async (): Promise<LeaderboardRowData[]> => {
  const url = `${dojoConfigs[DEFAULT_CHAIN_ID].toriiUrl}/sql`;

  if (!url) {
    throw new Error("Torii SQL URL is not defined");
  }

  const sqlQuery = `SELECT 
    c.username,
    g.player,
    COUNT(*) AS games_played,
    SUM(CASE WHEN date(g.internal_executed_at) = date('now') THEN 1 ELSE 0 END) AS games_played_day,
    AVG(CASE WHEN date(g.internal_executed_at) = date('now') THEN 
        (CASE substr(lower(g.score), -2, 1) WHEN 'a' THEN 10 WHEN 'b' THEN 11 WHEN 'c' THEN 12 WHEN 'd' THEN 13 WHEN 'e' THEN 14 WHEN 'f' THEN 15 ELSE CAST(substr(g.score, -2, 1) AS INT) END * 16) +
        (CASE substr(lower(g.score), -1, 1) WHEN 'a' THEN 10 WHEN 'b' THEN 11 WHEN 'c' THEN 12 WHEN 'd' THEN 13 WHEN 'e' THEN 14 WHEN 'f' THEN 15 ELSE CAST(substr(g.score, -1, 1) AS INT) END)
    END) AS average_score_day,
    SUM(CASE WHEN strftime('%Y-%W', g.internal_executed_at) = strftime('%Y-%W', 'now') THEN 1 ELSE 0 END) AS games_played_week,
    AVG(CASE WHEN strftime('%Y-%W', g.internal_executed_at) = strftime('%Y-%W', 'now') THEN 
        (CASE substr(lower(g.score), -2, 1) WHEN 'a' THEN 10 WHEN 'b' THEN 11 WHEN 'c' THEN 12 WHEN 'd' THEN 13 WHEN 'e' THEN 14 WHEN 'f' THEN 15 ELSE CAST(substr(g.score, -2, 1) AS INT) END * 16) +
        (CASE substr(lower(g.score), -1, 1) WHEN 'a' THEN 10 WHEN 'b' THEN 11 WHEN 'c' THEN 12 WHEN 'd' THEN 13 WHEN 'e' THEN 14 WHEN 'f' THEN 15 ELSE CAST(substr(g.score, -1, 1) AS INT) END)
    END) AS average_score_week,
    AVG(
        (CASE substr(lower(g.score), -2, 1) WHEN 'a' THEN 10 WHEN 'b' THEN 11 WHEN 'c' THEN 12 WHEN 'd' THEN 13 WHEN 'e' THEN 14 WHEN 'f' THEN 15 ELSE CAST(substr(g.score, -2, 1) AS INT) END * 16) +
        (CASE substr(lower(g.score), -1, 1) WHEN 'a' THEN 10 WHEN 'b' THEN 11 WHEN 'c' THEN 12 WHEN 'd' THEN 13 WHEN 'e' THEN 14 WHEN 'f' THEN 15 ELSE CAST(substr(g.score, -1, 1) AS INT) END)
    ) AS average_score

FROM "NUMS-LeaderboardScore" as g
JOIN controllers as c ON c.address = g.player
GROUP BY g.player
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
      games_played_day:
        row.games_played_day != null ? Number(row.games_played_day) : null,
      games_played_week:
        row.games_played_week != null ? Number(row.games_played_week) : null,
      average_score: Number(row.average_score) || 0,
      average_score_day:
        row.average_score_day != null ? Number(row.average_score_day) : null,
      average_score_week:
        row.average_score_week != null ? Number(row.average_score_week) : null,
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
      average_score: Number(row.average_score) || 0,
      average_score_day:
        row.average_score_day != null ? Number(row.average_score_day) : null,
      average_score_week:
        row.average_score_week != null ? Number(row.average_score_week) : null,
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
      average_score: Number(row.average_score) || 0,
      average_score_day:
        row.average_score_day != null ? Number(row.average_score_day) : null,
      average_score_week:
        row.average_score_week != null ? Number(row.average_score_week) : null,
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
