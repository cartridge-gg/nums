import { queryKeys } from "@/api/keys";
import { Leaderboard, type LeaderboardRow } from "@/api/torii/leaderboard";
import { useQuery } from "@tanstack/react-query";

export type LeaderboardRowData = LeaderboardRow;

export type RangeType = "1D" | "1W" | "All";

export const useLeaderboard = (): {
  data: LeaderboardRowData[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} => {
  const query = useQuery<LeaderboardRowData[]>({
    queryKey: queryKeys.leaderboard(),
    queryFn: Leaderboard.fetch,
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
