import { getContractAddress, getNumsAddress, MAINNET_CHAIN_ID } from "@/config";
import useChain from "@/hooks/chain";
import chain from "@/hooks/chain";
import { useAccount } from "@starknet-react/core";
import { BigNumberish, num, uint256 } from "starknet";
import { Button } from "../components/Button";
import { useCallback, useState } from "react";
import { useExecuteCall } from "@/hooks/useExecuteCall";
import useToast from "./toast";

export const useClaim = () => {
  const { account } = useAccount();
  const { chain } = useChain();
  const { execute } = useExecuteCall();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { showMessage } = useToast();

  const claim = useCallback(
    async (jackpotId: BigNumberish) => {
      if (!account?.address) return false;

      setIsLoading(true);

      try {
        const jackpotActionsAddress = getContractAddress(
          chain.id,
          "nums",
          "jackpot_actions"
        );
        await execute(
          [
            {
              contractAddress: jackpotActionsAddress,
              entrypoint: "claim_jackpot",
              calldata: [jackpotId],
            },
          ],
          (_receipt) => {
            setIsLoading(false);
            setIsSuccess(true);
            showMessage("Claimed successful!");
          }
        );
      } catch (e) {
        setIsLoading(false);

        console.log({ e });
      }
    },
    [account]
  );

  return {
    claim,
    isLoading,
    isSuccess,
  };
};
