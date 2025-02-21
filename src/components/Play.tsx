import { Button, Spinner } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useConnect, useNetwork } from "@starknet-react/core";
import useToast from "../hooks/toast";
import { CallData, hash, num } from "starknet";
import { RefreshIcon } from "./icons/Refresh";
import { useAudio } from "@/context/audio";
import { graphql } from "@/graphql/appchain";
import { useSubscription } from "urql";
import { AppchainClient } from "@/graphql/clients";
import { useParams } from "react-router-dom";

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
}: {
  isAgain?: boolean;
  onReady: (gameId: string) => void;
}) => {
  const { account } = useAccount();
  const { connect, connectors } = useConnect();
  const { chain } = useNetwork();
  const { showTxn } = useToast();
  const [creating, setCreating] = useState<boolean>(false);;
  const { playReplay } = useAudio();
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  const { gameId } = useParams();

  const entityId = useMemo(() => {
    if (!account) return;
    const entityId = hash.computePoseidonHashOnElements([
      num.toHex(account.address),
    ]);

    return entityId;
  }, [account]);

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

      const gameId =
        // @ts-ignore
        subscriptionResult.data.eventMessageUpdated.models![0]!.game_id;
      onReady(num.toHex(gameId));
      setCreating(false);
    }
  }, [subscriptionResult.data]);

  const queryEvent = useCallback((entityId: string) => {
    AppchainClient.query(
      GameEventQuery,
      { entityId },
      { requestPolicy: "network-only" },
    )
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

  const newGame = async () => {
    if (!account) return;

    try {
      // if (chain?.id !== num.toBigInt(APPCHAIN_CHAIN_ID)) {
      //   requestAppchain();
      // }

      setCreating(true);
      playReplay();
      const { transaction_hash } = await account.execute([
        {
          contractAddress: import.meta.env.VITE_VRF_CONTRACT,
          entrypoint: "request_random",
          calldata: CallData.compile({
            caller: import.meta.env.VITE_GAME_CONTRACT,
            source: { type: 0, address: account.address },
          }),
        },
        {
          contractAddress: import.meta.env.VITE_GAME_CONTRACT,
          entrypoint: "create_game",
          calldata: [1], // no jackpot yet
        },
      ]);

      showTxn(transaction_hash, chain?.name);

      // Set timeout to query game if subscription doesn't respond
      const timeout = setTimeout(() => {
        queryEvent(entityId!);
      }, 2000);
      setTimeoutId(timeout);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {account ? (
        <Button onClick={newGame} disabled={creating} minW="150px">
          {creating ? (
            <Spinner />
          ) : isAgain ? (
            <>
              <RefreshIcon /> Play Again
            </>
          ) : (
            "Play!"
          )}
        </Button>
      ) : (
        <Button onClick={() => connect({ connector: connectors[0] })}>
          Connect
        </Button>
      )}
    </>
  );
};

export default Play;
