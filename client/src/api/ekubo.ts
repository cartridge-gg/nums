import { getEkuboUrl } from "@/config";

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
  chainId: bigint,
  amount: bigint,
  token: string,
  quote: string,
): Promise<SwapQuote> => {
  const base = getEkuboUrl(chainId);
  const token0 = BigInt(token).toString(16);
  const token1 = BigInt(quote).toString(16);
  // if (token0 > token1) {
  //   [token0, token1] = [token1, token0];
  // }
  const response = await fetch(
    `${base}/${amount.toString()}/0x${token0}/0x${token1}`,
  );

  const data = await response.json();

  return {
    impact: data?.price_impact || 0,
    total: data?.total_calculated || 0,
    splits: data?.splits || [],
  };
};
