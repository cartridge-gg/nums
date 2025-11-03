import { useAccount } from "@starknet-react/core";
import { useCallback } from "react";
import { CallData } from "starknet";
import { getGameAddress } from "@/config";
import useChain from "@/hooks/chain";
import { useExecuteCall } from "./useExecuteCall";

export interface ClaimProps {
  tournamentId: number;
  tokenAddress: string;
  gameId: number;
  position: number;
}

export const useClaim = () => {
  const { account } = useAccount();
  const { chain } = useChain();
  const { execute } = useExecuteCall();

  const claim = useCallback(
    async (claims: ClaimProps[]) => {
      if (!account?.address || claims.length === 0) return false;

      const gameAddress = getGameAddress(chain.id);

      // Build multicall for all claims
      const calls = claims.map((claimData) => ({
        contractAddress: gameAddress,
        entrypoint: "claim",
        calldata: CallData.compile({
          tournament_id: claimData.tournamentId,
          token_address: claimData.tokenAddress,
          game_id: claimData.gameId,
          position: claimData.position,
        }),
      }));

      const { success } = await execute(calls);
      return success;
    },
    [account, chain, execute],
  );

  return {
    claim,
  };
};
