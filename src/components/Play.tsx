import { Button, Spinner } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useConnect, useNetwork } from "@starknet-react/core";
import useToast from "../hooks/toast";
import { hash, num } from "starknet";
import { RefreshIcon } from "./icons/Refresh";
import { useAudio } from "@/context/audio";
import useChain from "@/hooks/chain";
import { graphql } from "@/graphql/appchain";
import { useSubscription } from "urql";
import { graphQlClients } from "@/graphql/clients";
import { useParams } from "react-router-dom";
import { getContractAddress, getVrfAddress } from "@/config";

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
  ...buttonProps // Add this spread parameter
}: {
  isAgain?: boolean;
  onReady: (gameId: string) => void;
  [key: string]: any;
}) => {
  const { account } = useAccount();
  const { connect, connectors } = useConnect();
  const { chain } = useNetwork();
  const { showTxn } = useToast();
  const [creating, setCreating] = useState<boolean>(false);
  const { requestAppchain } = useChain();
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

  const newGame = async () => {
    if (!account) return;

    try {
      setCreating(true);
      playReplay();

      const vrfAddress = getVrfAddress(chain.id);
      const gameAddress = getContractAddress(chain.id, "nums", "game_actions");
      const { transaction_hash } = await account.execute([
        // {
        //   contractAddress: vrfAddress,
        //   entrypoint: "request_random",
        //   calldata: CallData.compile({
        //     caller: gameAddress,
        //     source: { type: 0, address: account.address },
        //   }),
        // },
        {
          contractAddress: gameAddress,
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
        <Button
          onClick={newGame}
          disabled={creating}
          minW="150px"
          {...buttonProps}
        >
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
