import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isMoveLegal } from "../utils";
import {
  Box,
  Container,
  Grid,
  HStack,
  Spinner,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react";
import { Button } from "../components/Button";
import { useAccount, useNetwork } from "@starknet-react/core";
import Header from "../components/Header";
import Play from "../components/Play";
import Slot from "../components/Slot";
import NextNumber from "../components/NextNumber";
import { useAudio } from "../context/audio";
import { CallData } from "starknet";
import { ShowReward } from "../components/ShowReward";
import {
  getContractAddress,
  getVrfAddress,
  MAINNET_CHAIN_ID,
  NAMESPACE,
  SEPOLIA_CHAIN_ID,
} from "../config";
import { useExecuteCall } from "../hooks/useExecuteCall";
import { TimeCountdown } from "../components/TimeCountdown";
import Confetti from "react-confetti";
import { useClaim } from "@/hooks/useClaim";
import { useJackpotEvents } from "@/hooks/useJackpotEvents";
import useToast from "@/hooks/toast";
import { useControllers } from "@/context/controllers";
import { useGame } from "@/hooks/useGame";

const Game = () => {
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { chain } = useNetwork();
  const { account, address } = useAccount();
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { playPositive, playNegative } = useAudio();
  const { execute } = useExecuteCall();
  const { showMessage, showJackpotEvent } = useToast();
  const { findController } = useControllers();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const [canClaim, setCanClaim] = useState(false);
  const {
    claim,
    isLoading: isClaiming,
    isSuccess: isClaimingSuccessful,
  } = useClaim();

  // const { getJackpotById, getFactoryById, getWinnersByJackpotId } =
  //   useJackpots();

  const { game, slots, refresh, clearSlots } = useGame(gameId);

  // const jackpot = getJackpotById(game?.jackpot_id || 0);
  // const factory = getFactoryById(jackpot?.factory_id || 0);

  // const isJackpotOver = Number(jackpot?.end_at) * 1_000 <= Date.now();
  // const isGameOverTime = Number(game?.expires_at) * 1_000 <= Date.now();
  const isOver = game?.over;

  // const onJackpotEvent = useCallback(
  //   (type: string, event: any) => {
  //     // console.log(type, event);
  //     // console.log(typeof event);

  //     switch (type) {
  //       case "NewWinner":
  //         {
  //           const newWinner = event as NewWinner;

  //           if (
  //             newWinner &&
  //             newWinner.has_ended &&
  //             BigInt(newWinner.player) === BigInt(account?.address || 0)
  //           ) {
  //             setCanClaim(true);
  //           }

  //           const controller = findController(newWinner.player);
  //           const username = controller
  //             ? controller.username
  //             : shortAddress(newWinner.player);

  //           if (newWinner.is_equal) {
  //             showJackpotEvent(
  //               "New Winner",
  //               `${username} scored ${newWinner.score}`,
  //               "orange"
  //             );
  //           } else {
  //             showJackpotEvent(
  //               "New Highscore",
  //               `${username} scored ${newWinner.score}`,
  //               "orange"
  //             );
  //           }

  //           if (Number(newWinner.extension_time) > 0) {
  //             const duration = humanDuration(Number(newWinner.extension_time));
  //             showJackpotEvent("Time Extension", `${duration}`);
  //           }
  //         }

  //         break;
  //       case "GameCreated":
  //         {
  //           const gameCreated = event as GameCreated;
  //           const controller = findController(gameCreated.player);
  //           const username = controller
  //             ? controller.username
  //             : shortAddress(gameCreated.player);

  //           if (BigInt(gameCreated.player) !== BigInt(account?.address || 0))
  //             showJackpotEvent(
  //               "New challenger",
  //               `${username} has joined the competition`
  //             );
  //         }
  //         break;
  //     }
  //   },
  //   [account, setCanClaim]
  // );

  // useJackpotEvents(jackpot?.id || 0, onJackpotEvent);

  //
  //
  //

  useEffect(() => {
    if (game?.over) {
      setTimeout(() => {
        playNegative();
      }, 500);
    }
  }, [game]);

  useEffect(() => {
    const initAsync = async () => {
      setIsLoading(true);
      await refresh();
      setIsLoading(false);
    };
    initAsync();
  }, [gameId, refresh]);

  useEffect(() => {
    if (!address || !game) return;
    // const owner = BigInt(game.player) === BigInt(address);
    const owner = true;
    setIsOwner(owner);
  }, [address, game]);

  const setSlot = async (
    slot: number,
    event: React.MouseEvent<HTMLButtonElement>
  ): Promise<boolean> => {
    if (!address) return false;
    setIsLoading(true);
    playPositive();
    setPosition({ x: event.clientX, y: event.clientY });

    try {
      const vrfAddress = getVrfAddress(chain.id);
      const gameAddress = getContractAddress(chain.id, NAMESPACE, "Play");

      const calls = [];
      if (
        [MAINNET_CHAIN_ID, SEPOLIA_CHAIN_ID].includes(
          `0x${chain.id.toString(16)}`
        )
      ) {
        calls.push({
          contractAddress: vrfAddress,
          entrypoint: "request_random",
          calldata: CallData.compile({
            caller: gameAddress,
            source: { type: 0, address: gameAddress },
          }),
        });
      }

      calls.push({
        contractAddress: gameAddress,
        entrypoint: "set_slot",
        calldata: [gameId!, slot.toString()],
      });
      const { receipt } = await execute(calls, (_receipt) => {});

      return true;
    } catch (e) {
      console.log(e);
      refresh();
      setIsLoading(false);
      return false;
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  if (!gameId || !game) {
    return null;
  }

  return (
    <>
      <Container h={["100dvh", "100vh"]} maxW="100vw">
        {isOwner && (
          <ShowReward
            amount={Number(game?.reward)}
            x={position.x}
            y={position.y}
          />
        )}
        <Header />

        <VStack
          h={["calc(100dvh - 120px)", "auto", "full"]}
          justify={["flex-start", "flex-start", "center"]}
          pt={["60px", "60px", "0"]}
          gap={3}
        >
          <VStack gap={["0px", "0.5rem", "1rem"]}>
            {game && (
              <>
                <TimeCountdown
                  fontSize={["16px", "20px", "36px"]}
                  timestampSec={1}
                  gameOver={game?.over}
                />
              </>
            )}
            <Box
              mb={["10px", "20px", "30px"]}
              textStyle={["h-sm", "h-md", "h-lg"]}
              textShadow="2px 2px 0 rgba(0, 0, 0, 0.25)"
              lineHeight="100px"
              color={isOver ? "red" : "inherit"}
              transition="color 3s"
            >
              <NextNumber
                number={Number(game?.next_number)}
                isLoading={isLoading}
              />
            </Box>
          </VStack>
          <Grid
            templateRows={[
              "repeat(10, 1fr)",
              "repeat(10, 1fr)",
              "repeat(5, 1fr)",
            ]}
            autoFlow="column"
            gapX="60px"
            gapY={["4px", "10px", "10px"]}
          >
            <></>
          </Grid>
          <Box
            mt={["15px", "25px", "35px"]}
            // visibility={isOver ? "visible" : "hidden"}
          >
            <HStack h="40px">
              {/* {!isOver && !isJackpotOver && gameFromStore && (
                <HStack gap={3} alignItems="center">
                  <Text w="auto" fontSize="xs">
                    LVL {gameFromStore.level.toString()}
                  </Text>
                  <Text w="auto" fontFamily="Ekamai" fontSize="16px">
                    + {gameFromStore?.reward.toLocaleString()} NUMS
                  </Text>
                </HStack>
              )} */}

              {isOver && !canClaim && (
                <>
                  <Play
                    isAgain
                    factory={undefined}
                    onClick={() => {
                      clearSlots();

                      setIsLoading(true);
                      setCanClaim(false);
                    }}
                    onReady={(gameId) => {
                      navigate(`/${gameId}`);
                    }}
                    h={["calc((100dvh - 300px) / 10)", "40px", "50px"]}
                    fontSize={["22px", "22px", "24px"]}
                    px="10px"
                  />
                </>
              )}

              {/* {(isOver || isGameOverTime) && isJackpotOver && !canClaim && (
                <Button visual="transparent" onClick={() => navigate("/")}>
                  <HomeIcon /> Home
                </Button>
              )} */}

              {isOver && canClaim && !isClaimingSuccessful && (
                // if canClaim, there is only one winner possible so index is 0
                <Button onClick={() => claim(1, [0])}>
                  {isClaiming ? <Spinner /> : "Claim Jackpot!"}
                </Button>
              )}
            </HStack>
          </Box>
        </VStack>

        {canClaim && !isClaimingSuccessful && <Confetti />}
      </Container>
    </>
  );
};

export default Game;
