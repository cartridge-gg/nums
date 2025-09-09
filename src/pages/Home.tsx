import {
  VStack,
  Text,
  Container,
  Box,
  HStack,
  Spacer,
  useDisclosure,
  useBreakpointValue,
  Table,
} from "@chakra-ui/react";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAccount } from "@starknet-react/core";
import Header from "../components/Header";
import { TrophyIcon } from "../components/icons/Trophy";
import { Button } from "../components/Button";
import { InfoIcon } from "../components/icons/Info";
import { CaretIcon } from "../components/icons/Caret";
import InfoOverlay from "../components/Info";
import { useJackpots } from "@/context/jackpots";
import {
  Game,
  Jackpot,
  JackpotFactory,
  JackpotWinner,
  TokenTypeERC20,
} from "@/bindings";
import { TokenBalanceUi } from "@/components/ui/token-balance";
import useChain from "@/hooks/chain";
import { getNumsAddress } from "@/config";
import { useControllers } from "@/context/controllers";
import { shortAddress } from "@/utils/address";
import { LuCrown } from "react-icons/lu";
import { useClaim } from "@/hooks/useClaim";
import { CairoCustomEnum, num } from "starknet";
import { JackpotDetails } from "@/components/JackpotDetails";
import Play from "@/components/Play";
import { Scrollable } from "@/components/ui/scrollable";
import { useGames } from "@/context/game";
import { MaybeController } from "@/components/MaybeController";
import useToast from "@/hooks/toast";

const Home = () => {
  const navigate = useNavigate();
  const {
    open: openInfo,
    onOpen: onOpenInfo,
    onClose: onCloseInfo,
  } = useDisclosure();
  const { account } = useAccount();
  const { chain } = useChain();
  const numsAddress = getNumsAddress(chain.id);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { findController } = useControllers();
  const { claim } = useClaim();

  const { jackpots, jackpotFactories, getWinnersByJackpotId } = useJackpots();
  const { getGameByJackpotId } = useGames();

  const [winners, setWinners] = useState<JackpotWinner[]>([]);
  const [selectedFactory, setSelectedFactory] = useState<JackpotFactory>();
  const [selectedJackpots, setSelectedJackpots] = useState<
    (Jackpot & { computedId: number })[]
  >([]);
  const [selectedJackpot, setSelectedJackpot] = useState<
    (Jackpot & { computedId: number }) | undefined
  >(undefined);
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    if (jackpotFactories && jackpotFactories.length > 0 && !selectedFactory) {
      setSelectedFactory(jackpotFactories[0]);
    }
  }, [jackpotFactories, games]);

  useEffect(() => {
    if (selectedFactory) {
      const filtered = (jackpots || []).filter(
        (i) => i.factory_id === selectedFactory.id
      );
      const sorted = filtered
        .sort((a, b) => Number(b.id) - Number(a.id))
        .map((jackpot, idx) => {
          return {
            ...jackpot,
            computedId: filtered.length - idx,
          };
        });
      setSelectedJackpots(sorted);
      if (filtered.length > 0) {
        setSelectedJackpot(sorted[0]);
      }
    }
  }, [selectedFactory, jackpots]);

  useEffect(() => {
    if (selectedJackpot) {
      const games = getGameByJackpotId(selectedJackpot.id);
      setGames(games || []);
    }
  }, [selectedJackpot, getGameByJackpotId]);

  useEffect(() => {
    if (selectedJackpot) {
      const winners = getWinnersByJackpotId(selectedJackpot.id) || [];
      setWinners(winners);
    }
  }, [selectedJackpot, account]);

  return (
    <Container
      minH="100vh"
      maxW="100vw"
      display="flex"
      justifyContent="center"
      alignItems={"flex-start"}
      p="15px"
      pt={["70px", "100px", "120px"]}
    >
      <Header />
      <InfoOverlay open={openInfo} onClose={onCloseInfo} />
      <VStack w="full">
        <VStack gap="16px" w={["100%", "100%", "800px"]}>
          <HStack w="full" justify="space-between">
            <HStack>
              <MenuRoot>
                <MenuTrigger asChild>
                  <Button visual="transparent" gap="8px" fontSize="18px">
                    <TrophyIcon />
                    {selectedFactory?.name}
                    <CaretIcon />
                  </Button>
                </MenuTrigger>
                <MenuContent>
                  {jackpotFactories?.map((factory, idx) => {
                    return (
                      <MenuItem
                        key={idx}
                        value={factory.id.toString()}
                        onClick={() => setSelectedFactory(factory)}
                        _hover={{
                          bg: "purple.50",
                        }}
                      >
                        {factory.name}
                      </MenuItem>
                    );
                  })}
                </MenuContent>
              </MenuRoot>

              <MenuRoot>
                <MenuTrigger asChild>
                  <Button visual="transparent" gap="8px" fontSize="18px">
                    #{selectedJackpot?.computedId}
                    <CaretIcon />
                  </Button>
                </MenuTrigger>
                <MenuContent>
                  {selectedJackpots?.map((jackpot, idx) => {
                    return (
                      <MenuItem
                        key={idx}
                        value={jackpot.computedId.toString()}
                        onClick={() => setSelectedJackpot(jackpot)}
                        _hover={{
                          bg: "purple.50",
                        }}
                      >
                        # {jackpot.computedId}
                      </MenuItem>
                    );
                  })}
                </MenuContent>
              </MenuRoot>
            </HStack>

            <HStack>
              {!isMobile && selectedFactory && (
                <Play
                  onReady={(gameId) => navigate(`/${gameId}`)}
                  w={["100%", "100%", "auto"]}
                  factoryId={selectedFactory?.id}
                />
              )}
              <Button visual="transparent" p="8px" onClick={() => onOpenInfo()}>
                <InfoIcon />
              </Button>
            </HStack>
          </HStack>

          {selectedJackpot && (
            <Box
              w="full"
              layerStyle="transparent"
              padding={["10px", "10px", "10px 30px"]}
              bgColor="rgba(0,0,0,0.04)"
            >
              <JackpotDetails jackpotId={selectedJackpot.id} />
            </Box>
          )}
          <Box
            w="full"
            layerStyle="transparent"
            padding={["10px", "10px", "10px 30px"]}
            bgColor="rgba(0,0,0,0.04)"
          >
            <Table.Root size="sm" variant="outline" border="0" boxShadow="none">
              <Table.Header bg="transparent">
                <Table.Row bg="transparent" border="0" opacity={0.5}>
                  <Table.ColumnHeader
                    color="white"
                    borderBottomWidth={0}
                    w="70px"
                  >
                    RANK
                  </Table.ColumnHeader>
                  <Table.ColumnHeader color="white" borderBottomWidth={0}>
                    PLAYER
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color="white"
                    borderBottomWidth={0}
                    w="70px"
                  >
                    SCORE
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color="white"
                    borderBottomWidth={0}
                    textAlign="right"
                  >
                    $NUMS
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {games &&
                  games
                    .sort(
                      (a, b) =>
                        Number(a.remaining_slots) - Number(b.remaining_slots)
                    )
                    .slice(0, 100)
                    .map((game, idx) => {
                      const isOwn =
                        BigInt(game.player) === BigInt(account?.address || 0);

                      const isWinner = winners.find(
                        (i) => BigInt(i.game_id) === BigInt(game.game_id)
                      );

                      const hasClaimed = isWinner?.claimed;

                      return (
                        <Table.Row
                          key={idx}
                          borderBottomWidth="0px"
                          fontWeight="bold"
                          color={isOwn ? "orange.50" : "white"}
                        >
                          <Table.Cell
                            cursor="pointer"
                            onClick={() =>
                              navigate(`/${num.toHex(game.game_id)}`)
                            }
                          >
                            #{idx + 1}
                          </Table.Cell>
                          <Table.Cell>
                            <MaybeController address={game.player} />
                          </Table.Cell>
                          <Table.Cell>
                            <HStack>
                              {Number(game.max_slots) -
                                Number(game.remaining_slots)}
                              {isWinner && (
                                <LuCrown
                                  cursor="pointer"
                                  color={hasClaimed ? "orange" : "gold"}
                                  onClick={() => claim(game.jackpot_id)}
                                />
                              )}
                            </HStack>
                          </Table.Cell>
                          <Table.Cell fontWeight="normal">
                            <VStack alignItems="flex-end">
                              <TokenBalanceUi
                                balance={game.reward}
                                address={numsAddress}
                              />
                            </VStack>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
              </Table.Body>
            </Table.Root>

            {/* <Scrollable maxH="calc(100vh - 380px)">
              <VStack w="full" gap={3}>
                {games &&
                  games
                    .sort(
                      (a, b) =>
                        Number(a.remaining_slots) - Number(b.remaining_slots)
                    )
                    .slice(0, 100)
                    .map((game, idx) => {
                      return (
                        <HStack key={idx} w="full" alignItems="flex-start">
                          <Box
                            minW="50px"
                            cursor="pointer"
                            onClick={() =>
                              navigate(`/${num.toHex(game.game_id)}`)
                            }
                          >
                            #{idx + 1}
                          </Box>
                          <Box w="full" justifyItems="flex-start">
                            <MaybeController address={game.player} />
                          </Box>
                          <Box minW="50px" textAlign="right">
                            {Number(game.max_slots) -
                              Number(game.remaining_slots)}
                          </Box>
                          <Box minW="100px" justifyItems="flex-end">
                            <VStack alignItems="flex-end">
                              <TokenBalanceUi
                                balance={game.reward}
                                address={numsAddress}
                              />
                            </VStack>
                          </Box>
                        </HStack>
                      );
                    })}
              </VStack>
            </Scrollable> */}
          </Box>

          <HStack w="full" justifyContent="center" gap={6}>
            {isMobile && selectedFactory && (
              <Play
                onReady={(gameId) => navigate(`/${gameId}`)}
                w={["100%", "100%", "auto"]}
                factoryId={selectedFactory?.id}
              />
            )}
            {/* <Button onClick={() => navigate("/factories")}>Play Nums</Button> */}
          </HStack>
        </VStack>
      </VStack>
    </Container>
  );
};

export default Home;
