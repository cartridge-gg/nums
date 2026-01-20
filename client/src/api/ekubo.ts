import { addAddressPadding, getChecksumAddress, shortString } from "starknet";
import { getTokenAddress } from "@/config";

const BASE_URL = "https://prod-api-quoter.ekubo.org";
// /23448594291968334/-2000000000000000000000/0xe5f10eddc01699dc899a30dbc3c9858148fa4aa0a47c0ffd85f887ffc4653e/0x33068f6539f8e6e6b131e6b2b814e6c34a5224bc66947c47dab9dfee93b35fb"

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
    BigInt(getTokenAddress(BigInt(shortString.encodeShortString("SN_SEPOLIA"))))
  ) {
    token = addAddressPadding(
      "0xe5f10eddc01699dc899a30dbc3c9858148fa4aa0a47c0ffd85f887ffc4653e",
    );
  }
  const response = await fetch(
    `${BASE_URL}/23448594291968334/${amount.toString()}/${getChecksumAddress(token)}/${getChecksumAddress(otherToken)}`,
  );

  const data = await response.json();

  return {
    impact: data?.price_impact || 0,
    total: data?.total_calculated || 0,
    splits: data?.splits || [],
  };
};
