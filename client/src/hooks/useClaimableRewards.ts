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
  const { leaderboards, prizes } = useTournaments();

  const [claimableRewards, setClaimableRewards] = useState<ClaimableReward[]>(
    [],
  );

  // Subscribe to rewards for all tournaments
  const { rewards: allRewards } = useRewards(gameIds);

  useEffect(() => {
    if (!address || !games.length || !leaderboards || !prizes) {
      setClaimableRewards([]);
      return;
    }

    const claimable: ClaimableReward[] = [];

    // Filter games that have started
    const startedGames = games.filter((game) => game.tournament_id !== 0);

    for (const game of startedGames) {
      const tournamentId = game.tournament_id;

      // Find the leaderboard for this tournament
      const leaderboard = leaderboards.find(
        (lb) => lb.tournament_id === tournamentId,
      );
      if (!leaderboard) continue;

      // Check if this game is in the leaderboard
      const position = leaderboard.games.indexOf(game.id);
      if (position === -1) continue; // Game not in leaderboard

      // Position is 1-indexed for the claim
      const claimPosition = position + 1;

      // Check if position is within capacity
      if (claimPosition > Number(leaderboard.capacity)) continue;

      // Get all prizes for this tournament
      const tournamentPrizes = prizes.filter(
        (p) => p.tournament_id === tournamentId,
      );

      // For each prize, check if there's already a reward claimed
      for (const prize of tournamentPrizes) {
        const reward = allRewards.find(
          (r) =>
            r.tournament_id === tournamentId &&
            r.address.toLowerCase() === prize.address.toLowerCase() &&
            r.gameId === game.id,
        );

        // If no reward exists or not claimed, it's claimable
        if (!reward || !reward.claimed) {
          claimable.push({
            tournamentId,
            tokenAddress: prize.address,
            gameId: game.id,
            position: claimPosition,
            score: game.score,
            prizeAmount: prize.amount,
          });
        }
      }
    }

    setClaimableRewards(claimable);
  }, [address, games, leaderboards, prizes, allRewards]);

  return {
    claimableRewards,
    loading: !leaderboards || !prizes,
  };
};
