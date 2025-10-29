import { useAccount } from "@starknet-react/core";
import { useCallback } from "react";
import { CallData } from "starknet";
import { getGameAddress, getVrfAddress } from "@/config";
import useChain from "@/hooks/chain";

export const useStartGame = ({ gameId }: { gameId: number }) => {
  const { account } = useAccount();
  const { chain } = useChain();

  const startGame = useCallback(async () => {
    try {
      if (!account?.address) return false;
      const vrfAddress = getVrfAddress(chain.id);
      const gameAddress = getGameAddress(chain.id);
      await account!.execute([
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
          entrypoint: "start",
          calldata: CallData.compile({ game_id: gameId }),
        },
      ]);

      return true;
    } catch (e) {
      console.log({ e });
      return false;
    }
  }, [account]);

  return {
    startGame,
  };
};
