import { erc20Metadata } from "@cartridge/presets";
import { useQuery } from "@tanstack/react-query";
import makeBlockie from "ethereum-blockies-base64";
import { useMemo } from "react";
import { Provider } from "starknet";
import { getSwapQuote } from "@/api/ekubo";
import { dojoConfigs } from "@/config";
import { useTournaments } from "@/context/tournaments";
import { PrizeModel } from "@/models/prize";
import useChain from "./chain";
import { ERC20 } from "./erc20";

const USDC_ADDRESS =
  "0x053C91253BC9682c04929cA02ED00b3E423f6710D2ee7e0D5EBB06F3eCF368A8";

const NUMS = {
  name: "Nums",
  symbol: "NUMS",
  decimals: 18,
  l2_token_address:
    "0xe5f10eddc01699dc899a30dbc3c9858148fa4aa0a47c0ffd85f887ffc4653e",
  sort_order: 1,
  total_supply: 1,
  hidden: true,
  logo_url:
    "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/90868d05-cb75-4c42-278c-5a540db2cf00/logo",
};

// ============================================================================
// Types
// ============================================================================

type Balance = {
  value: bigint;
  formatted: string;
};

// ============================================================================
// Utilities
// ============================================================================

/**
 * Calculate balance from raw amount and decimals
 */
export function calculateBalance(amount: string, decimals: number): Balance {
  const value = BigInt(amount);

  if (decimals == null || decimals < 0 || !Number.isInteger(decimals)) {
    throw new Error("Decimals must be a non-negative integer");
  }

  const factor = 10n ** BigInt(decimals);
  const wholePart = value / factor;
  const fractionalPart = value % factor;

  let decimalStr = wholePart.toString();

  const absFractionalPart =
    fractionalPart < 0n ? -fractionalPart : fractionalPart;
  if (absFractionalPart > 0n) {
    const fractionalStr = absFractionalPart.toString().padStart(decimals, "0");
    const trimmedFractional = fractionalStr.replace(/0+$/, "");
    if (trimmedFractional) {
      decimalStr += `.${trimmedFractional}`;
    }
  }

  const adjusted = parseFloat(decimalStr);
  const rounded = Math.round(adjusted * 100) / 100;
  const formatted = rounded.toString();

  return {
    value,
    formatted,
  };
}

const fetchTokenMetadata = async (
  contractAddress: string,
  provider: Provider,
) => {
  const preset = [...erc20Metadata, NUMS].find(
    (m) => BigInt(m.l2_token_address) === BigInt(contractAddress),
  );

  const erc20 = new ERC20({
    address: contractAddress,
    provider,
    logoUrl: preset?.logo_url || makeBlockie(contractAddress),
  });

  await erc20.init();
  return erc20.metadata();
};

const fetchPrizesMetadata = async (
  prizes: PrizeModel[],
  provider: Provider,
) => {
  const uniqueAddresses = Array.from(
    new Set(prizes.map((p) => p.address.toLowerCase())),
  );

  const metadataPromises = uniqueAddresses.map((address) =>
    fetchTokenMetadata(address, provider),
  );

  const metadataResults = await Promise.allSettled(metadataPromises);

  const metadataMap = new Map();
  uniqueAddresses.forEach((address, index) => {
    const result = metadataResults[index];
    if (result.status === "fulfilled") {
      metadataMap.set(address, result.value);
    }
  });

  return metadataMap;
};

const fetchTokenUsdPrice = async (
  tokenAddress: string,
): Promise<string | null> => {
  try {
    const swap = await getSwapQuote(
      100n * 10n ** 18n,
      tokenAddress,
      USDC_ADDRESS,
    );
    const price = (swap.total / 1e6 / 100).toString();
    return price;
  } catch (error) {
    console.error(`Failed to fetch price for ${tokenAddress}:`, error);
    return null;
  }
};

const fetchAllPrices = async (
  tokenAddresses: string[],
): Promise<Map<string, string>> => {
  const pricePromises = tokenAddresses.map((address) =>
    fetchTokenUsdPrice(address),
  );

  const prices = await Promise.allSettled(pricePromises);

  const priceMap = new Map<string, string>();
  tokenAddresses.forEach((address, index) => {
    const result = prices[index];
    if (result.status === "fulfilled" && result.value) {
      priceMap.set(address.toLowerCase(), result.value);
    }
  });

  return priceMap;
};

// ============================================================================
// Hooks
// ============================================================================

/**
 * Fetch ERC20 metadata for prizes
 */
export const usePrizeTokens = (prizes: PrizeModel[]) => {
  const { chain } = useChain();

  const provider = useMemo(() => {
    const chainIdHex = `0x${chain.id.toString(16)}`;
    const rpcUrl = dojoConfigs[chainIdHex].rpcUrl;
    return new Provider({ nodeUrl: rpcUrl });
  }, [chain.id]);

  const query = useQuery({
    queryKey: ["prizeTokens", prizes.map((p) => p.address).join(",")],
    queryFn: () => fetchPrizesMetadata(prizes, provider),
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    enabled: prizes.length > 0,
  });

  const enrichedPrizes: PrizeModel[] = useMemo(() => {
    if (!query.data) return prizes;

    return prizes.map((prize) => {
      const meta = query.data.get(prize.address.toLowerCase());
      if (!meta) return prize;

      const balance = calculateBalance(prize.amount.toString(), meta.decimals);

      return new PrizeModel(
        prize.identifier,
        prize.tournament_id,
        prize.address,
        prize.amount,
        prize.price,
        {
          name: meta.name,
          symbol: meta.symbol,
          decimals: meta.decimals,
          logoUrl: meta.logoUrl,
        },
        balance.formatted,
        prize.usdPrice,
        prize.totalUsd,
      );
    });
  }, [prizes, query.data]);

  return {
    prizes: enrichedPrizes,
    loading: query.isLoading,
    error: query.error,
  };
};

/**
 * Fetch USD prices for prize tokens
 */
export const usePrizeUsdValues = (prizes: PrizeModel[]) => {
  const tokenAddresses = useMemo(() => {
    return Array.from(new Set(prizes.map((p) => p.address))).filter(
      (address) =>
        address !==
        "0x03e6f513ad6a9acf40beb59545334caf9d961c8bad7b4b7d6bf4dc5eec28bc1c",
    );
  }, [prizes]);

  const query = useQuery({
    queryKey: ["prizeUsdPrices", tokenAddresses.join(",")],
    queryFn: () => fetchAllPrices(tokenAddresses),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    enabled: tokenAddresses.length > 0,
  });

  const enrichedPrizes: PrizeModel[] = useMemo(() => {
    if (!query.data) return prizes;

    return prizes.map((prize) => {
      const usdPrice = query.data.get(prize.address.toLowerCase()) || null;

      let totalUsd: string | null = null;
      if (usdPrice && prize.formattedAmount) {
        const pricePerToken = parseFloat(usdPrice);
        const tokenAmount = parseFloat(prize.formattedAmount);
        totalUsd = (pricePerToken * tokenAmount).toFixed(2);
      }

      return new PrizeModel(
        prize.identifier,
        prize.tournament_id,
        prize.address,
        prize.amount,
        prize.price,
        prize.metadata,
        prize.formattedAmount,
        usdPrice || "0.00",
        totalUsd || "0.00",
      );
    });
  }, [prizes, query.data]);

  return {
    prizes: enrichedPrizes,
    loading: query.isLoading,
    error: query.error,
  };
};

/**
 * Main hook to get prizes with metadata and USD values
 * Automatically fetches prizes from tournaments context
 */
export const usePrizesWithUsd = () => {
  const { prizes: rawPrizes } = useTournaments();
  const { prizes: prizesWithMetadata, loading: metadataLoading } =
    usePrizeTokens(rawPrizes || []);
  const { prizes: prizesWithUsd, loading: usdLoading } =
    usePrizeUsdValues(prizesWithMetadata);

  return {
    prizes: prizesWithUsd,
    loading: metadataLoading || usdLoading,
  };
};
