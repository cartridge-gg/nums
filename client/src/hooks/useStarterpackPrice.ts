import { useQuery } from "@tanstack/react-query";
import { getSwapQuote } from "@/api/ekubo";

const USDC_ADDRESS =
  "0x053C91253BC9682c04929cA02ED00b3E423f6710D2ee7e0D5EBB06F3eCF368A8";

/**
 * Hook to get the starterpack price in USD
 * @param price - The price in wei (already multiplied by 1e18)
 * @param paymentToken - The address of the payment token
 * @returns The price formatted as a string (e.g., "12.50") or null if not available
 */
export const useStarterpackPrice = (
  price: bigint | null | undefined,
  paymentToken: string | null | undefined,
): string | null => {
  const { data: usdPrice, error } = useQuery({
    queryKey: ["starterpackPrice", price?.toString(), paymentToken],
    queryFn: async () => {
      if (!price || !paymentToken || BigInt(paymentToken) === 0n) {
        return null;
      }

      try {
        const swap = await getSwapQuote(-price, paymentToken, USDC_ADDRESS);
        const usdAmount = -swap.total / 1e6;
        return usdAmount.toFixed(2);
      } catch (error) {
        console.error("Failed to fetch starterpack price:", error);
        return null;
      }
    },
    enabled: !!price && !!paymentToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });

  if (error) {
    console.error("Starterpack price query error:", error);
  }

  return usdPrice || null;
};
