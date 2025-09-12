import { useNavigate, useParams } from "react-router-dom";
import { useSubscription } from "urql";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isGameOver, isMoveLegal, removeZeros } from "../utils";
import {
  Box,
  Container,
  Grid,
  HStack,
  Spacer,
  Spinner,
  Stack,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { Button } from "../components/Button";
import { useAccount, useNetwork } from "@starknet-react/core";
import Header from "../components/Header";
import Play from "../components/Play";
import Slot from "../components/Slot";
import NextNumber from "../components/NextNumber";
import { graphql } from "../graphql/appchain";
import { useAudio } from "../context/audio";
import { hash, num, uint256 } from "starknet";
import { ShowReward } from "../components/ShowReward";
import { graphQlClients } from "../graphql/clients";
import { getContractAddress, getNumsAddress, getVrfAddress } from "../config";
import { useExecuteCall } from "../hooks/useExecuteCall";
import { Footer } from "../components/Footer";
import { useGames } from "../context/game";
import { useJackpots } from "../context/jackpots";
import { TimeCountdown } from "../components/TimeCountdown";
import Confetti from "react-confetti";
import { GameCreated, NewWinner } from "@/bindings";
import { useClaim } from "@/hooks/useClaim";
import { useJackpotEvents } from "@/hooks/useJackpotEvents";
import useToast from "@/hooks/toast";
import { useControllers } from "@/context/controllers";
import { shortAddress } from "@/utils/address";
import { humanDuration } from "@/utils/duration";
import { HomeIcon } from "@/components/icons/Home";

const MAX_SLOTS = 20;

const GameQuery = graphql(`
  query GameQuery($gameId: u32) {
    numsGameModels(where: { game_id: $gameId }) {
      edges {
        node {
          player
          game_id
          level
          next_number
          reward
          jackpot_id
          expires_at
          game_over
        }
      }
    }
    numsSlotModels(
      where: { game_id: $gameId }
      order: { direction: ASC, field: NUMBER }
      limit: 20
    ) {
      edges {
        node {
          index
          number
        }
      }
    }
  }
`);

const GameSubscription = graphql(`
  subscription GameSubscription($entityId: felt252) {
    entityUpdated(id: $entityId) {
      models {
        ... on nums_Game {
          next_number
          level
          reward
        }
      }
    }
  }
`);

const Game = () => {
  const [slots, setSlots] = useState<number[]>(
    Array.from({ length: MAX_SLOTS }, () => 0)
  );
  const [nextNumber, setNextNumber] = useState<number | null>();
  const [isOver, setIsOver] = useState<boolean>(false);
  const [remaining, setRemaining] = useState<number>(0);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [player, setPlayer] = useState<string | null>(null);
  const [reward, setReward] = useState<number>(0);
  const [level, setLevel] = useState<number>(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { chain } = useNetwork();
  const { open, onOpen, onClose } = useDisclosure();
  const { account, address } = useAccount();
  const { gameId } = useParams();
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { playPositive, playNegative } = useAudio();
  const [game, setGame] = useState<any>();
  const { execute } = useExecuteCall();
  const { showMessage, showJackpotEvent } = useToast();
  const { findController } = useControllers();

  const [canClaim, setCanClaim] = useState(false);
  const {
    claim,
    isLoading: isClaiming,
    isSuccess: isClaimingSuccessful,
  } = useClaim();

  const { getJackpotById, getFactoryById, getWinnersByJackpotId } =
    useJackpots();
  const { getGameById } = useGames();

  const gameFromStore = getGameById(Number(gameId!));

  const jackpot = getJackpotById(gameFromStore?.jackpot_id || 0);
  const factory = getFactoryById(jackpot?.factory_id || 0);
  const winners = getWinnersByJackpotId(gameFromStore?.jackpot_id || 0);

  const isJackpotOver = Number(jackpot?.end_at) * 1_000 <= Date.now();
  const isGameOverTime = Number(game?.expires_at) * 1_000 <= Date.now();

  const onJackpotEvent = useCallback(
    (type: string, event: any) => {
      // console.log(type, event);
      // console.log(typeof event);

      switch (type) {
        case "NewWinner":
          {
            const newWinner = event as NewWinner;

            if (
              newWinner &&
              newWinner.has_ended &&
              BigInt(newWinner.player) === BigInt(account?.address || 0)
            ) {
              setCanClaim(true);
            }

            const controller = findController(newWinner.player);
            const username = controller
              ? controller.username
              : shortAddress(newWinner.player);

            if (newWinner.is_equal) {
              showJackpotEvent(
                "New Winner",
                `${username} scored ${newWinner.score}`,
                "orange"
              );
            } else {
              showJackpotEvent(
                "New Highscore",
                `${username} scored ${newWinner.score}`,
                "orange"
              );
            }

            if (Number(newWinner.extension_time) > 0) {
              const duration = humanDuration(Number(newWinner.extension_time));
              showJackpotEvent("Time Extension", `${duration}`);
            }
          }

          break;
        case "GameCreated":
          {
            const gameCreated = event as GameCreated;
            const controller = findController(gameCreated.player);
            const username = controller
              ? controller.username
              : shortAddress(gameCreated.player);

            if (BigInt(gameCreated.player) !== BigInt(account?.address || 0))
              showJackpotEvent(
                "New challenger",
                `${username} has joined the competition`
              );
          }
          break;
      }
    },
    [account, setCanClaim]
  );

  useJackpotEvents(jackpot?.id || 0, onJackpotEvent);

  //
  //
  //

  const entityId = useMemo(() => {
    if (!address || !gameId) return;
    const entityId = hash.computePoseidonHashOnElements([
      num.toHex(parseInt(gameId)),
      num.toHex(address),
    ]);

    return entityId;
  }, [address, gameId]);

  const [subscriptionResult] = useSubscription({
    query: GameSubscription,
    variables: { entityId },
    pause: !entityId,
  });

  const queryGame = useCallback(
    (gameId: number) => {
      graphQlClients[num.toHex(chain.id)]
        .query(GameQuery, { gameId }, { requestPolicy: "network-only" })
        .toPromise()
        .then((res) => {
          const gameModel = res.data?.numsGameModels?.edges?.[0]?.node;
          const slotsEdges = res.data?.numsSlotModels?.edges;
          if (!gameModel || !slotsEdges) {
            return;
          }

          setGame(gameModel);
          setPlayer(gameModel.player);

          const newSlots: number[] = Array.from({ length: MAX_SLOTS }, () => 0);
          slotsEdges.forEach((edge: any) => {
            newSlots[edge.node.index] = edge.node.number;
          });
          setSlots(newSlots);

          if (isGameOver(newSlots, gameModel.next_number!)) {
            setIsOver(true);

            if (isOwner) {
              playNegative();
              // setTimeout(() => onOpen(), 3000);
            }
          }

          updateGameState(
            newSlots,
            gameModel.next_number!,
            gameModel.level! as number,
            gameModel.reward!
          );
          setIsLoading(false);
        });
    },
    [isOwner]
  );

  useEffect(() => queryGame(parseInt(gameId!)), []);

  useEffect(() => {
    if (!address || !player) return;
    const owner = address && player === removeZeros(address);
    setIsOwner(owner);
  }, [address, player]);

  useEffect(() => {
    const entityUpdated = subscriptionResult.data?.entityUpdated;
    if (entityUpdated) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }

      // @ts-ignore
      const next = entityUpdated.models![0]!.next_number as number;
      // @ts-ignore
      const reward = entityUpdated.models![0]!.reward as number;
      // @ts-ignore
      const level = entityUpdated.models![0]!.level as number;

      updateGameState(slots, next, level, reward);
    }
  }, [subscriptionResult]);

  const updateGameState = useCallback(
    (slots: number[], nextNum: number, level: number, reward: number) => {
      if (isGameOver(slots, nextNum)) {
        setIsOver(true);

        if (isOwner) {
          playNegative();
          setTimeout(() => onOpen(), 3000);
        }
      }

      setReward(reward);
      setNextNumber(nextNum);
      if (level !== undefined) {
        setLevel(level);
        setRemaining(Number(factory?.game_config.max_slots) - level);
      }

      setTimeout(() => setIsLoading(false), 500);
    },
    [isOwner, factory]
  );

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
      const gameAddress = getContractAddress(chain.id, "nums", "game_actions");
      const { receipt } = await execute(
        [
          // {
          //   contractAddress: vrfAddress,
          //   entrypoint: "request_random",
          //   calldata: CallData.compile({
          //     caller: gameAddress,
          //     source: { type: 0, address: account!.address },
          //   }),
          // },

          {
            contractAddress: gameAddress,
            entrypoint: "set_slot",
            calldata: [gameId!, slot.toString()],
          },
        ],
        (_receipt) => {}
      );

      const newSlots = [...slots];
      newSlots[slot] = nextNumber!;
      setSlots(newSlots);

      // Set timeout to query game if subscription doesn't respond
      const timeout = setTimeout(() => {
        queryGame(parseInt(gameId!));
      }, 2000);
      setTimeoutId(timeout);

      return true;
    } catch (e) {
      console.log({ e });
      setIsLoading(false);
      return false;
    }
  };

  if (!gameId || !jackpot || !factory) {
    return null;
  }

  return (
    <>
      <Container h={["100dvh", "100vh"]} maxW="100vw">
        {isOwner && (
          <ShowReward
            amount={Number(factory.rewards[level - 1])}
            x={position.x}
            y={position.y}
          />
        )}
        <Header />

        {/* <Overlay open={true} onClose={onClose}>
           <VStack
            boxSize="full"
            justify="center"
            position="relative"
            pointerEvents="none"
            p="20px"
          >
            <Text fontFamily="Ekamai" fontSize="64px" fontWeight="400">
              Game Over
            </Text>
            <Stack
              w={["full", "full", "400px"]}
              direction={["column", "row", "row"]}
            >
              <VStack layerStyle="transparent" flex="1" align="flex-start">
                <Text color="purple.50">Score</Text>
                <Text>{MAX_SLOTS - remaining}</Text>
              </VStack>
              <VStack layerStyle="transparent" flex="1" align="flex-start">
                <Text color="purple.50">Nums Rewarded</Text>
                <Text>{reward.toLocaleString()}</Text>
              </VStack>
            </Stack>
            <Stack
              pt="32px"
              direction={["column", "row", "row"]}
              w={["full", "full", "400px"]}
              justify="center"
              pointerEvents="auto"
            >
              <Button visual="transparent" onClick={() => navigate("/")}>
                <HomeIcon /> Home
              </Button>
              <Play
                isAgain
                jackpotId={jackpot?.id}
                onReady={(gameId) => {
                  queryGame(parseInt(gameId));
                  setSlots(Array.from({ length: MAX_SLOTS }, () => 0));
                  setNextNumber(null);
                  setRemaining(0);
                  setReward(0);
                  setIsOver(false);
                  setIsLoading(true);
                  onClose();
                  navigate(`/${gameId}`);
                }}
              />
            </Stack>
          </VStack>
        </Overlay>
 */}
        <VStack
          h={["calc(100dvh - 120px)", "auto", "full"]}
          justify={["flex-start", "flex-start", "center"]}
          pt={["60px", "60px", "0"]}
          gap={3}
        >
          <VStack gap={["0px", "0.5rem", "1rem"]}>
            {/* <Text display={["none", "none", "block"]}>Your number is...</Text> */}
            {game && (
              <>
                <TimeCountdown
                  fontSize={["16px", "20px", "36px"]}
                  timestampSec={gameFromStore?.expires_at || 0}
                  gameOver={gameFromStore?.game_over}
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
              <NextNumber number={nextNumber!} isLoading={isLoading} />
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
            {slots.map((number, index) => {
              const legal = isMoveLegal(slots, nextNumber!, index);
              return (
                <Slot
                  key={index}
                  index={index}
                  number={number}
                  nextNumber={nextNumber}
                  isOwner={isOwner}
                  disable={isLoading}
                  legal={legal}
                  onClick={(slot, event) => setSlot(slot, event)}
                />
              );
            })}
          </Grid>
          <Box
            mt={["0", "10px", "20px"]}
            // visibility={isOver ? "visible" : "hidden"}
          >
            <VStack h="40px">
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

              {(isOver || isGameOverTime) && !isJackpotOver && !canClaim && (
                <Play
                  isAgain
                  factory={factory}
                  onReady={(gameId) => {
                    queryGame(parseInt(gameId));
                    setSlots(Array.from({ length: MAX_SLOTS }, () => 0));
                    setNextNumber(null);
                    setRemaining(0);
                    setReward(0);
                    setIsOver(false);
                    setIsLoading(true);
                    setCanClaim(false);
                    onClose();
                    navigate(`/${gameId}`);
                  }}
                />
              )}

              {(isOver || isGameOverTime) && isJackpotOver && !canClaim && (
                <Button visual="transparent" onClick={() => navigate("/")}>
                  <HomeIcon /> Home
                </Button>
              )}

              {isOver && canClaim && !isClaimingSuccessful && (
                // if canClaim, there is only one winner possible so index is 0
                <Button onClick={() => claim(jackpot.id, [0])}>
                  {isClaiming ? <Spinner /> : "Claim Jackpot!"}
                </Button>
              )}
            </VStack>
          </Box>
        </VStack>
        <Footer game={gameFromStore} jackpot={jackpot} />

        {canClaim && !isClaimingSuccessful && <Confetti />}
      </Container>
    </>
  );
};

export default Game;
