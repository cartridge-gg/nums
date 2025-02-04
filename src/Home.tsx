import {
  VStack,
  Text,
  Container,
  Box,
  HStack,
  Spacer,
  useDisclosure,
  Stack,
} from "@chakra-ui/react";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu";
import { useQuery } from "urql";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { formatAddress } from "./utils";
import { useAccount } from "@starknet-react/core";
3;
import Header from "./components/Header";
import { lookupAddresses } from "@cartridge/controller";
import { TrophyIcon } from "./components/icons/Trophy";
import { Button } from "./components/Button";
import { Timer } from "./components/Timer";
import { InfoIcon } from "./components/icons/Info";
import { CaretIcon } from "./components/icons/Caret";
import Play from "./components/Play";
import InfoOverlay from "./components/Info";
import { graphql } from "./graphql/appchain";
import { useInterval } from "usehooks-ts";

const MAX_SLOTS = 20;

const GamesQuery = graphql(`
  query Games($offset: Int) {
    numsGameModels(
      order: { direction: ASC, field: REMAINING_SLOTS }
      limit: 10
      offset: $offset
    ) {
      totalCount
      edges {
        node {
          game_id
          player
          remaining_slots
          reward
        }
      }
    }
  }
`);

const Home = () => {
  const navigate = useNavigate();
  const {
    open: openInfo,
    onOpen: onOpenInfo,
    onClose: onCloseInfo,
  } = useDisclosure();
  const { account } = useAccount();
  const [addressUsernamesMap, setAddressUsernamesMap] =
    useState<Map<string, string>>();

  // const [offset, setOffset] = useState<number>(0);
  const [gameResult, reexecuteQuery] = useQuery({
    query: GamesQuery,
    requestPolicy: "cache-and-network",
    // variables: {
    //   offset,
    // },
  });

  useInterval(() => {
    reexecuteQuery();
  }, 1000);

  useEffect(() => {
    const gamesModels = gameResult.data?.numsGameModels;
    if (!gamesModels) return;

    const addresses = gamesModels.edges!.map((g) => g!.node!.player!) || [];

    lookupAddresses(addresses).then((usernames) =>
      setAddressUsernamesMap(usernames),
    );
  }, [gameResult]);

  const getUsername = (address: string) => {
    return addressUsernamesMap?.get(address) ?? formatAddress(address);
  };

  return import.meta.env.VITE_VERCEL_ENV === "production" ? (
    <ComingSoon />
  ) : (
    <>
      <Container h="100vh" maxW="100vw">
        <Header hideChain />
        <InfoOverlay open={openInfo} onClose={onCloseInfo} />
        <VStack h="100%" justify="center" pt="40px">
          <VStack gap="20px" w={["100%", "100%", "600px"]} align="flex-start">
            <HStack w="full" justify="space-between">
              <MenuRoot>
                <MenuTrigger asChild>
                  <Button visual="transparent" gap="8px" fontSize="18px">
                    <TrophyIcon />
                    Score
                    <CaretIcon />
                  </Button>
                </MenuTrigger>
                <MenuContent>
                  <MenuItem value="score">Score</MenuItem>
                  <MenuItem value="tokens">Tokens</MenuItem>
                </MenuContent>
              </MenuRoot>
              <HStack>
                <Button
                  visual="transparent"
                  p="8px"
                  onClick={() => onOpenInfo()}
                >
                  <InfoIcon />
                </Button>
              </HStack>
            </HStack>

            <Box
              w="full"
              layerStyle="transparent"
              padding="30px"
              bgColor="rgba(0,0,0,0.04)"
            >
              <HStack
                w="full"
                justify="space-between"
                fontSize="14px"
                fontWeight="450"
                color="purple.50"
                textTransform="uppercase"
              >
                <Box w="full">
                  <Text>Ranking</Text>
                </Box>
                <Box w="full">
                  <Text>Player</Text>
                </Box>
                <Box w="full">
                  <Text>Score</Text>
                </Box>
                <Box w="full">
                  <Text>$NUMS</Text>
                </Box>
              </HStack>
              <Spacer minH="20px" />
              <VStack w="full">
                {gameResult.data?.numsGameModels?.edges?.map(
                  (edge: any, index) => (
                    <LeaderboardRow
                      key={index}
                      rank={index + 1}
                      isOwn={edge.node.player === account?.address}
                      player={getUsername(edge.node.player)}
                      score={MAX_SLOTS - edge.node.remaining_slots}
                      tokens={edge.node.reward.toLocaleString()}
                      onClick={() => {
                        navigate(`/0x${edge.node.game_id.toString(16)}`);
                      }}
                    />
                  ),
                )}
              </VStack>
            </Box>
            <VStack w="full" align="flex-start">
              <Text color="purple.50" textStyle="faded">
                Game ends in...
              </Text>
              <Stack
                w="full"
                gap={["20px", "20px", "50px"]}
                justify="space-between"
                direction={["column", "column", "row"]}
              >
                <Timer hrs={5} mins={5} secs={5} />
                <Play onReady={(gameId) => navigate(`/${gameId}`)} />
              </Stack>
            </VStack>
          </VStack>
        </VStack>
      </Container>
    </>
  );
};

const LeaderboardRow = ({
  rank,
  player,
  score,
  tokens,
  isOwn,
  onClick,
}: {
  rank: number;
  player: string;
  score: number;
  tokens: number;
  isOwn?: boolean;
  onClick: () => void;
}) => {
  return (
    <HStack
      w="full"
      h="30px"
      justify="space-between"
      fontWeight="500"
      _hover={{
        cursor: "pointer",
        bgColor: "purple.50",
      }}
      onClick={onClick}
      color={isOwn ? "orange.50" : "white"}
    >
      <Box flex="1">
        <Text>{rank}</Text>
      </Box>
      <Box flex="1">
        <Text>{player}</Text>
      </Box>
      <Box flex="1">
        <Text>{score}</Text>
      </Box>
      <Box flex="1">
        <Text>{tokens.toLocaleString()}</Text>
      </Box>
    </HStack>
  );
};

const ComingSoon = () => {
  return (
    <Container h="100vh" maxW="100vw">
      <VStack h="100%" justify="center">
        <Text textStyle="h-sm">NUMS.GG</Text>
        <Text>#Soon</Text>
      </VStack>
    </Container>
  );
};

export default Home;
