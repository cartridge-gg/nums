import { useEffect, useState } from "react";
import Overlay from "./Overlay";
import { Heading, HStack, Spacer, Table, Text, VStack } from "@chakra-ui/react";
import { Button } from "./Button";
import { REWARDS } from "@/constants";
import { Provider } from "starknet";

const provider = new Provider({
  nodeUrl: "https://api.cartridge.gg/x/starknet/mainnet",
});

const enum ShowInfo {
  ABOUT,
  TOKEN,
  REWARD,
}

const InfoOverlay = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [showInfo, setShowInfo] = useState<ShowInfo>(ShowInfo.ABOUT);
  const [supply, setSupply] = useState<number>(0);

  useEffect(() => {
    provider
      .callContract({
        contractAddress: import.meta.env.VITE_NUMS_ERC20,
        entrypoint: "totalSupply",
      })
      .then((res) => setSupply(parseInt(res[0]) / 10 ** 18));
  }, []);

  return (
    <Overlay open={open} onClose={onClose}>
      <VStack
        w={["100%", "100%", "60%"]}
        h="full"
        align="flex-start"
        gap="40px"
        p="30px"
        pt="100px"
      >
        <HStack>
          <Button
            visual="transparent"
            onClick={() => setShowInfo(ShowInfo.ABOUT)}
            disabled={showInfo === ShowInfo.ABOUT}
            opacity={showInfo === ShowInfo.ABOUT ? 1 : 0.5}
          >
            About
          </Button>
          <Button
            visual="transparent"
            onClick={() => setShowInfo(ShowInfo.TOKEN)}
            disabled={showInfo === ShowInfo.TOKEN}
            opacity={showInfo === ShowInfo.TOKEN ? 1 : 0.5}
          >
            $NUMS
          </Button>
          <Button
            visual="transparent"
            onClick={() => setShowInfo(ShowInfo.REWARD)}
            disabled={showInfo === ShowInfo.REWARD}
            opacity={showInfo === ShowInfo.REWARD ? 1 : 0.5}
          >
            REWARD
          </Button>
        </HStack>
        {showInfo === ShowInfo.ABOUT && (
          <>
            <Heading
              w="full"
              color="purple.50"
              fontSize="32px"
              fontWeight="400"
            >
              HOW TO PLAY
            </Heading>
            <VStack gap="30px" align="flex-start" fontWeight="450">
              <Text>
                Welcome to Nums, a fully onchain game build by Cartridge using
                the Dojo Framework.
              </Text>
              <Text>
                The goal is simple: place randomly generated numbers (1 - 1000)
                in ascending order. Players compete and earn NUMS tokens by
                placing as many numbers as possilbe with the game ending when
                the timer reaches zero.
              </Text>
              <Text>The better you do the more you earn!</Text>
            </VStack>
          </>
        )}
        {showInfo === ShowInfo.TOKEN && (
          <>
            <Heading
              w="full"
              color="purple.50"
              fontSize="32px"
              fontWeight="400"
            >
              TOKEN DETAILS
            </Heading>
            <Text>
              $Nums is reward token intended to demonstrate the horizontal
              scalability of Validity rollups. Earn $Nums by playing Nums, a
              game hosted on its own app chain. the better you do the more you
              earn. Rewards are claimable on Starknet mainnet
            </Text>
            <VStack
              w="full"
              layerStyle="transparent"
              align="flex-start"
              bgColor="rgba(255,255,255,0.04)"
            >
              <Text color="purple.50">$NUMS token address</Text>
              <Text
                _hover={{ cursor: "pointer" }}
                onClick={() => {
                  window.open(
                    `https://voyager.online/token/${import.meta.env.VITE_NUMS_ERC20}`,
                    "_blank",
                  );
                }}
              >
                {import.meta.env.VITE_NUMS_ERC20}
              </Text>
            </VStack>
            <VStack
              w="full"
              layerStyle="transparent"
              align="flex-start"
              bgColor="rgba(255,255,255,0.04)"
            >
              <Text color="purple.50">Token supply</Text>
              <Text>{supply.toLocaleString()}</Text>
            </VStack>
          </>
        )}
        {showInfo === ShowInfo.REWARD && (
          <>
            <Heading
              w="full"
              color="purple.50"
              fontSize="32px"
              fontWeight="400"
            >
              REWARD DETAILS
            </Heading>
            <Text>
              Each time you successfully place a number, you earn $NUM rewards
              based on the following structure:
            </Text>
            <Table.Root size="sm" variant="outline" borderRadius="5px">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Level</Table.ColumnHeader>
                  <Table.ColumnHeader>$NUMS</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {REWARDS.map(({ level, reward }) => (
                  <Table.Row key={level}>
                    <Table.Cell>{level}</Table.Cell>
                    <Table.Cell>{reward}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
            <Spacer minH="50px" />
          </>
        )}
      </VStack>
    </Overlay>
  );
};

export default InfoOverlay;
