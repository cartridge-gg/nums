import { getChecksumAddress } from "starknet";
import { executeSql, getSqlUrl } from "./sql";

const ZERO_BALANCE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

async function fetch(
  gameId: number,
  collectionAddress: string,
): Promise<string | undefined> {
  const tokenIdHex = `0x${gameId.toString(16).padStart(64, "0")}`;

  const query = `SELECT account_address
FROM token_balances AS tb
WHERE tb.balance != '${ZERO_BALANCE}'
AND tb.contract_address = '${getChecksumAddress(collectionAddress).toLowerCase()}'
AND SUBSTR(tb.token_id, INSTR(tb.token_id, ':') + 1) = '${tokenIdHex}'
LIMIT 1000;`;

  const rows = await executeSql<{ account_address?: string }>(
    getSqlUrl(),
    query,
  );
  return rows[0]?.account_address;
}

export const Owner = {
  keys: (gameId: number | null | undefined, collection: string) =>
    ["owner", gameId, collection] as const,
  fetch,
};
