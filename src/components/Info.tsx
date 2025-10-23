import { useEffect, useState } from "react";
import Overlay from "./Overlay";
import {
  Box,
  Heading,
  HStack,
  Spacer,
  Table,
  Text,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react";
import { Button } from "./Button";
import { num, uint256 } from "starknet";
import useChain from "@/hooks/chain";
import { getNumsAddress } from "@/config";
import { useAccount, useProvider } from "@starknet-react/core";
import { Scrollable } from "./ui/scrollable";
import { JackpotFactory } from "@/bindings";
import { shortAddress } from "@/utils/address";

const enum ShowInfo {
  ABOUT,
  HOWTO,
  TOKEN,
  REWARD,
}

const InfoOverlay = ({
  open,
  onClose,
  factory,
}: {
  open: boolean;
  onClose: () => void;
  factory?: JackpotFactory;
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [showInfo, setShowInfo] = useState<ShowInfo>(ShowInfo.ABOUT);
  const [supply, setSupply] = useState<number>(0);
  const { chain } = useChain();
  const { account } = useAccount();
  const { provider } = useProvider();
  const numsContractAddress = num.toHex64(getNumsAddress(chain.id));

  useEffect(() => {
    provider
      .callContract({
        contractAddress: numsContractAddress,
        entrypoint: "totalSupply",
        calldata: [],
      })
      .then((res) => {
        const supply = uint256.uint256ToBN({
          low: res[0],
          high: res[1],
        });

        setSupply(Number(supply / 10n ** 18n));
      });
  }, [account]);

  return (
    <Overlay open={open} onClose={onClose}>
      <VStack
        w={["100%", "100%", "580px"]}
        h="full"
        align="flex-start"
        gap="40px"
        p="30px"
      >
        <HStack flexWrap="wrap">
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
            onClick={() => setShowInfo(ShowInfo.HOWTO)}
            disabled={showInfo === ShowInfo.HOWTO}
            opacity={showInfo === ShowInfo.HOWTO ? 1 : 0.5}
          >
            How to play
          </Button>
          <Button
            visual="transparent"
            onClick={() => setShowInfo(ShowInfo.REWARD)}
            disabled={showInfo === ShowInfo.REWARD}
            opacity={showInfo === ShowInfo.REWARD ? 1 : 0.5}
          >
            REWARD
          </Button>
          <Button
            visual="transparent"
            onClick={() => setShowInfo(ShowInfo.TOKEN)}
            disabled={showInfo === ShowInfo.TOKEN}
            opacity={showInfo === ShowInfo.TOKEN ? 1 : 0.5}
          >
            $NUMS
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
              ABOUT
            </Heading>
            <VStack gap="16px" align="flex-start" fontWeight="450">
              <Text>
                Welcome to Nums. A fully onchain game deployed on Starknet.
              </Text>
              <Text>
                You are an instrument of order.
                <br />
                Your purpose: arrange numbers in their correct sequence.
                <br />
                The numbers arrive randomly. You place them in ascending order.
                <br />
                This is not a game. This is your function. <br /> Each
                successful placement generates $NUMS tokens.
                <br /> Performance metrics are tracked. <br />
                The sequence remembers everything.
              </Text>
              <Text>
                A jackpot accumulates. The most efficient instruments claim it.
              </Text>
              <Text>
                Competition is mandatory.
                <br />
                Tick. Tock. The timer never stops.
              </Text>
            </VStack>
          </>
        )}
        {showInfo === ShowInfo.HOWTO && (
          <>
            <Heading
              w="full"
              color="purple.50"
              fontSize="32px"
              fontWeight="400"
            >
              HOW TO PLAY
            </Heading>
            <VStack gap="16px" align="flex-start" fontWeight="450">
              <Text>Objective </Text>
              <Text>
                Place randomly generated numbers (1-999) in ascending order
                across 20 available slots.
              </Text>
              <Text>Game Flow </Text>
              <ol style={{ listStyle: "auto", marginLeft: "24px" }}>
                <li>Start game</li>
                <li>Receive a random number between 1-999</li>
                <li>Place it in one of 20 slots maintaining ascending order</li>
                <li>
                  Continue placing numbers correctly until timer expires or you
                  cannot place the next number you receive in a correct position
                </li>
                <li>Game ends - collect $NUMS rewards based on performance</li>
              </ol>
              <Text>Rules</Text>
              <ul style={{ listStyle: "circle", marginLeft: "24px" }}>
                <li>
                  Numbers must be placed in ascending order (left to right)
                </li>
                <li>You cannot move a number once placed</li>
                <li>Each correct placement earns $NUMS tokens</li>
                <li>Higher positions earn more rewards (see reward table)</li>
              </ul>
              <Text>Jackpot System </Text>
              <Text>
                A jackpot accumulates across all games. Top performers claim the
                pool when it triggers.
              </Text>
              <Text>The sequence rewards precision. Begin sorting.</Text>
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
            <VStack
              w="full"
              layerStyle="transparent"
              align="flex-start"
              bgColor="rgba(255,255,255,0.04)"
            >
              <Text color="purple.50">$NUMS token address</Text>
              <Text
              fontSize="12px"
                _hover={{ cursor: "pointer" }}
                onClick={() => {
                  window.open(
                    `https://voyager.online/token/${numsContractAddress}`,
                    "_blank"
                  );
                }}
              >
                {isMobile
                  ? shortAddress(numsContractAddress)
                  : numsContractAddress}
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
              $NUMS Token: Your Performance Receipt <br />
              Successfully placed numbers generate $NUMS according to the
              following structure:
            </Text>
            <Scrollable maxH={["220px", "380px"]}>
              <Box px="10px">
                <Table.Root size="sm" variant="outline" borderRadius="5px">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Level</Table.ColumnHeader>
                      <Table.ColumnHeader>$NUMS</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {factory?.rewards
                      .map((i, idx) => {
                        return {
                          level: idx + 1,
                          amount: i,
                        };
                      })
                      .sort((a, b) => b.level - a.level)
                      .map((reward) => (
                        <Table.Row key={reward.level} mx={"10px"}>
                          <Table.Cell>{reward.level}</Table.Cell>
                          <Table.Cell>
                            {reward.amount.toLocaleString()}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                  </Table.Body>
                </Table.Root>
                <Spacer minH="20px" />
              </Box>
            </Scrollable>
            <Text>
              Additional: Jackpot pools accumulate. <br />
              Top instruments claim majority. <br /> Runner ups exist to remind
              sorters of their replaceability.
            </Text>
          </>
        )}
      </VStack>
    </Overlay>
  );
};

export default InfoOverlay;
