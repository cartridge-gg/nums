import { Container, Image, Link, Text, VStack } from "@chakra-ui/react";
import { Button } from "./components/Button";
import { useAccount, useConnect, useExplorer } from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";
import { useState } from "react";

const villagePassAddr =
  "0x7ad410c472c1d61ce318dd617a479c977c85275afbf7991a1e1461ffe626a3d";

const StarterPack = () => {
  const explorer = useExplorer();
  const { connect, connectors } = useConnect();
  const { address, connector } = useAccount();
  const controllerConnector = connector as never as ControllerConnector;
  const [starterPacks, setStarterPacks] = useState(0);
  const mintStarterPack = async () => {
    controllerConnector.controller.openStarterPack(
      "eternum-village-pass-mainnet",
    );
  };

  setInterval(() => {
    if (!address) return;

    controllerConnector.controller.account
      ?.callContract({
        contractAddress: villagePassAddr,
        entrypoint: "balanceOf",
        calldata: [address],
      })
      .then((res) => {
        setStarterPacks(parseInt(res[0]));
      });
  }, 2000);

  return (
    <Container h="100vh" maxW="100vw">
      <VStack
        h={["auto", "auto", "full"]}
        justify={["flex-start", "flex-start", "center"]}
        pt={["90px", "90px", "0"]}
      >
        <VStack>
          <Link href={explorer.contract(villagePassAddr)} target="_blank">
            <Image
              boxSize="200px"
              src="https://static.cartridge.gg/media/village-image.png"
              alt="Eternum Village Pass"
            />
          </Link>
          <Text>
            <strong>SN_MAIN</strong>: {villagePassAddr}
          </Text>

          {address ? (
            <>
              <Text fontWeight="bold">
                Starter Packs you own: {starterPacks}
              </Text>
              <Button onClick={mintStarterPack}>Purchase</Button>
            </>
          ) : (
            <Button onClick={() => connect({ connector: connectors[0] })}>
              Connect to mint
            </Button>
          )}
        </VStack>
      </VStack>
    </Container>
  );
};

export default StarterPack;
