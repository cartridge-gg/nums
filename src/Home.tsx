import {
  VStack,
  Text,
  Container,
  Box,
  HStack,
  Spacer,
  useDisclosure,
  Stack,
  useBreakpointValue,
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
import { Tooltip } from "@/components/ui/tooltip";
import { lookupAddresses } from "@cartridge/controller";
import { TrophyIcon } from "./components/icons/Trophy";
import { Button } from "./components/Button";
import { Timer } from "./components/Timer";
import { InfoIcon } from "./components/icons/Info";
import { CaretIcon } from "./components/icons/Caret";
import Play from "./components/Play";
import InfoOverlay from "./components/Info";
import { graphql } from "./graphql/appchain";

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
    numsConfigModels {
      edges {
        node {
          game {
            Some {
              expiration {
                Some
              }
            }
          }
        }
      }
    }
  }
`);

const TOP_SCORE_HEADERS = ["Ranking", "Player", "Score", "$NUMS"];
const MOBILE_TOP_SCORE_HEADERS = ["Ranking", "Player", "Score"];
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
  const [gameExpiration, setGameExpiration] = useState<number>();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // const [offset, setOffset] = useState<number>(0);
  const [leaderboardResult] = useQuery({
    query: LeaderboardQuery,
    requestPolicy: "cache-and-network",
    // variables: {
    //   offset,
    // },
  });

  useEffect(() => {
    const gameModels = leaderboardResult.data?.numsGameModels;
    const totalsModels = leaderboardResult.data?.numsTotalsModels;
    const configModels = leaderboardResult.data?.numsConfigModels;
    if (!gameModels || !totalsModels || !configModels) return;

    const expiration =
      configModels.edges![0]!.node!.game!.Some?.expiration?.Some!;
    setGameExpiration(parseInt(expiration));

    const gameAddresses = gameModels.edges!.map((g) => g!.node!.player!) || [];
    const totalsAddresses =
      totalsModels.edges!.map((t) => t!.node!.player!) || [];

    lookupAddresses([...gameAddresses, ...totalsAddresses]).then(
      (usernames) => {
        if (sortBy === "score") {
          setHeaders(isMobile ? MOBILE_TOP_SCORE_HEADERS : TOP_SCORE_HEADERS);
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
      <Container
        minH="100vh"
        maxW="100vw"
        alignContent={["flex-start", "flex-start", "center"]}
        p="15px"
        pt={["100px", "100px", "0px"]}
      >
        <Header hideChain />
        <InfoOverlay open={openInfo} onClose={onCloseInfo} />
        <VStack>
          <VStack gap="20px" w={["100%", "100%", "800px"]}>
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
              padding={["10px", "10px", "30px"]}
              bgColor="rgba(0,0,0,0.04)"
            >
              <HStack
                w="full"
                px={["0", "0", "20px"]}
                justify="space-between"
                fontSize="14px"
                fontWeight="450"
                color="purple.50"
                textTransform="uppercase"
              >
                {headers.map((h, i) => (
                  <Box key={i} w="full">
                    <Text textAlign={["center", "center", "left"]}>{h}</Text>
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
                      if (sortBy === "tokens") return;

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
                gap={["25px", "25px", "50px"]}
                justify="space-between"
                direction={["column", "column", "row"]}
              >
                <Timer expiration={gameExpiration} />
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
  const isMobile = useBreakpointValue({ base: true, md: false });
  const maxLength = isMobile ? 8 : 14;
  const textAlign = ["center", "center", "left"];
  return (
    <HStack
      w="full"
      h="30px"
      px={["0", "0", "20px"]}
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
      <Box flex="1" textAlign={textAlign}>
        <Text>{rowData.rank}</Text>
      </Box>
      <Tooltip
        showArrow
        openDelay={500}
        closeDelay={100}
        content={rowData.player}
        disabled={rowData.player.length < maxLength}
      >
        <Box flex="1" textAlign={textAlign}>
          <Text>
            {rowData.player.length > maxLength
              ? rowData.player.slice(0, maxLength) + "..."
              : rowData.player}
          </Text>
        </Box>
      </Tooltip>
      {rowData.score !== undefined ? (
        <>
          {!isMobile && (
            <Box flex="1" textAlign={textAlign}>
              <Text>{rowData.score}</Text>
            </Box>
          )}
          <Box flex="1" textAlign={textAlign}>
            <Text>{rowData.reward}</Text>
          </Box>
        </>
      ) : (
        <Box flex="1" textAlign={textAlign}>
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
