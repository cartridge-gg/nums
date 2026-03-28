import type { GovernanceCardProps } from "@/components/elements/governance-card";
import type { GovernanceVoteProps } from "@/components/elements/governance-vote";

export interface GovernanceData {
  proposals: GovernanceCardProps[];
  results: {
    forCount: number;
    againstCount: number;
    abstainCount: number;
  };
  votes: GovernanceVoteProps[];
}

export function useGovernance(): GovernanceData {
  return {
    proposals: [],
    results: {
      forCount: 0,
      againstCount: 0,
      abstainCount: 0,
    },
    votes: [],
  };
}
