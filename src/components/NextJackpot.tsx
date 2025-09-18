import { getContractAddress, getNumsAddress, MAINNET_CHAIN_ID } from "@/config";
import useChain from "@/hooks/chain";
import chain from "@/hooks/chain";
import { useAccount } from "@starknet-react/core";
import { BigNumberish, num, uint256 } from "starknet";
import { Button } from "./Button";
import { useState } from "react";
import { useExecuteCall } from "@/hooks/useExecuteCall";

export const NextJackpot = ({ factoryId }: { factoryId: BigNumberish }) => {
  const { account } = useAccount();
  const { chain } = useChain();
  const { execute } = useExecuteCall();

  const nextJackpot = async () => {
    if (!account?.address) return false;

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
            entrypoint: "next_jackpot",
            calldata: [factoryId],
          },
        ],
        (_receipt) => {}
      );

      return true;
    } catch (e) {
      console.log({ e });
      return false;
    }
  };

  return <Button onClick={() => nextJackpot()}>Next Jackpot</Button>;
};
