import { addAddressPadding, getChecksumAddress, shortString } from "starknet";
import { getNumsAddress } from "@/config";

interface SwapQuote {
  impact: number;
  total: number;
  splits: SwapSplit[];
}

interface SwapSplit {
  amount_specified: string;
  route: RouteNode[];
}

interface RouteNode {
  pool_key: {
    token0: string;
    token1: string;
    fee: string;
    tick_spacing: string;
    extension: string;
  };
  sqrt_ratio_limit: string;
  skip_ahead: string;
}

export const getSwapQuote = async (
  amount: bigint,
  token: string,
  otherToken: string,
): Promise<SwapQuote> => {
  // Hack for NUMS price, use the mainnet address instead
  if (
    BigInt(token) ===
    BigInt(getNumsAddress(BigInt(shortString.encodeShortString("SN_SEPOLIA"))))
  ) {
    token = addAddressPadding(
      "0xe5f10eddc01699dc899a30dbc3c9858148fa4aa0a47c0ffd85f887ffc4653e",
    );
  }
  const response = await fetch(
    `https://starknet-mainnet-quoter-api.ekubo.org/${amount.toString()}/${getChecksumAddress(token)}/${getChecksumAddress(otherToken)}`,
  );

  const data = await response.json();

  return {
    impact: data?.price_impact || 0,
    total: data?.total_calculated || 0,
    splits: data?.splits || [],
  };
};
