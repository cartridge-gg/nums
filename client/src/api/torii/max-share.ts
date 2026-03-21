import { getChecksumAddress } from "starknet";
import { executeSql, getSqlUrl } from "./sql";

const DECIMALS = 10n ** 18n;

async function fetch(vaultAddress: string): Promise<number> {
  const contractAddress = getChecksumAddress(vaultAddress).toLowerCase();

  const query = `SELECT MAX(balance)
FROM token_balances
WHERE contract_address = '${contractAddress}'
LIMIT 1000;`;

  const rows = await executeSql<Record<string, unknown>>(getSqlUrl(), query);

  const raw = rows[0]?.["MAX(balance)"];
  if (!raw) return 0;
  const rawBalance = BigInt(String(raw));
  return Number(rawBalance) / Number(DECIMALS);
}

export const MaxShare = {
  keys: (addr: string) => ["maxShare", addr] as const,
  fetch,
};
