import {
  VStack,
  Text,
  Heading,
  SimpleGrid,
  Container,
  Box,
  HStack,
  Spacer,
} from "@chakra-ui/react";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu";
import { graphql } from "../graphql";
import { useQuery } from "urql";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { formatAddress } from "../utils";
import { useAccount } from "@starknet-react/core";
3;
import Header from "./Header";
import { lookupAddresses } from "@cartridge/controller";
import { TrophyIcon } from "./icons/Trophy";
import { Button } from "./Button";
import { Timer } from "./Timer";
import { InfoIcon } from "./icons/Info";
import { CaretIcon } from "./icons/Caret";
import Play from "./Play";

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
        }
      }
    }
  }
`);

const Home = () => {
  const navigate = useNavigate();
  // const [offset, setOffset] = useState<number>(0);
  const { account } = useAccount();
  const [addressUsernamesMap, setAddressUsernamesMap] =
    useState<Map<string, string>>();

  const [gameResult] = useQuery({
    query: GamesQuery,
    // variables: {
    //   offset,
    // },
  });

  useEffect(() => {
    if (!gameResult.data) return;

    const addresses =
      gameResult.data.numsGameModels?.edges?.map((g) => g!.node!.player!) || [];

    lookupAddresses(addresses).then((usernames) =>
      setAddressUsernamesMap(usernames),
    );
  }, [gameResult]);

  const getUsername = (address: string) => {
    return addressUsernamesMap?.get(address) ?? formatAddress(address);
  };

  const showComingSoon = false;

  return showComingSoon ? (
    <ComingSoon />
  ) : (
    <>
      <Container h="100vh" maxW="100vw">
        <Header hideChain />
        <VStack h="100%" justify={["none", "none", "center"]}>
          <SimpleGrid
            columns={[1, 1, 1, 2]}
            h={["auto", "auto", "700px"]}
            w={["100%", "100%", "1200px"]}
            gap={"80px"}
            mt={["100px", "100px", "30px"]}
          >
            <VStack gap="30px">
              <Heading w="full" color="purple.50" textStyle="header">
                HOW TO PLAY
              </Heading>
              <VStack gap="30px" align="flex-start" fontWeight="450">
                <Text>
                  Welcome to Nums, a fully onchain game build by Cartridge using
                  the Dojo Framework.
                </Text>
                <Text>
                  The goal is simple: place randomly generated numbers in
                  ascending order. Players compete and earn NUMS tokens by
                  placing as many numbers as possilbe with the game ending when
                  the timer reaches zero.
                </Text>
                <Text>The better you do the more you earn!</Text>
              </VStack>
              <VStack
                layerStyle="transparent"
                align="flex-start"
                fontSize="14px"
              >
                <Text fontWeight="700" color="purple.50">
                  Under the hood
                </Text>
                <Text>
                  Nums is hosted on its own app layer however, rewards earned by
                  playing Nums are claimable on{" "}
                  <strong>Starknet Mainnet</strong>.
                </Text>
                <Text>
                  This is possilbe with Saya, an open source settlement tool for
                  applications built with Dojo.
                </Text>
              </VStack>
              <VStack w="full" align="flex-start">
                <Text color="purple.50" textStyle="faded">
                  Game ends in...
                </Text>
                <HStack w="full" justify="space-between">
                  <Timer hrs={5} mins={5} secs={5} />
                  <Play />
                </HStack>
              </VStack>
            </VStack>
            <VStack gap="20px" w="full" align="flex-start">
              <HStack w="full" justify="space-between">
                <MenuRoot>
                  <MenuTrigger>
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
                <Button
                  visual="transparent"
                  p="8px"
                  onClick={() => console.log("info")}
                >
                  <InfoIcon />
                </Button>
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
                        rank={index + 1}
                        isOwn={edge.node.player === account?.address}
                        player={getUsername(edge.node.player)}
                        score={MAX_SLOTS - edge.node.remaining_slots}
                        tokens={Math.floor(Math.random() * 1000000)}
                        onClick={() => {
                          navigate(`/0x${edge.node.game_id.toString(16)}`);
                        }}
                      />
                    ),
                  )}
                </VStack>
              </Box>
            </VStack>
          </SimpleGrid>
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
      <Box w="full">
        <Text textStyle="bold">{rank}</Text>
      </Box>
      <Box w="full">
        <Text textStyle="bold">{player}</Text>
      </Box>
      <Box w="full">
        <Text textStyle="bold">{score}</Text>
      </Box>
      <Box w="full">
        <Text textStyle="bold">{tokens.toLocaleString()}</Text>
      </Box>
    </HStack>
  );
};

const ComingSoon = () => {
  return (
    <Container h="100vh" maxW="100vw">
      <VStack h="100%" justify={["none", "none", "center"]}>
        <Text textStyle="header">NUMS.GG</Text>
        <Text>#Soon</Text>
      </VStack>
    </Container>
  );
};

export default Home;
