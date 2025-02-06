import { Button, Spinner } from "@chakra-ui/react";
import { useState } from "react";
import { useAccount, useConnect, useNetwork } from "@starknet-react/core";
import useToast from "../hooks/toast";
import { hash } from "starknet";
import { RefreshIcon } from "./icons/Refresh";
import { useAudio } from "@/context/audio";

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
  const { playReplay } = useAudio();

  const newGame = async () => {
    if (!account) return;

    try {
      setCreating(true);
      playReplay();
      const { transaction_hash } = await account.execute([
        // {
        //   contractAddress: import.meta.env.VITE_VRF_CONTRACT,
        //   entrypoint: 'request_random',
        //   calldata: CallData.compile({
        //     caller: import.meta.env.VITE_GAME_CONTRACT,
        //     source: {type: 0, address: account.address}
        //   })
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

        onReady(createdEvent?.data[1]!);
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
