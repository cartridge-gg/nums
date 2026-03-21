import { CallData, type Provider, uint256 } from "starknet";

const parseU256 = (result: string[]): bigint =>
  uint256.uint256ToBN({ low: result[0], high: result[1] });

const encodeU256 = (value: bigint): string[] => {
  const { low, high } = uint256.bnToUint256(value);
  return CallData.compile({ low, high });
};

export async function previewDeposit(
  provider: Provider,
  vaultAddress: string,
  assets: bigint,
): Promise<bigint> {
  const result = await provider.callContract({
    contractAddress: vaultAddress,
    entrypoint: "preview_deposit",
    calldata: encodeU256(assets),
  });
  return parseU256(result);
}

export async function previewMint(
  provider: Provider,
  vaultAddress: string,
  shares: bigint,
): Promise<bigint> {
  const result = await provider.callContract({
    contractAddress: vaultAddress,
    entrypoint: "preview_mint",
    calldata: encodeU256(shares),
  });
  return parseU256(result);
}

export async function previewWithdraw(
  provider: Provider,
  vaultAddress: string,
  assets: bigint,
): Promise<bigint> {
  const result = await provider.callContract({
    contractAddress: vaultAddress,
    entrypoint: "preview_withdraw",
    calldata: encodeU256(assets),
  });
  return parseU256(result);
}

export async function previewRedeem(
  provider: Provider,
  vaultAddress: string,
  shares: bigint,
): Promise<bigint> {
  const result = await provider.callContract({
    contractAddress: vaultAddress,
    entrypoint: "preview_redeem",
    calldata: encodeU256(shares),
  });
  return parseU256(result);
}
