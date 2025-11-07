import { useAccount } from "@starknet-react/core";
import { useCallback } from "react";
import { CallData } from "starknet";
import { getGameAddress, getVrfAddress } from "@/config";
import useChain from "@/hooks/chain";
import { useExecuteCall } from "@/hooks/useExecuteCall";

export const useGameSet = ({ gameId }: { gameId: number }) => {
  const { account } = useAccount();
  const { chain } = useChain();
  const { execute } = useExecuteCall();

  const setSlot = useCallback(
    async (index: number) => {
      if (!account?.address) return { success: false };

      const vrfAddress = getVrfAddress(chain.id);
      const gameAddress = getGameAddress(chain.id);

      console.log("Tx submitted @ ", new Date().toISOString());

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
          entrypoint: "set",
          calldata: CallData.compile({ game_id: gameId, index }),
        },
      ]);

      console.log("Tx executed @ ", new Date().toISOString());

      return result;
    },
    [account, chain.id, gameId, execute],
  );

  return {
    setSlot,
  };
};
