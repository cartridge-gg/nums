import { MAINNET_CHAIN_ID, getEkuboUrl, getTokenAddress } from "@/config";

interface SwapQuote {
  impact: number;
  total: number;
  splits: SwapSplit[];
}

// Fallback NUMS↔USDC rate for chains without an Ekubo deployment.
// 1 USDC = 100 NUMS  ⇔  1 NUMS ≈ $0.01
const HARDCODED_NUMS_PER_USDC = 100n;
const NUMS_SCALE = 10n ** 18n;
const USDC_SCALE = 10n ** 6n;

const buildHardcodedQuote = (
  chainId: bigint,
  amount: bigint,
  token: string,
): SwapQuote => {
  const numsAddress = BigInt(getTokenAddress(chainId));
  const inputIsNums = BigInt(token) === numsAddress;

  // NUMS → USDC: out = amount * USDC_SCALE / (NUMS_SCALE * RATE)
  // USDC → NUMS: out = amount * NUMS_SCALE * RATE / USDC_SCALE
  const total = inputIsNums
    ? (amount * USDC_SCALE) / (NUMS_SCALE * HARDCODED_NUMS_PER_USDC)
    : (amount * NUMS_SCALE * HARDCODED_NUMS_PER_USDC) / USDC_SCALE;

  return { impact: 0, total: Number(total), splits: [] };
};

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
  if (chainId !== BigInt(MAINNET_CHAIN_ID)) {
    return buildHardcodedQuote(chainId, amount, token);
  }

  const base = getEkuboUrl(chainId);
  const token0 = BigInt(token).toString(16);
  const token1 = BigInt(quote).toString(16);
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
