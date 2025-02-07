import { useState } from "react";
import Overlay from "./Overlay";
import { Heading, HStack, Spacer, Table, Text, VStack } from "@chakra-ui/react";
import { Button } from "./Button";

const enum ShowInfo {
  ABOUT,
  TOKEN,
  REWARD,
}

const rewards = [
  { level: 1, reward: 2 },
  { level: 2, reward: 4 },
  { level: 3, reward: 8 },
  { level: 4, reward: 16 },
  { level: 5, reward: 32 },
  { level: 6, reward: 64 },
  { level: 7, reward: 128 },
  { level: 8, reward: 256 },
  { level: 9, reward: 512 },
  { level: 10, reward: 1024 },
  { level: 11, reward: 2048 },
  { level: 12, reward: 4096 },
  { level: 13, reward: 8192 },
  { level: 14, reward: 16384 },
  { level: 15, reward: 32768 },
  { level: 16, reward: 65536 },
  { level: 17, reward: 131072 },
  { level: 18, reward: 262144 },
  { level: 19, reward: 524288 },
  { level: 20, reward: 1048576 },
];

const InfoOverlay = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [showInfo, setShowInfo] = useState<ShowInfo>(ShowInfo.ABOUT);

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
                The goal is simple: place randomly generated numbers in
                ascending order. Players compete and earn NUMS tokens by placing
                as many numbers as possilbe with the game ending when the timer
                reaches zero.
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
              <Text>{import.meta.env.VITE_NUMS_ERC20}</Text>
            </VStack>
            <VStack
              w="full"
              layerStyle="transparent"
              align="flex-start"
              bgColor="rgba(255,255,255,0.04)"
            >
              <Text color="purple.50">Token supply</Text>
              <Text>320,202,002/∞</Text>
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
              Each time you successfully place a number, you earn rewards based
              on the following structure:
            </Text>
            <Table.Root size="sm" variant="outline" borderRadius="5px">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Level</Table.ColumnHeader>
                  <Table.ColumnHeader>Reward</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {rewards.map(({ level, reward }) => (
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
