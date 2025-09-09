import {
  VStack,
  Text,
  Container,
  Box,
  HStack,
  Spacer,
  useDisclosure,
  useBreakpointValue,
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
import { Game, Jackpot, JackpotFactory, TokenTypeERC20 } from "@/bindings";
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

  const { jackpots, jackpotFactories, getWinnersById } = useJackpots();
  const { getGameByJackpotId } = useGames();

  const [selectedFactory, setSelectedFactory] = useState<JackpotFactory>();
  const [selectedJackpots, setSelectedJackpots] = useState<Jackpot[]>([]);
  const [selectedJackpot, setSelectedJackpot] = useState<Jackpot | undefined>(
    undefined
  );
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
      setSelectedJackpots(filtered);
      if (filtered.length > 0) {
        setSelectedJackpot(filtered[0]);
      }
    }
  }, [selectedFactory, jackpots]);

  useEffect(() => {
    if (selectedJackpot) {
      const games = getGameByJackpotId(selectedJackpot.id);
      setGames(games || []);
    }
  }, [selectedJackpot, getGameByJackpotId]);

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
                    #{selectedJackpot?.id.toString()}
                    <CaretIcon />
                  </Button>
                </MenuTrigger>
                <MenuContent>
                  {selectedJackpots?.map((jackpot, idx) => {
                    return (
                      <MenuItem
                        key={idx}
                        value={jackpot.id.toString()}
                        onClick={() => setSelectedJackpot(jackpot)}
                      >
                        {jackpot.id.toString()}
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

          {selectedJackpots && selectedJackpots.length > 0 && (
            <Box
              w="full"
              layerStyle="transparent"
              padding={["10px", "10px", "10px 30px"]}
              bgColor="rgba(0,0,0,0.04)"
            >
              <JackpotDetails jackpotId={selectedJackpots[0].id} />
            </Box>
          )}
          <Box
            w="full"
            layerStyle="transparent"
            padding={["10px", "10px", "10px 30px"]}
            bgColor="rgba(0,0,0,0.04)"
          >
            <HStack
              w="full"
              px={"0px"}
              justify="space-between"
              fontSize="14px"
              fontWeight="450"
              color="purple.50"
              textTransform="uppercase"
            >
              <Box minW="50px">Rank</Box>
              <Box minW="100px" textAlign="left">
                Name
              </Box>
              <Box minW="50px" textAlign="right">
                Score
              </Box>
              <Box minW="100px" textAlign="right">
                Nums
              </Box>
            </HStack>
            <Spacer minH="20px" />

            <Scrollable maxH="calc(100vh - 380px)">
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
            </Scrollable>
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
