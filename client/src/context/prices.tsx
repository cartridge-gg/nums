import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useMemo } from "react";
import { getSwapQuote } from "@/api/ekubo";
import { getTokenAddress } from "@/config";
import { useNetwork } from "@starknet-react/core";

const USDC_ADDRESS =
  "0x53C91253BC9682c04929cA02ED00b3E423f6710D2ee7e0D5EBB06F3eCF368A8";

type PricesProviderProps = {
  children: React.ReactNode;
};

type PricesProviderState = {
  getTokenPrice: (tokenAddress: string) => string | null;
  getNumsPrice: () => string | null;
  isLoading: boolean;
};

const PricesProviderContext = createContext<PricesProviderState | undefined>(
  undefined,
);

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

export function PricesProvider({ children, ...props }: PricesProviderProps) {
  const { chain } = useNetwork();
  const numsAddress = useMemo(() => getTokenAddress(chain.id), [chain.id]);

  // Track all token addresses that need prices
  // For now, we'll fetch NUMS price by default
  const tokenAddresses = useMemo(() => [numsAddress], [numsAddress]);

  const query = useQuery({
    queryKey: ["tokenUsdPrices", tokenAddresses.join(",")],
    queryFn: () => fetchAllPrices(tokenAddresses),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    enabled: tokenAddresses.length > 0,
  });

  const getTokenPrice = useMemo(() => {
    return (tokenAddress: string): string | null => {
      if (!query.data) return null;
      return query.data.get(tokenAddress.toLowerCase()) || null;
    };
  }, [query.data]);

  const getNumsPrice = useMemo(() => {
    return (): string | null => {
      return getTokenPrice(numsAddress);
    };
  }, [getTokenPrice, numsAddress]);

  return (
    <PricesProviderContext.Provider
      {...props}
      value={{
        getTokenPrice,
        getNumsPrice,
        isLoading: query.isLoading,
      }}
    >
      {children}
    </PricesProviderContext.Provider>
  );
}

export const usePrices = () => {
  const context = useContext(PricesProviderContext);
  if (context === undefined) {
    throw new Error("usePrices must be used within PricesProvider");
  }
  return context;
};
