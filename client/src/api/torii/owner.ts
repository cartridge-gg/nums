import { getChecksumAddress } from "starknet";
import { initGrpcClient } from "./client";

const ZERO_BALANCE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

async function fetch(
  gameId: number,
  collectionAddress: string,
): Promise<string | undefined> {
  const client = initGrpcClient();
  const tokenIdHex = `0x${gameId.toString(16).padStart(64, "0")}`;

  const query = `SELECT account_address
FROM token_balances AS tb
WHERE tb.balance != '${ZERO_BALANCE}'
AND tb.contract_address = '${getChecksumAddress(collectionAddress).toLowerCase()}'
AND SUBSTR(tb.token_id, INSTR(tb.token_id, ':') + 1) = '${tokenIdHex}'
LIMIT 1000;`;

  const rows = await client.executeSql(query);
  return rows[0]?.account_address as string | undefined;
}

export const Owner = {
  keys: (gameId: number | null | undefined, collection: string) =>
    ["owner", gameId, collection] as const,
  fetch,
};
