import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount } from "@starknet-react/core";
import { useCallback, useEffect, useState } from "react";
import { shortString, uint256 } from "starknet";
import { getGameAddress, getNumsAddress } from "@/config";
import useChain from "@/hooks/chain";
import { useExecuteCall } from "./useExecuteCall";

export const useBuyGame = () => {
  const { account, connector } = useAccount();
  const { chain } = useChain();
  const { execute } = useExecuteCall();

  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const c = connector as never as ControllerConnector;
    if (!c || !c.username || username) return;
    c.username()?.then((username) => {
      setUsername(username);
    });
  }, [connector]);

  const buyGame = useCallback(async () => {
    if (!account?.address || !username) return false;

    const numsAddress = getNumsAddress(chain.id);
    const gameAddress = getGameAddress(chain.id);

    const { success } = await execute([
      {
        contractAddress: numsAddress,
        entrypoint: "approve",
        calldata: [gameAddress, uint256.bnToUint256(2_000n * 10n ** 18n)],
      },
      {
        contractAddress: gameAddress,
        entrypoint: "buy",
        calldata: [shortString.encodeShortString(username)],
      },
    ]);

    return success;
  }, [account, username, chain, execute]);

  return {
    buyGame,
  };
};
