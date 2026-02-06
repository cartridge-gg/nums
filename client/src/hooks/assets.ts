import { useAccount } from "@starknet-react/core";
import { useMemo } from "react";
import { addAddressPadding, num } from "starknet";
import { useTokens } from "@/hooks/tokens";
import { getCollectionAddress } from "@/config";
import useChain from "./chain";

/**
 * Hook to get player's game IDs via subscription to TokenBalances (ERC721)
 * Simplified wrapper around useAssets for the common use case of getting player's games
 *
 * @returns Object with gameIds array and loading/error states
 */
export const useAssets = () => {
  const { address } = useAccount();
  const { chain } = useChain();
  const collectionAddress = getCollectionAddress(chain.id);

  const { tokenBalances, loading: tokensLoading } = useTokens({
    accountAddresses: address ? [addAddressPadding(address)] : [],
    contractAddresses: [addAddressPadding(num.toHex64(collectionAddress))],
    tokenIds: [], // Empty to get all token IDs
    contractType: "ERC721",
  });

  const gameIds = useMemo(() => {
    return tokenBalances
      .filter((balance) => {
        const balanceValue = BigInt(balance.balance || "0x0");
        return balanceValue > 0n;
      })
      .map((balance) => {
        const tokenId = balance.token_id || "0x0";
        return parseInt(tokenId, 16);
      })
      .filter((id) => id > 0);
  }, [tokenBalances]);

  return {
    gameIds: gameIds,
    isLoading: tokensLoading,
    error: null,
  };
};
