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

const LeaderboardQuery = graphql(`
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
    numsTotalsModels(order: { direction: DESC, field: REWARDS_EARNED }) {
      totalCount
      edges {
        node {
          player
          rewards_earned
        }
      }
    }
  }
`);

const TOP_SCORE_HEADERS = ["Ranking", "Player", "Score", "$NUMS"];
const TOTAL_TOKENS_HEADERS = ["Ranking", "Player", "Total $NUMS"];

const Home = () => {
  const navigate = useNavigate();
  const {
    open: openInfo,
    onOpen: onOpenInfo,
    onClose: onCloseInfo,
  } = useDisclosure();
  const { account } = useAccount();
  const [headers, setHeaders] = useState<string[]>(TOP_SCORE_HEADERS);
  const [rows, setRows] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<"score" | "tokens">("score");

  // const [offset, setOffset] = useState<number>(0);
  const [leaderboardResult, reexecuteQuery] = useQuery({
    query: LeaderboardQuery,
    requestPolicy: "cache-and-network",
    // variables: {
    //   offset,
    // },
  });

  useInterval(() => {
    reexecuteQuery();
  }, 1000);

  useEffect(() => {
    const gameModels = leaderboardResult.data?.numsGameModels;
    const totalsModels = leaderboardResult.data?.numsTotalsModels;
    if (!gameModels || !totalsModels) return;

    const gameAddresses = gameModels.edges!.map((g) => g!.node!.player!) || [];
    const totalsAddresses =
      totalsModels.edges!.map((t) => t!.node!.player!) || [];

    lookupAddresses([...gameAddresses, ...totalsAddresses]).then(
      (usernames) => {
        if (sortBy === "score") {
          setHeaders(TOP_SCORE_HEADERS);
          const rows = gameModels.edges!.map((g, i) => ({
            rank: i + 1,
            player:
              usernames.get(g!.node!.player!) ??
              formatAddress(g!.node!.player!),
            score: MAX_SLOTS - g!.node!.remaining_slots!,
            reward: g!.node!.reward!.toLocaleString(),
            gameId: g!.node!.game_id,
          }));
          setRows(rows);
        } else {
          setHeaders(TOTAL_TOKENS_HEADERS);
          const rows = totalsModels.edges!.map((t, i) => ({
            rank: i + 1,
            player:
              usernames.get(t!.node!.player!) ??
              formatAddress(t!.node!.player!),
            totalTokens: parseInt(t!.node!.rewards_earned!).toLocaleString(),
          }));
          setRows(rows);
        }
      },
    );
  }, [leaderboardResult, sortBy]);

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
                    {sortBy === "score" ? "Top Score" : "Total Tokens"}
                    <CaretIcon />
                  </Button>
                </MenuTrigger>
                <MenuContent>
                  <MenuItem value="score" onClick={() => setSortBy("score")}>
                    Top Score
                  </MenuItem>
                  <MenuItem value="tokens" onClick={() => setSortBy("tokens")}>
                    Total Tokens
                  </MenuItem>
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
                {headers.map((h, i) => (
                  <Box key={i} w="full" textAlign="center">
                    <Text>{h}</Text>
                  </Box>
                ))}
              </HStack>
              <Spacer minH="20px" />
              <VStack w="full">
                {rows.map((row) => (
                  <LeaderboardRow
                    key={row.rank}
                    rowData={row}
                    isOwn={row.player === account?.address}
                    onClick={() => {
                      navigate(`/0x${Number(row.gameId).toString(16)}`);
                    }}
                  />
                ))}
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

interface LeaderboardRowProps {
  rowData: {
    rank: number;
    player: string;
    score?: number;
    reward?: string;
    totalTokens?: string;
    gameId: string;
  };
  isOwn?: boolean;
  onClick: () => void;
}

const LeaderboardRow = ({ rowData, isOwn, onClick }: LeaderboardRowProps) => {
  return (
    <HStack
      w="full"
      h="30px"
      justify="space-between"
      fontWeight="500"
      borderRadius="4px"
      _hover={{
        cursor: "pointer",
        bgColor: "rgba(255,255,255,0.08)",
      }}
      onClick={onClick}
      color={isOwn ? "orange.50" : "white"}
    >
      <Box flex="1" textAlign="center">
        <Text>{rowData.rank}</Text>
      </Box>
      <Box flex="1" textAlign="center">
        <Text>{rowData.player}</Text>
      </Box>
      {rowData.score !== undefined ? (
        <>
          <Box flex="1" textAlign="center">
            <Text>{rowData.score}</Text>
          </Box>
          <Box flex="1" textAlign="center">
            <Text>{rowData.reward}</Text>
          </Box>
        </>
      ) : (
        <Box flex="1" textAlign="center">
          <Text>{rowData.totalTokens}</Text>
        </Box>
      )}
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
