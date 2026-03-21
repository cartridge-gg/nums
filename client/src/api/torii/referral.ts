import { getChecksumAddress } from "starknet";
import { getArcadeSqlUrl, executeSql } from "./sql";

export interface ReferralRow {
  username: string;
  recipient: string;
  payment_token: string;
  amount: number;
  referrer: string;
  executed_at: string;
}

const MODEL_ID =
  "0x07a079295990e43441a7389fdc3b9ba063c6cd6aee16fb846f598c42a9f04ff7:0x06e1f6f6ed6b1d58c790b45fea70226d9a9ea380626d8fdf0050a730c24ffb84";

async function fetch(
  referrerAddress: string,
  starterpackIds: number[],
  protocolFee: number,
  referralFee: number,
): Promise<ReferralRow[]> {
  const address = getChecksumAddress(BigInt(referrerAddress)).toLowerCase();

  if (!/^0x[a-fA-F0-9]+$/.test(address)) {
    throw new Error(`Invalid referrer address format: ${address}`);
  }

  const query = `SELECT
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
AND data->>'$.referrer.Some' = '${address}'
AND data->>'$.starterpack_id' IN (${starterpackIds.join(",")})
LIMIT 1000;`;

  const rows = await executeSql<Record<string, unknown>>(
    getArcadeSqlUrl(),
    query,
  );

  return rows.map((row) => ({
    username: String(row.username || ""),
    recipient: String(row.recipient || ""),
    payment_token: String(row.payment_token || ""),
    amount:
      (Number(row.amount) / 10 ** 6) * (1 - protocolFee) * referralFee || 0,
    referrer: String(row.referrer || ""),
    executed_at: String(row.executed_at || ""),
  }));
}

export const Referral = {
  keys: (addr: string | undefined, ids: number[]) =>
    ["referrals", addr, ids] as const,
  fetch,
};
