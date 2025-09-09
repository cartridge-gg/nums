import { getNumsAddress, MAINNET_CHAIN_ID } from "@/config";
import useChain from "@/hooks/chain";
import { useAccount } from "@starknet-react/core";
import { useCallback } from "react";
import { num, uint256 } from "starknet";

export const useMintNums = () => {
  const { account } = useAccount();
  const { chain } = useChain();

  const mintMockNums = useCallback(async () => {
    try {
      if (!account?.address) return false;
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
  }, [account]);


  return {
    mintMockNums,
  };
};
