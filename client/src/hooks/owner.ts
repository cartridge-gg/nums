import { DEFAULT_CHAIN_ID, chains, getCollectionAddress } from "@/config";
import { queryKeys } from "@/api/keys";
import { Owner } from "@/api/torii/owner";
import { useQuery } from "@tanstack/react-query";
import { useNetwork } from "@starknet-react/core";

export const useOwner = (gameId?: number | null) => {
  const { chain } = useNetwork();
  const chainId = chain?.id ?? chains[DEFAULT_CHAIN_ID].id;
  const collectionAddress = getCollectionAddress(chainId);

  const query = useQuery({
    queryKey: queryKeys.owner(gameId, collectionAddress),
    queryFn: () => Owner.fetch(gameId!, collectionAddress),
    enabled: gameId !== undefined && gameId !== null,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    owner: query.data,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
};
