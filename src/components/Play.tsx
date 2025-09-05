import { Button, Spinner, VStack, Text, HStack } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useConnect, useNetwork } from "@starknet-react/core";
import useToast from "../hooks/toast";
import { BigNumberish, CallData, hash, num, uint256 } from "starknet";
import { RefreshIcon } from "./icons/Refresh";
import { useAudio } from "@/context/audio";
import useChain from "@/hooks/chain";
import { graphql } from "@/graphql/appchain";
import { useSubscription } from "urql";
import { graphQlClients } from "@/graphql/clients";
import { useParams } from "react-router-dom";
import {
  chainName,
  getContractAddress,
  getNumsAddress,
  getVrfAddress,
} from "@/config";
import { useExecuteCall } from "@/hooks/useExecuteCall";
import { useJackpots } from "@/context/jackpots";
import { useConfig } from "@/context/config";

const GameEventQuery = graphql(`
  query GameEventQuery($entityId: felt252) {
    eventMessage(id: $entityId) {
      models {
        ... on nums_GameCreated {
          game_id
        }
      }
    }
  }
`);

const GameCreatedEvent = graphql(`
  subscription GameCreatedEvent($entityId: felt252) {
    eventMessageUpdated(id: $entityId) {
      models {
        __typename
        ... on nums_GameCreated {
          game_id
        }
      }
    }
  }
`);

const Play = ({
  isAgain,
  onReady,
  jackpotId,
  label,
  ...buttonProps // Add this spread parameter
}: {
  isAgain?: boolean;
  onReady: (gameId: string) => void;
  jackpotId?: BigNumberish;
  label?: string;
  [key: string]: any;
}) => {
  const { account } = useAccount();
  const { connect, connectors } = useConnect();
  const { chain } = useNetwork();
  const { showTxn } = useToast();
  const [creating, setCreating] = useState<boolean>(false);
  const { playReplay } = useAudio();
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  const { gameId } = useParams();
  const { execute } = useExecuteCall();
  const { jackpots } = useJackpots();
  const { config } = useConfig();

  const latestJackpot = useMemo(() => {
    if (!jackpots || jackpots.length === 0) return undefined;
    return jackpots.sort((a, b) => Number(b.id) - Number(a.id))[0];
  }, [jackpots]);

  const selectedJackpotId = useMemo(() => {
    return (jackpotId ? Number(jackpotId) : latestJackpot?.id) || 0;
  }, [latestJackpot, jackpotId]);

  const entityId = useMemo(() => {
    if (!account) return;
    const entityId = hash.computePoseidonHashOnElements([
      num.toHex(account.address),
      num.toHex(selectedJackpotId),
    ]);

    return entityId;
  }, [account, selectedJackpotId]);

  const [subscriptionResult] = useSubscription({
    query: GameCreatedEvent,
    variables: { entityId },
    pause: !entityId,
  });

  useEffect(() => {
    if (subscriptionResult.data?.eventMessageUpdated) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }

      // @ts-ignore
      const gameId = subscriptionResult.data.eventMessageUpdated.models!.find(
        (i) => i!.__typename === "nums_GameCreated"
      )!.game_id!;
      onReady(num.toHex(gameId));
      setCreating(false);
    }
  }, [subscriptionResult.data]);

  const queryEvent = useCallback((entityId: string) => {
    graphQlClients[num.toHex(chain.id)]
      .query(GameEventQuery, { entityId }, { requestPolicy: "network-only" })
      .toPromise()
      .then((res) => {
        // @ts-ignore
        const newGameId = res.data?.eventMessage.models![0]!.game_id;
        if (newGameId !== gameId) {
          onReady(num.toHex(newGameId));
          setCreating(false);
        }
      });
  }, []);

  // console.log("latestJackpot",latestJackpot)

  const newGame = async () => {
    if (!account) return;
    if (!latestJackpot) {
      alert("not jackpot found");
      return;
    }

    try {
      setCreating(true);
      playReplay();

      const vrfAddress = getVrfAddress(chain.id);
      const numsAddress = getNumsAddress(chain.id);
      const gameAddress = getContractAddress(chain.id, "nums", "game_actions");

      const { receipt } = await execute(
        [
          // {
          //   contractAddress: vrfAddress,
          //   entrypoint: "request_random",
          //   calldata: CallData.compile({
          //     caller: gameAddress,
          //     source: { type: 0, address: account.address },
          //   }),
          // },
          {
            contractAddress: numsAddress,
            entrypoint: "approve",
            calldata: [gameAddress, uint256.bnToUint256(1_000n * 10n ** 18n)],
          },
          {
            contractAddress: gameAddress,
            entrypoint: "create_game",
            calldata: [selectedJackpotId],
          },
        ],
        (_receipt) => {
          // showTxn(r, chain?.name);
          // Set timeout to query game if subscription doesn't respond
          // const timeout = setTimeout(() => {
          //   queryEvent(entityId!);
          // }, 2000);
          // setTimeoutId(timeout);
        }
      );
      setCreating(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {account ? (
        <Button
          onClick={newGame}
          disabled={creating}
          minW="150px"
          {...buttonProps}
        >
          <VStack alignItems="center" gap={0}>
            <HStack>
              {creating ? (
                <Spinner />
              ) : isAgain ? (
                <>
                  <RefreshIcon /> Play Again
                </>
              ) : label ? (
                <>{label}</>
              ) : (
                "Play!"
              )}
            </HStack>
            <Text fontSize="12px">
              {config?.game.entry_cost.toLocaleString()} NMUS
            </Text>
          </VStack>
        </Button>
      ) : (
        <Button
          onClick={() => {
            connect({ connector: connectors[0] });
          }}
          {...buttonProps}
        >
          Connect
        </Button>
      )}
    </>
  );
};

export default Play;
