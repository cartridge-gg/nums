import { queryKeys } from "@/api/keys";
import {
  Referral as ReferralApi,
  type ReferralRow,
} from "@/api/torii/referral";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "@starknet-react/core";
import { PROTOCOL_FEE, REFERRAL_FEE } from "@/constants";
import { useBundles } from "@/context/bundles";
export type Referral = ReferralRow;

export const useReferral = () => {
  const { address } = useAccount();
  const { bundles } = useBundles();
  const bundleIds = bundles.map((bundle) => bundle.id);

  const query = useQuery<Referral[]>({
    queryKey: queryKeys.referrals(address, bundleIds),
    queryFn: () => {
      if (!address) {
        throw new Error("Account address is required");
      }
      return ReferralApi.fetch(address, bundleIds, PROTOCOL_FEE, REFERRAL_FEE);
    },
    enabled: false,
    staleTime: 0,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
};
