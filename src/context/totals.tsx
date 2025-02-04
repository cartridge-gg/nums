import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAccount } from "@starknet-react/core";
import { useQuery } from "urql";
import { useInterval } from "usehooks-ts";
import { graphql } from "@/graphql/appchain";

const TotalsQuery = graphql(`
  query TotalsQuery($player: ContractAddress) {
    numsTotalsModels(where: { playerEQ: $player }) {
      edges {
        node {
          rewards_earned
          rewards_claimed
        }
      }
    }
  }
`);

interface TotalsContextType {
  rewardsEarned: number;
  rewardsClaimed: number;
}

const TotalsContext = createContext<TotalsContextType | undefined>(undefined);

export function TotalsProvider({ children }: { children: ReactNode }) {
  const [rewardsEarned, setRewardsEarned] = useState<number>(0);
  const [rewardsClaimed, setRewardsClaimed] = useState<number>(0);
  const { address, account } = useAccount();

  const [totalsResult, reexecuteQuery] = useQuery({
    query: TotalsQuery,
    variables: {
      player: address,
    },
    requestPolicy: account ? "network-only" : "cache-and-network",
  });

  useInterval(() => {
    reexecuteQuery();
  }, 1000);

  useEffect(() => {
    const totalsModel = totalsResult.data?.numsTotalsModels?.edges?.[0]?.node;
    if (totalsModel) {
      const earned = parseInt(totalsModel.rewards_earned!) || 0;
      const claimed = parseInt(totalsModel.rewards_claimed!) || 0;

      if (earned === 0) {
        setRewardsEarned(earned);
        setRewardsClaimed(claimed);
        return;
      }

      setRewardsEarned(earned);
      setRewardsClaimed(claimed);
    }
  }, [totalsResult]);

  return (
    <TotalsContext.Provider value={{ rewardsEarned, rewardsClaimed }}>
      {children}
    </TotalsContext.Provider>
  );
}

export function useTotals() {
  const context = useContext(TotalsContext);
  if (context === undefined) {
    throw new Error("useTotals must be used within a TotalsProvider");
  }
  return context;
}
