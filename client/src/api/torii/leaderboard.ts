import { initGrpcClient } from "./client";

export interface LeaderboardRow {
  username: string;
  player: string;
  games_played: number;
  games_played_day: number | null;
  games_played_week: number | null;
  total_reward: number;
  total_reward_day: number | null;
  total_reward_week: number | null;
}

async function fetch(): Promise<LeaderboardRow[]> {
  const client = initGrpcClient();
  const query = `WITH RawData AS (
    SELECT 
        c.username,
        g.player_id as player,
        g.internal_executed_at,
        (CASE substr(lower(g.reward), -6, 1) WHEN 'a' THEN 10 WHEN 'b' THEN 11 WHEN 'c' THEN 12 WHEN 'd' THEN 13 WHEN 'e' THEN 14 WHEN 'f' THEN 15 ELSE CAST(NULLIF(substr(g.reward, -6, 1), '') AS INT) END * 1048576) +
        (CASE substr(lower(g.reward), -5, 1) WHEN 'a' THEN 10 WHEN 'b' THEN 11 WHEN 'c' THEN 12 WHEN 'd' THEN 13 WHEN 'e' THEN 14 WHEN 'f' THEN 15 ELSE CAST(NULLIF(substr(g.reward, -5, 1), '') AS INT) END * 65536) +
        (CASE substr(lower(g.reward), -4, 1) WHEN 'a' THEN 10 WHEN 'b' THEN 11 WHEN 'c' THEN 12 WHEN 'd' THEN 13 WHEN 'e' THEN 14 WHEN 'f' THEN 15 ELSE CAST(NULLIF(substr(g.reward, -4, 1), '') AS INT) END * 4096) +
        (CASE substr(lower(g.reward), -3, 1) WHEN 'a' THEN 10 WHEN 'b' THEN 11 WHEN 'c' THEN 12 WHEN 'd' THEN 13 WHEN 'e' THEN 14 WHEN 'f' THEN 15 ELSE CAST(NULLIF(substr(g.reward, -3, 1), '') AS INT) END * 256) +
        (CASE substr(lower(g.reward), -2, 1) WHEN 'a' THEN 10 WHEN 'b' THEN 11 WHEN 'c' THEN 12 WHEN 'd' THEN 13 WHEN 'e' THEN 14 WHEN 'f' THEN 15 ELSE CAST(NULLIF(substr(g.reward, -2, 1), '') AS INT) END * 16) +
        (CASE substr(lower(g.reward), -1, 1) WHEN 'a' THEN 10 WHEN 'b' THEN 11 WHEN 'c' THEN 12 WHEN 'd' THEN 13 WHEN 'e' THEN 14 WHEN 'f' THEN 15 ELSE CAST(NULLIF(substr(g.reward, -1, 1), '') AS INT) END)
        AS reward_decimal,
        CASE WHEN date(g.internal_executed_at) = date('now') THEN 1 ELSE 0 END AS is_today,
        CASE WHEN strftime('%Y-%W', g.internal_executed_at) = strftime('%Y-%W', 'now') THEN 1 ELSE 0 END AS is_this_week
    FROM "NUMS-Claimed" AS g
    JOIN controllers AS c ON c.address = g.player_id
)

SELECT 
    username,
    player,
    COUNT(*) AS games_played,
    SUM(reward_decimal) AS total_reward,
    SUM(is_today) AS games_played_day,
    SUM(CASE WHEN is_today = 1 THEN reward_decimal ELSE 0 END) AS total_reward_day,
    SUM(is_this_week) AS games_played_week,
    SUM(CASE WHEN is_this_week = 1 THEN reward_decimal ELSE 0 END) AS total_reward_week

FROM RawData
GROUP BY player, username
ORDER BY total_reward DESC;`;

  const rows = await client.executeSql(query);

  return rows.map((row) => ({
    username: String(row.username || ""),
    player: String(row.player || ""),
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

export const Leaderboard = {
  keys: () => ["leaderboard"] as const,
  fetch,
};
