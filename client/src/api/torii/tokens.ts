import type * as torii from "@dojoengine/torii-wasm";
import type { TokenBalance, TokenContract } from "@dojoengine/torii-wasm";

const CONTRACT_LIMIT = 1_000;
const BALANCE_LIMIT = 1_000;

export async function fetchTokenContracts(
  client: torii.ToriiClient,
  contractAddresses: string[],
  contractType: "ERC20" | "ERC721" = "ERC20",
): Promise<TokenContract[]> {
  const result = await client.getTokenContracts({
    contract_addresses: contractAddresses,
    contract_types: [contractType],
    pagination: {
      cursor: undefined,
      direction: "Backward",
      limit: CONTRACT_LIMIT,
      order_by: [],
    },
  });
  return result.items;
}

export async function fetchTokenBalances(
  client: torii.ToriiClient,
  contractAddresses: string[],
  accountAddresses: string[],
): Promise<TokenBalance[]> {
  const result = await client.getTokenBalances({
    contract_addresses: contractAddresses,
    account_addresses: accountAddresses,
    token_ids: [],
    pagination: {
      cursor: undefined,
      direction: "Backward",
      limit: BALANCE_LIMIT,
      order_by: [],
    },
  });
  return result.items;
}

export function updateTokenBalance(
  previousBalances: TokenBalance[],
  newBalance: TokenBalance,
): TokenBalance[] {
  if (
    BigInt(newBalance.account_address) === 0n &&
    BigInt(newBalance.contract_address) === 0n
  ) {
    return previousBalances;
  }

  const existingIndex = previousBalances.findIndex(
    (balance) =>
      BigInt(balance.token_id || 0) === BigInt(newBalance.token_id || 0) &&
      BigInt(balance.contract_address) ===
        BigInt(newBalance.contract_address) &&
      BigInt(balance.account_address) === BigInt(newBalance.account_address),
  );

  if (existingIndex === -1) {
    return [...previousBalances, newBalance];
  }

  return previousBalances.map((balance, index) =>
    index === existingIndex ? newBalance : balance,
  );
}
