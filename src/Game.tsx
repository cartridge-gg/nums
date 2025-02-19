import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useSubscription } from "urql";
import { useEffect, useMemo, useState } from "react";
import { isGameOver, isMoveLegal, removeZeros } from "./utils";
import {
  Box,
  Container,
  Grid,
  Stack,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { Button } from "./components/Button";
import { useAccount, useNetwork } from "@starknet-react/core";
import useToast from "./hooks/toast";
import Header from "./components/Header";
import Overlay from "./components/Overlay";
import { HomeIcon } from "./components/icons/Home";
import Play from "./components/Play";
import Slot from "./components/Slot";
import NextNumber from "./components/NextNumber";
import { graphql } from "./graphql/appchain";
import { useAudio } from "./context/audio";
import { hash, num } from "starknet";
import useChain, { APPCHAIN_CHAIN_ID } from "./hooks/chain";
import { ShowReward } from "./components/ShowReward";

const MAX_SLOTS = 20;

const GameQuery = graphql(`
  query GameQuery($gameId: u32) {
    numsGameModels(where: { game_id: $gameId }) {
      edges {
        node {
          player
          min_number
          max_number
          max_slots
          remaining_slots
          next_number
          reward
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
          remaining_slots
          reward
        }
      }
    }
  }
`);

const Game = () => {
  const [slots, setSlots] = useState<number[]>(
    Array.from({ length: MAX_SLOTS }, () => 0),
  );
  const [nextNumber, setNextNumber] = useState<number | null>();
  const [targetSlot, setTargetSlot] = useState<number | null>();
  const [isOver, setIsOver] = useState<boolean>(false);
  const [remaining, setRemaining] = useState<number>(0);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reward, setReward] = useState<number>(0);
  const [level, setLevel] = useState<number>(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { chain } = useNetwork();
  const { open, onOpen, onClose } = useDisclosure();
  const { account } = useAccount();
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { requestAppchain } = useChain();
  const { playPositive, playNegative } = useAudio();

  const { showTxn, showError } = useToast();
  if (!gameId) {
    return <></>;
  }

  const entityId = useMemo(() => {
    if (!account) return;

    return hash.computePoseidonHashOnElements([
      num.toHex(parseInt(gameId)),
      num.toHex(account.address),
    ]);
  }, [account, gameId]);

  const [queryResult, executeQuery] = useQuery({
    query: GameQuery,
    variables: { gameId: parseInt(gameId) },
  });

  const [subscriptionResult] = useSubscription({
    query: GameSubscription,
    pause: !entityId,
    variables: { entityId },
  });

  useEffect(() => {
    const entityUpdated = subscriptionResult.data?.entityUpdated;
    if (entityUpdated) {
      // @ts-ignore
      const next = entityUpdated.models![0]!.next_number as number;
      // @ts-ignore
      const reward = entityUpdated.models![0]!.reward as number;
      // @ts-ignore
      const remaining = entityUpdated.models![0]!.remaining_slots as number;

      const newSlots = [...slots];
      newSlots[targetSlot!] = nextNumber!;
      setSlots(newSlots);

      const isGameFinished = isGameOver(slots, next);
      setIsOver(isGameFinished);
      setNextNumber(next);
      setRemaining(remaining);
      setReward(reward);
      setTimeout(() => setIsLoading(false), 500);
    }
  }, [subscriptionResult, targetSlot]);

  const updateGameState = (
    slots: number[],
    nextNum: number,
    remainingSlots: number,
    reward: number,
  ) => {
    setSlots(slots);
    setNextNumber(nextNum);
    if (remainingSlots !== undefined) {
      setRemaining(remainingSlots);
    }

    const isGameFinished = isGameOver(slots, nextNum);
    setIsOver(isGameFinished);
    setReward(reward);

    if (isOwner && isGameFinished) {
      playNegative();
    }
  };

  useEffect(() => {
    const gamesModel = queryResult.data?.numsGameModels?.edges?.[0]?.node;
    const slotsEdges = queryResult.data?.numsSlotModels?.edges;
    if (!gamesModel || !slotsEdges) {
      return;
    }

    const isOwner =
      (account && gamesModel.player === removeZeros(account.address)) || false;
    setIsOwner(isOwner);

    const newSlots: number[] = Array.from({ length: MAX_SLOTS }, () => 0);
    slotsEdges.forEach((edge: any) => {
      newSlots[edge.node.index] = edge.node.number;
    });

    updateGameState(
      newSlots,
      gamesModel.next_number!,
      gamesModel.remaining_slots!,
      gamesModel.reward!,
    );
    setIsLoading(false);
  }, [queryResult, account]);

  const setSlot = async (
    slot: number,
    event: React.MouseEvent<HTMLButtonElement>,
  ): Promise<boolean> => {
    if (!account) return false;

    setPosition({ x: event.clientX, y: event.clientY });
    setLevel(MAX_SLOTS - remaining + 1);
    playPositive();
    setIsLoading(true);

    try {
      if (chain?.id !== num.toBigInt(APPCHAIN_CHAIN_ID)) {
        requestAppchain();
      }

      const { transaction_hash } = await account.execute([
        // {
        //   contractAddress: import.meta.env.VITE_VRF_CONTRACT,
        //   entrypoint: "request_random",
        //   calldata: CallData.compile({
        //     caller: import.meta.env.VITE_GAME_CONTRACT,
        //     source: { type: 0, address: account.address },
        //   }),
        // },
        {
          contractAddress: import.meta.env.VITE_GAME_CONTRACT,
          entrypoint: "set_slot",
          calldata: [gameId, slot.toString()],
        },
      ]);

      showTxn(transaction_hash, chain?.name);
      setTargetSlot(slot);

      return true;

      // try {
      //   const receipt = await account.waitForTransaction(transaction_hash, {
      //     retryInterval: 500,
      //   });
      //   if (receipt.isSuccess()) {
      //     const insertedEvent = receipt.events.find(
      //       ({ keys }) => keys[0] === hash.getSelectorFromName("EventEmitted"),
      //     );

      //     const index = parseInt(insertedEvent?.data[4]!);
      //     const inserted = parseInt(insertedEvent?.data[5]!);
      //     const next = parseInt(insertedEvent?.data[6]!);
      //     const reward = parseInt(insertedEvent?.data[8]!);

      //     const newSlots = [...slots];
      //     newSlots[index] = inserted;

      //     updateGameState(newSlots, next, remaining - 1, reward);
      //     setIsLoading(false);
      //     return true;
      //   }
      //   throw new Error("transaction error: " + receipt);
      // } catch (e) {
      //   showError(transaction_hash);
      //   throw new Error("transaction error");
      // }
    } catch (e) {
      console.log({ e });
      setIsLoading(false);
      return false;
    }
  };

  const resetGame = () => {
    onClose();
    setSlots([]);
    setIsOver(false);
    executeQuery();
  };

  return (
    <>
      <Container h="100vh" maxW="100vw">
        {isOwner && <ShowReward level={level} x={position.x} y={position.y} />}
        <Header showHome hideChain />
        <Overlay open={open} onClose={onClose}>
          <VStack
            boxSize="full"
            justify="center"
            position="relative"
            pointerEvents="none"
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
                onReady={(gameId) => {
                  navigate(`/${gameId}`);
                  resetGame();
                }}
              />
            </Stack>
          </VStack>
        </Overlay>
        <VStack
          h={["auto", "auto", "full"]}
          justify={["flex-start", "flex-start", "center"]}
          pt={["90px", "90px", "0"]}
        >
          <Text display={["none", "none", "block"]}>Your number is...</Text>
          <Box
            mb={["20px", "20px", "50px"]}
            textStyle={["h-md", "h-md", "h-lg"]}
            textShadow="2px 2px 0 rgba(0, 0, 0, 0.25)"
            lineHeight="100px"
            color={isOver ? "red" : "inherit"}
            transition="color 3s"
            onTransitionEnd={() => {
              if (isOver && isOwner) {
                onOpen();
              }
            }}
          >
            <NextNumber number={nextNumber!} isLoading={isLoading} />
          </Box>
          <Grid
            templateRows={[
              "repeat(10, 1fr)",
              "repeat(10, 1fr)",
              "repeat(5, 1fr)",
            ]}
            autoFlow="column"
            gapX="60px"
            gapY={["10px", "10px", "20px"]}
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
        </VStack>
      </Container>
    </>
  );
};

export default Game;
