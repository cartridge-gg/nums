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
import {
  Game,
} from "@/bindings";
import { TokenBalanceUi } from "@/components/ui/token-balance";
import useChain from "@/hooks/chain";
import { getNumsAddress } from "@/config";
import { LuCrown } from "react-icons/lu";
import { useClaim } from "@/hooks/useClaim";
import { BigNumberish, CairoCustomEnum, num } from "starknet";
import Play from "@/components/Play";
import { useGames } from "@/context/game";
import { MaybeController } from "@/components/MaybeController";
import GetNums from "@/components/GetNums";
import tunnelBackground from "@/assets/tunnel-background.svg";
import { useTournaments } from "@/context/tournaments";

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
  const { tournaments } = useTournaments();
  const [jackpotId, setJackpotId] = useState<number | undefined>();

  const { getGameByJackpotId } = useGames();

  const [games, setGames] = useState<(Game & { rank?: number })[]>([]);

  useEffect(() => {
    if (!tournaments || tournaments.length === 0 || jackpotId !== undefined) return;
    setJackpotId(tournaments[tournaments.length - 1].id);
  }, [tournaments, jackpotId]);

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
          factory={undefined}
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
                      {!jackpotId ? "Jackpot" : `Jackpot #${jackpotId}`}
                      <CaretIcon />
                    </Button>
                  </MenuTrigger>
                  <MenuContent>
                    {tournaments && tournaments.map((tournament) => (
                      <MenuItem
                        className={jackpotId === tournament.id ? "bg-gray-100" : ""}
                        key={tournament.id}
                        value={tournament.id.toString()}
                        onClick={() => setJackpotId(tournament.id)}
                      >
                        {`Jackpot #${tournament.id}`}
                      </MenuItem>
                    ))}
                  </MenuContent>
                </MenuRoot>
              </HStack>

              <HStack>
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
              </VStack>
            </VStack>

          </VStack>
        </VStack>
      </Container>
    </>
  );
};

export default Home;
