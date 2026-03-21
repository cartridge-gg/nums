import { executeSql, getSqlUrl } from "./sql";

export interface ActivityRow {
  username: string;
  gameId: number;
  score: number;
  payout: string;
  to: string;
  timestamp: number;
}

function parseHexDigit(char: string): number {
  if (char >= "0" && char <= "9") return Number.parseInt(char, 16);
  if (char >= "a" && char <= "f") return char.charCodeAt(0) - 87;
  return 0;
}

function parseHexScore(scoreHex: string): number {
  const s = scoreHex.toLowerCase();
  return parseHexDigit(s[s.length - 2]) * 16 + parseHexDigit(s[s.length - 1]);
}

async function fetch(limit: number, offset: number): Promise<ActivityRow[]> {
  const query = `SELECT
    c.username,
    s.player,
    s.game_id,
    s.score,
    s.timestamp
FROM "NUMS-LeaderboardScore" AS s
JOIN controllers AS c ON s.player = c.address
ORDER BY timestamp DESC
LIMIT ${limit}
OFFSET ${offset};`;

  const rows = await executeSql<Record<string, unknown>>(getSqlUrl(), query);

  return rows.map((row) => {
    const gameId = Number(row.game_id) || 0;
    const score = parseHexScore(String(row.score || "0"));
    return {
      username: String(row.username || ""),
      gameId,
      score,
      payout: `+$${(score * 0.05).toFixed(2)}`,
      to: `/game/${gameId}`,
      timestamp: Number(row.timestamp) || 0,
    };
  });
}

export const Activities = {
  keys: () => ["activities"] as const,
  fetch,
};
