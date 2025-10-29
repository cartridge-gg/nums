import { useAccount } from "@starknet-react/core";
import { useCallback } from "react";
import { CallData } from "starknet";
import { getGameAddress, getVrfAddress } from "@/config";
import useChain from "@/hooks/chain";
import { useExecuteCall } from "@/hooks/useExecuteCall";

export const useGameApply = ({ gameId }: { gameId: number }) => {
  const { account } = useAccount();
  const { chain } = useChain();
  const { execute } = useExecuteCall();

  const applyPower = useCallback(
    async (powerIndex: number) => {
      if (!account?.address) return { success: false };

      const vrfAddress = getVrfAddress(chain.id);
      const gameAddress = getGameAddress(chain.id);

      const result = await execute([
        {
          contractAddress: vrfAddress,
          entrypoint: "request_random",
          calldata: CallData.compile({
            caller: gameAddress,
            source: { type: 0, address: gameAddress },
          }),
        },
        {
          contractAddress: gameAddress,
          entrypoint: "apply",
          calldata: CallData.compile({ game_id: gameId, power: powerIndex }),
        },
      ]);

      return result;
    },
    [account, chain.id, gameId, execute],
  );

  return {
    applyPower,
  };
};
