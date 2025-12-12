import { useAccount } from "@starknet-react/core";
import { useEffect, useState } from "react";
import { useTournaments } from "@/context/tournaments";
import { usePlayerGames } from "./useAssets";
import type { ClaimProps } from "./useClaim";
import { useGames } from "./useGames";
import { useRewards } from "./useRewards";

export type ClaimableReward = ClaimProps & {
  score: number;
  prizeAmount: bigint;
};

export const useClaimableRewards = () => {
  const { address } = useAccount();
  const { gameIds } = usePlayerGames();
  const { games } = useGames(gameIds);
  const { prizes } = useTournaments();

  const [claimableRewards, setClaimableRewards] = useState<ClaimableReward[]>(
    [],
  );

  // Subscribe to rewards for all tournaments
  const { rewards: allRewards } = useRewards(gameIds);

  useEffect(() => {
    if (!address || !games.length || !prizes) {
      setClaimableRewards([]);
      return;
    }
    setClaimableRewards([]);
  }, [address, games, prizes, allRewards]);

  return {
    claimableRewards,
    loading: !prizes,
  };
};
