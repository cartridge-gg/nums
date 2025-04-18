import { Container, Image, Link, Text, VStack } from "@chakra-ui/react";
import { Button } from "./components/Button";
import { useAccount, useConnect, useExplorer } from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";
import { useState } from "react";

const StarterPack = () => {
  const explorer = useExplorer();
  const { connect, connectors } = useConnect();
  const { address, connector } = useAccount();
  const controllerConnector = connector as never as ControllerConnector;
  const [starterPacks, setStarterPacks] = useState(0);
  const mintStarterPack = async () => {
    controllerConnector.controller.openStarterPack("sick-starter-pack");
  };

  const sspAddr =
    "0x033c6426d6e95d706be0e9fa31081cc9990ff1d399ecf22ad3fe0e8ae88b4f81";

  setInterval(() => {
    if (!address) return;

    controllerConnector.controller.account
      ?.callContract({
        contractAddress:
          "0x033c6426d6e95d706be0e9fa31081cc9990ff1d399ecf22ad3fe0e8ae88b4f81",
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
          <Link href={explorer.contract(sspAddr)} target="_blank">
            <Image
              boxSize="200px"
              src="https://static.cartridge.gg/media/ssp.png"
              alt="Sick Starter Pack"
            />
          </Link>

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
