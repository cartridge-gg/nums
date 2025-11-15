import { useAccount } from "@starknet-react/core";
import { useMemo } from "react";
import { addAddressPadding } from "starknet";
import { useTokens } from "@/hooks/useTokens";

/**
 * Hook to get player's game IDs via subscription to TokenBalances (ERC721)
 * Simplified wrapper around useAssets for the common use case of getting player's games
 *
 * @returns Object with gameIds array and loading/error states
 */
export const usePlayerGames = () => {
  const { address } = useAccount();

  const { balances } = useTokens({
    accountAddresses: address ? [addAddressPadding(address)] : [],
    contractAddresses: [], // Empty to get all ERC721 tokens
    tokenIds: [], // Empty to get all token IDs
    contractType: "ERC721",
  });

  const gameIds = useMemo(() => {
    return balances
      .filter((balance) => {
        const balanceValue = BigInt(balance.balance || "0x0");
        return balanceValue > 0n;
      })
      .map((balance) => {
        const tokenId = balance.token_id || "0x0";
        return parseInt(tokenId, 16);
      })
      .filter((id) => id > 0);
  }, [balances]);

  return {
    gameIds: gameIds,
    isLoading: false, // Subscription doesn't have explicit loading state
    error: null,
  };
};
