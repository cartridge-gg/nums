import { getNumsAddress, MAINNET_CHAIN_ID } from "@/config";
import useChain from "@/hooks/chain";
import chain from "@/hooks/chain";
import { useAccount } from "@starknet-react/core";
import { num, uint256 } from "starknet";
import { Button } from "./Button";
import { useState } from "react";

export const MintNums = () => {
  const { account } = useAccount();
  const { chain } = useChain();

  const mintMockNums = async () => {
    if (!account?.address) return false;

    try {
      const numsAddress = getNumsAddress(chain.id);
      const { transaction_hash } = await account!.execute([
        {
          contractAddress: numsAddress,
          entrypoint: "mint",
          calldata: [
            account.address,
            uint256.bnToUint256(10_000n * 10n ** 18n),
          ],
        },
      ]);

      return true;
    } catch (e) {
      console.log({ e });
      return false;
    }
  };

  if (chain.id === num.toBigInt(MAINNET_CHAIN_ID)) return null;

  return <Button onClick={() => mintMockNums()}>Mint</Button>;
};
