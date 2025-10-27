import { getNumsAddress, getGameAddress } from "@/config";
import useChain from "@/hooks/chain";
import ControllerConnector from "@cartridge/connector/controller";
import { useAccount } from "@starknet-react/core";
import { useCallback, useEffect, useState } from "react";
import { shortString, uint256 } from "starknet";

export const useBuyGame = () => {
  const { account, connector } = useAccount();
  const { chain } = useChain();

  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const c = connector as never as ControllerConnector;
    if (!c || !c.username || username) return;
    c.username()?.then((username) => {
      setUsername(username);
    });
  }, [connector]);

  const buyGame = useCallback(async () => {
    try {
      if (!account?.address || !username) return false;
      const numsAddress = getNumsAddress(chain.id);
      const gameAddress = getGameAddress(chain.id);
      await account!.execute([
        {
          contractAddress: numsAddress,
          entrypoint: "approve",
          calldata: [
            gameAddress,
            uint256.bnToUint256(2_000n * 10n ** 18n),
          ],
        },
        {
          contractAddress: gameAddress,
          entrypoint: "buy",
          calldata: [shortString.encodeShortString(username)],
        },
      ]);

      return true;
    } catch (e) {
      console.log({ e });
      return false;
    }
  }, [account, username]);


  return {
    buyGame,
  };
};
