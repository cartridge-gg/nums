import { Button, Spinner } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAccount, useConnect } from "@starknet-react/core";
import useToast from "../hooks/toast";
import { hash } from "starknet";

const Play = () => {
  const { account } = useAccount();
  const { connect, connectors } = useConnect();

  const { showTxn } = useToast();
  const [creating, setCreating] = useState<boolean>(false);
  const navigate = useNavigate();

  const newGame = async () => {
    if (!account) return;

    try {
      setCreating(true);
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

      showTxn(transaction_hash);

      const receipt = await account.waitForTransaction(transaction_hash, {
        retryInterval: 500,
      });

      if (receipt.isSuccess()) {
        const createdEvent = receipt.events.find(
          ({ keys }) => keys[0] === hash.getSelectorFromName("EventEmitted"),
        );

        navigate(`/${createdEvent?.data[1]}`);
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
        <Button onClick={newGame} disabled={creating} w="100px">
          {creating ? <Spinner /> : "Play!"}
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
