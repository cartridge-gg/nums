import { Button, HStack, Link, Text, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useExplorer } from "@starknet-react/core";
import useToast from "../hooks/toast";
import { hash } from "starknet";

const Create = () => {
  const { address, account, connector } = useAccount();
  const { showTxn } = useToast();
  const [creating, setCreating] = useState<boolean>(false);
  const explorer = useExplorer();
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const controllerConnector = connector as never as ControllerConnector;

  useEffect(() => {
    controllerConnector?.username()?.then(setUsername);
  }, [controllerConnector]);

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
        console.log({ receipt });
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
      <VStack w="100%" h="120px" spacing="20px">
        <HStack>
          <Text>
            Hello,{" "}
            {address ? (
              <>
                <Link href={explorer.contract(address)} isExternal>
                  <strong>{username}</strong>
                </Link>
              </>
            ) : (
              "anon"
            )}
            .
          </Text>
        </HStack>
        <HStack spacing="20px">
          {address && (
            <Button isLoading={creating} onClick={newGame}>
              Create Game
            </Button>
          )}
        </HStack>
      </VStack>
    </>
  );
};

export default Create;
