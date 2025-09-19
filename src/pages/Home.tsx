import {
  VStack,
  Text,
  Container,
  Box,
  HStack,
  Spacer,
  useDisclosure,
  useBreakpointValue,
  HoverCard,
  Heading,
  Spinner,
  Image,
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
        (i) => i.factory_id === selectedFactory.id,
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
      (i) => BigInt(i.player) === BigInt(account.address) && !i.claimed,
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
      <Image
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
        <VStack w="full" h="full" position="relative" zIndex="1">
          <VStack
            gap={["8px", "16px"]}
            w={["100%", "100%", "800px"]}
            h="full"
            flex="1"
            minH={0}
          >
            <HStack w="full" justify="space-between" flexShrink={0}>
              <HStack>
                <MenuRoot>
                  <MenuTrigger asChild>
                    <Button
                      visual="transparent"
                      gap="8px"
                      height={["40px", "45px", "50px"]}
                      padding={["6px 10px", "8px 14px"]}
                      fontSize={["18px", "20px", "22px"]}
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
                      height={["40px", "45px", "50px"]}
                      padding={["6px 10px", "8px 14px"]}
                      fontSize={["18px", "20px", "22px"]}
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
                          claimable.map((i) => i.index),
                        );
                      }}
                      height={["40px", "45px", "50px"]}
                      fontSize={["18px", "20px", "22px"]}
                      px="12px"
                    >
                      {isClaiming ? <Spinner /> : <LuCrown />}
                      {isMobile ? "" : "Claim"}
                    </Button>
                  )}
                {!isMobile && selectedFactory && (
                  <>
                    <GetNums
                      height={["40px", "45px", "50px"]}
                      fontSize={["18px", "20px", "22px"]}
                      px="12px"
                    />
                    <Play
                      onReady={(gameId) => navigate(`/${gameId}`)}
                      w={["100%", "100%", "auto"]}
                      factory={selectedFactory}
                      height={["40px", "45px", "50px"]}
                      fontSize={["18px", "20px", "22px"]}
                      px="12px"
                    />
                  </>
                )}

                <Button
                  visual="transparent"
                  p="10px"
                  height={["40px", "45px", "50px"]}
                  onClick={() => onOpenInfo()}
                >
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
                flexShrink={0}
              >
                <JackpotDetails
                  jackpotId={selectedJackpot.id}
                  computedId={selectedJackpot.computedId}
                />
              </Box>
            )}
            <VStack
              w="full"
              padding={["16px", "24px", "32px"]}
              gap={["16px", "20px", "24px"]}
              flex="1"
              minH={0}
              alignItems="flex-start"
              bgColor="rgba(0,0,0,0.04)"
              borderRadius="8px"
              boxShadow="1px 1px 0px rgba(0, 0, 0, 0.12)"
              overflow="hidden"
            >
              {/* Headers */}
              <HStack
                gap={["4px", "6px", "8px"]}
                px={["8px", "10px", "12px"]}
                py="0"
                w="full"
                alignSelf="stretch"
                flexShrink={0}
              >
                <Box w={["40px", "60px", "80px"]} flexShrink={0}>
                  <Text
                    color="#bbaaee"
                    fontFamily="CircularLL"
                    fontWeight="450"
                    fontSize={["12px", "13px", "14px"]}
                    textTransform="uppercase"
                  >
                    {isMobile ? "#" : "RANK"}
                  </Text>
                </Box>
                <Box flex="1">
                  <Text
                    color="#bbaaee"
                    fontFamily="CircularLL"
                    fontWeight="450"
                    fontSize={["12px", "13px", "14px"]}
                    textTransform="uppercase"
                  >
                    PLAYER
                  </Text>
                </Box>
                <Box w={["50px", "70px", "96px"]} flexShrink={0}>
                  <Text
                    color="#bbaaee"
                    fontFamily="CircularLL"
                    fontWeight="450"
                    fontSize={["12px", "13px", "14px"]}
                    textTransform="uppercase"
                    textAlign="center"
                  >
                    SCORE
                  </Text>
                </Box>
                <Box w={["60px", "80px", "100px"]} flexShrink={0}>
                  <Text
                    color="#bbaaee"
                    fontFamily="CircularLL"
                    fontWeight="450"
                    fontSize={["12px", "13px", "14px"]}
                    textTransform="uppercase"
                    textAlign="right"
                  >
                    $NUMS
                  </Text>
                </Box>
              </HStack>

              {/* Rows */}
              <VStack
                gap="12px"
                w="full"
                alignItems="stretch"
                flex="1"
                minH={0}
                overflowY="auto"
                overflowX="hidden"
              >
                {selectedJackpot &&
                  games &&
                  games.slice(0, 100).map((game, idx) => {
                    const isOwn =
                      BigInt(game.player) === BigInt(account?.address || 0);

                    const isWinner = winners.find(
                      (i) => BigInt(i.game_id) === BigInt(game.game_id),
                    );

                    const hasClaimed = isWinner?.claimed;

                    return (
                      <HStack
                        key={idx}
                        gap={["4px", "6px", "8px"]}
                        px={["8px", "10px", "12px"]}
                        py={["3px", "3px", "4px"]}
                        alignSelf="stretch"
                        color={isOwn ? "orange.50" : "white"}
                        cursor="pointer"
                        onClick={() => navigate(`/${num.toHex(game.game_id)}`)}
                      >
                        <Box w={["40px", "60px", "80px"]} flexShrink={0}>
                          <Text
                            fontFamily="CircularLL"
                            fontWeight="500"
                            fontSize={["14px", "15px", "16px"]}
                          >
                            {game.rank}
                          </Text>
                        </Box>

                        <Box flex="1">
                          <HStack
                            gap={["4px", "6px", "8px"]}
                            fontSize={["14px", "15px", "16px"]}
                          >
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
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        claim(game.jackpot_id, [
                                          isWinner.index,
                                        ]);
                                      }}
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
                        </Box>

                        <Box w={["50px", "70px", "96px"]} flexShrink={0}>
                          <Text
                            fontFamily="CircularLL"
                            fontWeight="500"
                            fontSize={["14px", "15px", "16px"]}
                            textAlign="center"
                          >
                            {game.level.toString()}
                          </Text>
                        </Box>

                        <Box
                          w={["60px", "80px", "100px"]}
                          flexShrink={0}
                          textAlign="right"
                        >
                          <TokenBalanceUi
                            balance={game.reward}
                            address={numsAddress}
                            showIcon={false}
                          />
                        </Box>
                      </HStack>
                    );
                  })}
              </VStack>
            </VStack>

            <VStack w="full" justifyContent="center" gap={1} flexShrink={0}>
              {isMobile && selectedFactory && (
                <>
                  <Play
                    onReady={(gameId) => navigate(`/${gameId}`)}
                    w={["100%", "100%", "auto"]}
                    factory={selectedFactory}
                    height={["40px", "45px", "50px"]}
                    fontSize={["18px", "20px", "22px"]}
                    px="12px"
                  />
                  <GetNums
                    w="full"
                    height={["40px", "45px", "50px"]}
                    fontSize={["18px", "20px", "22px"]}
                    px="12px"
                  />
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
