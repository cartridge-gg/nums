import { getChecksumAddress } from "starknet";
import { initGrpcClient } from "./client";

const DECIMALS = 10n ** 18n;

async function fetch(vaultAddress: string): Promise<number> {
  const client = initGrpcClient();
  const contractAddress = getChecksumAddress(vaultAddress).toLowerCase();

  const query = `SELECT MAX(balance)
FROM token_balances
WHERE contract_address = '${contractAddress}'
LIMIT 1000;`;

  const rows = await client.executeSql(query);

  const raw = rows[0]?.["MAX(balance)"];
  if (!raw) return 0;
  const rawBalance = BigInt(String(raw));
  return Number(rawBalance) / Number(DECIMALS);
}

export const MaxShare = {
  keys: (addr: string) => ["maxShare", addr] as const,
  fetch,
};
