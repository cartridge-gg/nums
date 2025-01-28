import { useNavigate, useParams } from "react-router-dom";
import { graphql } from "./graphql";
import { useQuery } from "urql";
import { useEffect, useState } from "react";
import { isGameOver, removeZeros } from "./utils";
import { useInterval } from "usehooks-ts";
import { Container, Grid, HStack, Text, VStack } from "@chakra-ui/react";
import { Button } from "./components/Button";
import { useAccount } from "@starknet-react/core";
import useToast from "./hooks/toast";
import { Toaster } from "@/components/ui/toaster";
import Header from "./components/Header";
import Overlay from "./components/Overlay";
import { HomeIcon } from "./components/icons/Home";
import Play from "./components/Play";
import Slot from "./components/Slot";

const REFRESH_INTERVAL = 1000;
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
  const [numRange, setNumRange] = useState<string>();
  const [reward, setReward] = useState<number>(0);
  const { account } = useAccount();
  const { gameId } = useParams();
  const navigate = useNavigate();

  const { showTxn, showError } = useToast();
  if (!gameId) {
    return <></>;
  }

  const [queryResult, reexecuteQuery] = useQuery({
    query: GameQuery,
    variables: { gameId: parseInt(gameId) },
    requestPolicy: isOwner ? "network-only" : "cache-and-network",
  });

  useInterval(() => {
    isLoading && reexecuteQuery();
  }, REFRESH_INTERVAL);

  useEffect(() => {
    const gamesModel = queryResult.data?.numsGameModels?.edges?.[0]?.node;
    const slotsEdges = queryResult.data?.numsSlotModels?.edges;
    if (!gamesModel || !slotsEdges) {
      return;
    }

    setIsOwner(
      (account && gamesModel.player === removeZeros(account.address)) || false,
    );

    // update if game progressed
    if (slotsEdges.length === gamesModel.max_slots! - remaining) {
      return;
    }

    setRemaining(gamesModel.remaining_slots || 0);
    setNextNumber(gamesModel.next_number);
    setNumRange(gamesModel.min_number + " - " + gamesModel.max_number);
    setReward(gamesModel.reward as number);
    const newSlots: number[] = Array.from({ length: MAX_SLOTS }, () => 0);
    slotsEdges.forEach((edge: any) => {
      newSlots[edge.node.index] = edge.node.number;
    });

    setSlots(newSlots);
    setIsOver(isGameOver(newSlots, gamesModel.next_number!));

    setIsLoading(false);
  }, [queryResult, account]);

  const setSlot = async (slot: number): Promise<boolean> => {
    if (!account) return false;
    try {
      setIsLoading(true);
      const { transaction_hash } = await account.execute([
        // {
        //   contractAddress: import.meta.env.VITE_VRF_CONTRACT,
        //   entrypoint: 'request_random',
        //   calldata: CallData.compile({
        //     caller: import.meta.env.VITE_GAME_CONTRACT,
        //     source: {source_type: 0, address: account.address}
        //   })
        // },
        {
          contractAddress: import.meta.env.VITE_GAME_CONTRACT,
          entrypoint: "set_slot",
          calldata: [gameId, slot.toString()],
        },
      ]);

      showTxn(transaction_hash);

      try {
        // catch any txn errors (nonce err, etc) and reset state
        await account.waitForTransaction(transaction_hash);
      } catch (e) {
        showError(transaction_hash);
        throw new Error("transaction error");
      }
    } catch (e) {
      console.log({ e });
      setIsLoading(false);
      return false;
    }

    return true;
  };

  const resetGame = () => {
    setSlots(Array.from({ length: MAX_SLOTS }));
    setIsOver(false);
    reexecuteQuery();
  };

  return (
    <>
      <Toaster />
      <Container h="100vh" maxW="100vw">
        <Header showHome hideChain />
        <Overlay show={isOwner && isOver}>
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
              <Text>{reward}</Text>
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
        </Overlay>
        <VStack
          h={["auto", "auto", "100%"]}
          justify={["none", "none", "center"]}
        >
          <Text>The Number is...</Text>
          <Text textStyle="huge" textShadow="2px 2px 0 rgba(0, 0, 0, 0.25)">
            {nextNumber}
          </Text>
          <VStack gap="40px">
            <Grid
              templateRows="repeat(5, 1fr)"
              autoFlow="column"
              gapX="60px"
              gapY="20px"
            >
              {slots.map((number, index) => {
                return (
                  <Slot
                    key={index}
                    index={index}
                    number={number}
                    nextNumber={nextNumber}
                    isOwner={isOwner}
                    disable={isLoading}
                    onClick={(slot) => setSlot(slot)}
                  />
                );
              })}
            </Grid>
            <HStack w="full">
              <VStack layerStyle="transparent" flex="1" align="flex-start">
                <Text color="purple.50">Number Ranger</Text>
                <Text>{numRange}</Text>
              </VStack>
              <VStack layerStyle="transparent" flex="1" align="flex-start">
                <Text color="purple.50">Remaining Slots</Text>
                <Text>{remaining}</Text>
              </VStack>
            </HStack>
          </VStack>
        </VStack>
      </Container>
    </>
  );
};

export default Game;
