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
  HoverCard,
  Heading,
  Spinner,
} from "@chakra-ui/react";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
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
  Token,
  TokenTypeERC20,
} from "@/bindings";
import { TokenBalanceUi } from "@/components/ui/token-balance";
import useChain from "@/hooks/chain";
import { getNumsAddress } from "@/config";
import { LuCrown } from "react-icons/lu";
import { useClaim } from "@/hooks/useClaim";
import { BigNumberish, CairoCustomEnum, num } from "starknet";
import { JackpotDetails } from "@/components/JackpotDetails";
import Play from "@/components/Play";
import { Scrollable } from "@/components/ui/scrollable";
import { useGames } from "@/context/game";
import { MaybeController } from "@/components/MaybeController";
import GetNums from "@/components/GetNums";
import tunnelBackground from "@/assets/tunnel-background.svg";

interface WinnersRewards {
  nums: BigNumberish;
  token?: BigNumberish;
  tokenAddress?: string;
}

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
  const { claim, isLoading: isClaiming } = useClaim();

  const {
    jackpots,
    jackpotFactories,
    getWinnersByJackpotId,
    getClaimableByUser,
  } = useJackpots();
  const { getGameByJackpotId } = useGames();

  const [winners, setWinners] = useState<JackpotWinner[]>([]);
  const [selectedFactory, setSelectedFactory] = useState<JackpotFactory>();
  const [selectedJackpots, setSelectedJackpots] = useState<
    (Jackpot & { computedId: number })[]
  >([]);
  const [selectedJackpot, setSelectedJackpot] = useState<
    (Jackpot & { computedId: number }) | undefined
  >(undefined);
  const [games, setGames] = useState<(Game & { rank?: number })[]>([]);
  const [rewardsByWinner, setRewardsByWinner] = useState<WinnersRewards>();

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

  const claimable = useMemo(() => {
    if (!account) return [];
    return winners.filter(
      (i) => BigInt(i.player) === BigInt(account.address) && !i.claimed
    );
  }, [winners, account]);

  useEffect(() => {
    if (selectedJackpot) {
      const totalWinners =
        BigInt(selectedJackpot.total_winners) > 0
          ? BigInt(selectedJackpot.total_winners)
          : 1n;

      let tokenBalance = 0n;
      let tokenAddress = undefined;
      if (selectedJackpot?.token.isSome()) {
        //
        const token = selectedJackpot.token.unwrap() as Token;
        switch ((token.ty as CairoCustomEnum).activeVariant()) {
          case "ERC20":
            const values = (token.ty as CairoCustomEnum).variant[
              "ERC20"
            ] as TokenTypeERC20;
            tokenBalance = BigInt(values.amount);
            tokenAddress = token.address;
            break;
        }
      }

      const rewardsByWinner = {
        nums: BigInt(selectedJackpot.nums_balance) / totalWinners / 10n ** 18n,
        token: BigInt(tokenBalance) / totalWinners / 10n ** 18n,
        tokenAddress,
      };

      setRewardsByWinner(rewardsByWinner);
    }
  }, [selectedJackpot]);

  const isJackpotOver = useMemo(() => {
    return Number(selectedJackpot?.end_at) * 1_000 <= Date.now();
  }, [selectedJackpot]);

  return (
    <>
      {/* Background layer */}
      <Box
        as="img"
        src={tunnelBackground}
        alt=""
        position="fixed"
        top="0"
        left="0"
        w="100vw"
        h="100vh"
        objectFit="cover"
        objectPosition="center"
        zIndex={0}
        pointerEvents="none"
      />
      
      <Container
        // minH="100vh"
        h={["100dvh", "100vh"]}
        maxW="100vw"
        display="flex"
        justifyContent="center"
        alignItems={"flex-start"}
        p="15px"
        pt={["70px", "100px", "120px"]}
        position="relative"
        zIndex={1}
      >
        <Header />
      <InfoOverlay
        open={openInfo}
        onClose={onCloseInfo}
        factory={selectedFactory}
      />
      <VStack w="full" position="relative" zIndex="1">
        <VStack gap={["8px", "16px"]} w={["100%", "100%", "800px"]}>
          <HStack w="full" justify="space-between">
            <HStack>
              <MenuRoot>
                <MenuTrigger asChild>
                  <Button
                    visual="transparent"
                    gap="8px"
                    height="36px"
                    padding={["4px 8px", "6px 12px"]}
                    fontSize={["14px", "16px"]}
                  >
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
                  <Button
                    visual="transparent"
                    gap="8px"
                    height="36px"
                    padding={["4px 8px", "6px 12px"]}
                    fontSize={["14px", "16px"]}
                  >
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
              {selectedJackpot &&
                isJackpotOver &&
                claimable &&
                claimable.length > 0 && (
                  <Button
                    onClick={() => {
                      claim(
                        selectedJackpot.id,
                        claimable.map((i) => i.index)
                      );
                    }}
                  >
                    {isClaiming ? <Spinner /> : <LuCrown />}
                    {isMobile ? "" : "Claim"}
                  </Button>
                )}
              {!isMobile && selectedFactory && (
                <>
                  <GetNums />
                  <Play
                    onReady={(gameId) => navigate(`/${gameId}`)}
                    w={["100%", "100%", "auto"]}
                    factory={selectedFactory}
                  />
                </>
              )}

              <Button visual="transparent" p="6px" onClick={() => onOpenInfo()}>
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
              <JackpotDetails
                jackpotId={selectedJackpot.id}
                computedId={selectedJackpot.computedId}
              />
            </Box>
          )}
          <Box
            w="full"
            layerStyle="transparent"
            padding={["10px", "10px", "10px 30px"]}
            bgColor="rgba(0,0,0,0.04)"
          >
            <Scrollable
              maxH={["calc(100dvh - 320px)", "calc(100vh - 350px)"]}
              h={["calc(100dvh - 320px)", "calc(100vh - 350px)"]}
            >
              <Table.Root
                size="sm"
                variant="outline"
                border="0"
                boxShadow="none"
                overflow="visible"
                stickyHeader
              >
                <Table.Header bg="purple.200">
                  <Table.Row border="0" bg="purple.200">
                    <Table.ColumnHeader
                      color="#bbaaee"
                      borderBottomWidth={0}
                      w={["40px", "70px"]}
                      fontFamily="CircularLL"
                      fontWeight="450"
                      fontSize="14px"
                      textTransform="uppercase"
                    >
                      {isMobile ? "#" : "RANK"}
                    </Table.ColumnHeader>
                    <Table.ColumnHeader
                      color="#bbaaee"
                      borderBottomWidth={0}
                      fontFamily="CircularLL"
                      fontWeight="450"
                      fontSize="14px"
                      textTransform="uppercase"
                    >
                      PLAYER
                    </Table.ColumnHeader>
                    <Table.ColumnHeader
                      color="#bbaaee"
                      borderBottomWidth={0}
                      w={["55px", "70px"]}
                      fontFamily="CircularLL"
                      fontWeight="450"
                      fontSize="14px"
                      textTransform="uppercase"
                    >
                      SCORE
                    </Table.ColumnHeader>
                    <Table.ColumnHeader
                      color="#bbaaee"
                      borderBottomWidth={0}
                      textAlign="right"
                      fontFamily="CircularLL"
                      fontWeight="450"
                      fontSize="14px"
                      textTransform="uppercase"
                    >
                      $NUMS
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {selectedJackpot &&
                    games &&
                    games.slice(0, 100).map((game, idx) => {
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
                          color={isOwn ? "orange.50" : "white"}
                        >
                          <Table.Cell
                            cursor="pointer"
                            onClick={() =>
                              navigate(`/${num.toHex(game.game_id)}`)
                            }
                            padding={["3px", "6px"]}
                            fontFamily="CircularLL"
                            fontWeight="500"
                            fontSize="16px"
                          >
                            {game.rank}
                          </Table.Cell>

                          <Table.Cell 
                            padding={["3px", "6px"]}
                            fontFamily="CircularLL"
                            fontWeight="500"
                            fontSize="16px"
                          >
                            <HStack>
                              <MaybeController address={game.player} />
                              {isWinner &&
                                Number(selectedJackpot.end_at) * 1_000 <
                                  Date.now() && (
                                  <HoverCard.Root
                                    positioning={{ placement: "top-start" }}
                                  >
                                    <HoverCard.Trigger asChild>
                                      <LuCrown
                                        cursor="pointer"
                                        color={hasClaimed ? "orange" : "gold"}
                                        onClick={() =>
                                          claim(game.jackpot_id, [
                                            isWinner.index,
                                          ])
                                        }
                                      />
                                    </HoverCard.Trigger>
                                    <HoverCard.Positioner>
                                      <HoverCard.Content
                                        bg="purple.200"
                                        color="white"
                                      >
                                        <Heading fontWeight="normal">
                                          {isWinner.claimed
                                            ? "Claimed !"
                                            : "Claimable"}
                                        </Heading>
                                        <VStack gap={0} alignItems="flex-end">
                                          <TokenBalanceUi
                                            balance={rewardsByWinner?.nums || 0}
                                            address={numsAddress}
                                          />
                                          {rewardsByWinner &&
                                            BigInt(rewardsByWinner.token || 0) >
                                              0n && (
                                              <TokenBalanceUi
                                                balance={
                                                  rewardsByWinner?.token || 0
                                                }
                                                address={
                                                  rewardsByWinner?.tokenAddress ||
                                                  0
                                                }
                                              />
                                            )}
                                        </VStack>
                                      </HoverCard.Content>
                                    </HoverCard.Positioner>
                                  </HoverCard.Root>
                                )}
                            </HStack>
                          </Table.Cell>
                          <Table.Cell
                            textAlign="center"
                            padding={["3px", "6px"]}
                            fontFamily="CircularLL"
                            fontWeight="500"
                            fontSize="16px"
                          >
                            {game.level.toString()}
                          </Table.Cell>
                          <Table.Cell
                            fontWeight="500"
                            padding={["3px", "6px"]}
                            fontFamily="CircularLL"
                            fontSize="16px"
                          >
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
            </Scrollable>
          </Box>

          <VStack w="full" justifyContent="center" gap={1}>
            {isMobile && selectedFactory && (
              <>
                <Play
                  onReady={(gameId) => navigate(`/${gameId}`)}
                  w={["100%", "100%", "auto"]}
                  factory={selectedFactory}
                />
                <GetNums w="full" />
              </>
            )}
            {/* <Button onClick={() => navigate("/factories")}>Play Nums</Button> */}
          </VStack>
        </VStack>
      </VStack>
    </Container>
    </>
  );
};

export default Home;
