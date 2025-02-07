import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "urql";
import { useEffect, useState } from "react";
import { isGameOver, isMoveLegal, removeZeros } from "./utils";
import {
  Box,
  Container,
  Grid,
  HStack,
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

const Game = () => {
  const [slots, setSlots] = useState<number[]>(
    Array.from({ length: MAX_SLOTS }, () => 0),
  );
  const [nextNumber, setNextNumber] = useState<number | null>();
  const [isOver, setIsOver] = useState<boolean>(false);
  const [remaining, setRemaining] = useState<number>(0);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reward, setReward] = useState<number>(0);
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

  const [queryResult, executeQuery] = useQuery({
    query: GameQuery,
    variables: { gameId: parseInt(gameId) },
    requestPolicy: "cache-and-network",
  });

  const updateGameState = (
    slots: number[],
    nextNum: number,
    remainingSlots: number,
  ) => {
    setSlots(slots);
    setNextNumber(nextNum);
    if (remainingSlots !== undefined) {
      setRemaining(remainingSlots);
    }

    const isGameFinished = isGameOver(slots, nextNum);
    setIsOver(isGameFinished);

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
    setReward(gamesModel.reward as number);

    const newSlots: number[] = Array.from({ length: MAX_SLOTS }, () => 0);
    slotsEdges.forEach((edge: any) => {
      newSlots[edge.node.index] = edge.node.number;
    });

    updateGameState(
      newSlots,
      gamesModel.next_number!,
      gamesModel.remaining_slots!,
    );
    setIsLoading(false);
  }, [queryResult, account, playNegative, onOpen]);

  const setSlot = async (slot: number): Promise<boolean> => {
    if (!account) return false;

    if (!isMoveLegal(slots, nextNumber!, slot)) {
      playNegative();
      return false;
    }

    playPositive();
    try {
      setIsLoading(true);

      if (chain?.id !== num.toBigInt(APPCHAIN_CHAIN_ID)) {
        requestAppchain();
      }

      const { transaction_hash } = await account.execute([
        {
          contractAddress: import.meta.env.VITE_GAME_CONTRACT,
          entrypoint: "set_slot",
          calldata: [gameId, slot.toString()],
        },
      ]);

      showTxn(transaction_hash, chain?.name);

      try {
        const receipt = await account.waitForTransaction(transaction_hash, {
          retryInterval: 500,
        });
        if (receipt.isSuccess()) {
          const insertedEvent = receipt.events.find(
            ({ keys }) => keys[0] === hash.getSelectorFromName("EventEmitted"),
          );

          const index = parseInt(insertedEvent?.data[4]!);
          const inserted = parseInt(insertedEvent?.data[5]!);
          const next = parseInt(insertedEvent?.data[6]!);

          const newSlots = [...slots];
          newSlots[index] = inserted;

          updateGameState(newSlots, next, remaining - 1);
          setIsLoading(false);
          return true;
        }
        throw new Error("transaction error: " + receipt);
      } catch (e) {
        showError(transaction_hash);
        throw new Error("transaction error");
      }
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
        <Header showHome hideChain />
        <Overlay open={open} onClose={onClose}>
          <VStack boxSize="full" justify="center">
            <Text fontFamily="Ekamai" fontSize="64px" fontWeight="400">
              Game Over
            </Text>
            <HStack w={["300px", "300px", "400px"]}>
              <VStack layerStyle="transparent" flex="1" align="flex-start">
                <Text color="purple.50">Score</Text>
                <Text>{MAX_SLOTS - remaining}</Text>
              </VStack>
              <VStack layerStyle="transparent" flex="1" align="flex-start">
                <Text color="purple.50">Nums Rewarded</Text>
                <Text>{reward.toLocaleString()}</Text>
              </VStack>
            </HStack>
            <HStack pt="32px">
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
            </HStack>
          </VStack>
        </Overlay>
        <VStack
          h={["auto", "auto", "full"]}
          justify={["flex-start", "flex-start", "center"]}
          pt={["100px", "100px", "0"]}
        >
          <Text display={["none", "none", "block"]}>The next number is...</Text>
          <Box
            mb={["25px", "25px", "50px"]}
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
                  onClick={(slot) => setSlot(slot)}
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
