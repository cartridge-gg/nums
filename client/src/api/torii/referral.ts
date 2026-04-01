import { getChecksumAddress } from "starknet";
import { initGrpcClient } from "./client";

export interface ReferralRow {
  username: string;
  recipient: string;
  payment_token: string;
  amount: number;
  referrer: string;
  executed_at: string;
}

const MODEL_ID =
  "0x01c26a4ee3ef91d19e768afcacae51ea5240b2e9a7f861249dcc19af6cc038f2:0x027fb20c50c1bc8220c8d7643d495f921c67c7c69ffe3cb6b5d5a81dd1564fd7";

async function fetch(
  referrerAddress: string,
  starterpackIds: number[],
  protocolFee: number,
  referralFee: number,
): Promise<ReferralRow[]> {
  const client = initGrpcClient();
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
    data->>'$.bundle_id' AS bundle_id,
    executed_at
FROM event_messages_historical
JOIN controllers AS c ON c.address = data->>'$.recipient'
WHERE model_id = '${MODEL_ID}'
AND data->>'$.referrer.Some' IS NOT NULL
AND data->>'$.referrer.Some' = '${address}'
AND data->>'$.bundle_id' IN (${starterpackIds.join(",")})
LIMIT 1000;`;

  const rows = await client.executeSql(query);

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
