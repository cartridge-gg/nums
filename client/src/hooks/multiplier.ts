import { useState, useEffect, useRef } from "react";
import { useNetwork } from "@starknet-react/core";
import { getSwapQuote } from "@/api/ekubo";
import { MULTIPLIER_PRECISION } from "@/constants";
import { Rewarder } from "@/helpers/rewarder";
import { getTokenAddress } from "@/config";
import { getChecksumAddress } from "starknet";

const DEBOUNCE_MS = 300;
const EMA_SCORE_PRECISION = 1000n;

export interface UseMultiplierParams {
  basePrice: bigint;
  packMultiplier: bigint;
  burnPercentage: bigint;
  slotCount: bigint;
  averageScore: bigint;
  averageWeight: bigint;
  currentSupply: bigint;
  targetSupply: bigint;
  quoteAddress: string;
}

/**
 * Estimates the on-chain multiplier by fetching the real USDC → NUMS swap quote
 * from Ekubo (includes actual slippage) instead of using a hardcoded fee.
 * Updates are debounced by 300 ms.
 */
export const useMultiplier = ({
  basePrice,
  packMultiplier,
  burnPercentage,
  slotCount,
  averageScore,
  averageWeight,
  currentSupply,
  targetSupply,
  quoteAddress,
}: UseMultiplierParams): { multiplier: number; isLoading: boolean } => {
  const { chain } = useNetwork();
  const numsAddress = getChecksumAddress(getTokenAddress(chain.id));
  const [multiplier, setMultiplier] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastSuccessfulPackMultiplierRef = useRef<bigint | null>(null);

  // Derive loading: true immediately when packMultiplier changes (before useEffect)
  // or while fetch is in progress
  const isLoading =
    isFetching || lastSuccessfulPackMultiplierRef.current !== packMultiplier;

  useEffect(() => {
    if (
      !burnPercentage ||
      !currentSupply ||
      !targetSupply ||
      !numsAddress ||
      !quoteAddress
    )
      return;

    // burn_usdc = burn_percentage * pack_multiplier * base_price / 100  (6-dec USDC)
    const burnUsdc = (burnPercentage * packMultiplier * basePrice) / 100n;
    if (burnUsdc === 0n) return;

    setIsFetching(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        // Real NUMS output for burnUsdc USDC via Ekubo — includes slippage
        const quote = await getSwapQuote(
          chain.id,
          burnUsdc,
          quoteAddress,
          numsAddress,
        );
        
        const burnPerGame = BigInt(Math.round(quote.total));
        if (burnPerGame === 0n) return;

        const supplyPerGame =
          currentSupply > burnPerGame ? currentSupply - burnPerGame : 0n;
        const avgDen = averageWeight * EMA_SCORE_PRECISION;
        const mulRaw = Rewarder.multiplier(
          supplyPerGame,
          targetSupply,
          burnPerGame,
          averageScore,
          avgDen,
          slotCount,
        );
        setMultiplier(Number(mulRaw) / Number(MULTIPLIER_PRECISION));
        lastSuccessfulPackMultiplierRef.current = packMultiplier;
      } catch {
        // Keep previous value on network/API error
      } finally {
        setIsFetching(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timerRef.current);
  }, [
    basePrice,
    packMultiplier,
    burnPercentage,
    slotCount,
    averageScore,
    averageWeight,
    currentSupply,
    targetSupply,
    numsAddress,
    quoteAddress,
    chain.id,
  ]);

  return { multiplier, isLoading };
};
