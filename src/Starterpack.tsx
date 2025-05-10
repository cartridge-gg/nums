import { Container, Image, VStack } from "@chakra-ui/react";
import { Button } from "./components/Button";
import { useAccount, useConnect } from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";

const StarterPack = () => {
  const { connect, connectors } = useConnect();
  const { address, connector } = useAccount();
  const controllerConnector = connector as never as ControllerConnector;
  //const [starterPacks, setStarterPacks] = useState(0);
  const mintStarterPack = async () => {
    controllerConnector.controller.openStarterPack("popularium-booster-pack");
  };

  return (
    <Container h="100vh" maxW="100vw">
      <VStack
        h={["auto", "auto", "full"]}
        justify={["flex-start", "flex-start", "center"]}
        pt={["90px", "90px", "0"]}
      >
        <VStack>
          <Image
            boxSize="200px"
            src="https://storage.googleapis.com/c7e-prod-static/media/chaos.png"
          />

          {address ? (
            <>
              {/* <Text fontWeight="bold">
                Starter Packs you own: {starterPacks}
              </Text> */}
              <Button onClick={mintStarterPack}>Claim</Button>
            </>
          ) : (
            <Button onClick={() => connect({ connector: connectors[0] })}>
              Connect to Claim
            </Button>
          )}
        </VStack>
      </VStack>
    </Container>
  );
};

export default StarterPack;
