import { useNavigate, useParams } from "react-router-dom";
import { useSubscription } from "urql";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import useChain from "./hooks/chain";
import { ShowReward } from "./components/ShowReward";
import { graphQlClients } from "./graphql/clients";
import { getContractAddress, getVrfAddress } from "./config";

const MAX_SLOTS = 20;

const GameQuery = graphql(`
  query GameQuery($gameId: u32) {
    numsGameModels(where: { game_id: $gameId }) {
      edges {
        node {
          player
          game_id
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
  const { requestAppchain } = useChain();
  const { playPositive, playNegative } = useAudio();

  const { showTxn } = useToast();
  if (!gameId) {
    return <></>;
  }

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
          const gamesModel = res.data?.numsGameModels?.edges?.[0]?.node;
          const slotsEdges = res.data?.numsSlotModels?.edges;
          if (!gamesModel || !slotsEdges) {
            return;
          }

          setPlayer(gamesModel.player);

          const newSlots: number[] = Array.from({ length: MAX_SLOTS }, () => 0);
          slotsEdges.forEach((edge: any) => {
            newSlots[edge.node.index] = edge.node.number;
          });
          setSlots(newSlots);

          if (isGameOver(newSlots, gamesModel.next_number!)) {
            setIsOver(true);

            if (isOwner) {
              playNegative();
              setTimeout(() => onOpen(), 3000);
            }
          }

          updateGameState(
            newSlots,
            gamesModel.next_number!,
            gamesModel.remaining_slots!,
            gamesModel.reward!
          );
          setIsLoading(false);
        });
    },
    [isOwner]
  );

  useEffect(() => queryGame(parseInt(gameId)), []);

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
      const remaining = entityUpdated.models![0]!.remaining_slots as number;

      updateGameState(slots, next, remaining, reward);
    }
  }, [subscriptionResult]);

  const updateGameState = useCallback(
    (
      slots: number[],
      nextNum: number,
      remainingSlots: number,
      reward: number
    ) => {
      if (isGameOver(slots, nextNum)) {
        setIsOver(true);

        if (isOwner) {
          playNegative();
          setTimeout(() => onOpen(), 3000);
        }
      }

      setReward(reward);
      setNextNumber(nextNum);
      if (remainingSlots !== undefined) {
        setRemaining(remainingSlots);
      }

      setTimeout(() => setIsLoading(false), 500);
    },
    [isOwner]
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
      const { transaction_hash } = await account!.execute([
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
          calldata: [gameId, slot.toString()],
        },
      ]);
      showTxn(transaction_hash, chain?.name);
      setLevel(MAX_SLOTS - remaining + 1);

      const newSlots = [...slots];
      newSlots[slot] = nextNumber!;
      setSlots(newSlots);

      // Set timeout to query game if subscription doesn't respond
      const timeout = setTimeout(() => {
        queryGame(parseInt(gameId));
      }, 2000);
      setTimeoutId(timeout);

      return true;
    } catch (e) {
      console.log({ e });
      setIsLoading(false);
      return false;
    }
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
