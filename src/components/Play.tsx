import { Button, Spinner } from "@chakra-ui/react";
import { useState } from "react";
import { useAccount, useConnect, useNetwork } from "@starknet-react/core";
import useToast from "../hooks/toast";
import { hash, num } from "starknet";
import { RefreshIcon } from "./icons/Refresh";
import { useAudio } from "@/context/audio";
import useChain, { APPCHAIN_CHAIN_ID } from "@/hooks/chain";

const Play = ({
  isAgain,
  onReady,
}: {
  isAgain?: boolean;
  onReady: (gameId: string) => void;
}) => {
  const { account } = useAccount();
  const { connect, connectors } = useConnect();
  const { chain } = useNetwork();
  const { showTxn } = useToast();
  const [creating, setCreating] = useState<boolean>(false);
  const { requestAppchain } = useChain();
  const { playReplay } = useAudio();

  const newGame = async () => {
    if (!account) return;

    try {
      if (chain?.id !== num.toBigInt(APPCHAIN_CHAIN_ID)) {
        requestAppchain();
      }

      setCreating(true);
      playReplay();
      const { transaction_hash } = await account.execute([
        // {
        //   contractAddress: import.meta.env.VITE_VRF_CONTRACT,
        //   entrypoint: "request_random",
        //   calldata: CallData.compile({
        //     caller: import.meta.env.VITE_GAME_CONTRACT,
        //     source: { type: 0, address: account.address },
        //   }),
        // },
        {
          contractAddress: import.meta.env.VITE_GAME_CONTRACT,
          entrypoint: "create_game",
          calldata: [1], // no jackpot yet
        },
      ]);

      showTxn(transaction_hash, chain?.name);

      const receipt = await account.waitForTransaction(transaction_hash, {
        retryInterval: 500,
      });

      if (receipt.isSuccess()) {
        const createdEvent = receipt.events.find(
          ({ keys }) => keys[0] === hash.getSelectorFromName("EventEmitted"),
        );
        console.log(createdEvent);
        onReady(createdEvent?.data[3]!);
        return;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      {account ? (
        <Button onClick={newGame} disabled={creating} minW="150px">
          {creating ? (
            <Spinner />
          ) : isAgain ? (
            <>
              <RefreshIcon /> Play Again
            </>
          ) : (
            "Play!"
          )}
        </Button>
      ) : (
        <Button onClick={() => connect({ connector: connectors[0] })}>
          Connect
        </Button>
      )}
    </>
  );
};

export default Play;
