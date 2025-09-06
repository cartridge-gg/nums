import { Button, Spinner, VStack, Text, HStack } from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useConnect, useNetwork } from "@starknet-react/core";
import useToast from "../hooks/toast";
import { BigNumberish, num, uint256 } from "starknet";
import { RefreshIcon } from "./icons/Refresh";
import { useAudio } from "@/context/audio";
import { useParams } from "react-router-dom";
import { getContractAddress, getNumsAddress, getVrfAddress } from "@/config";
import { useExecuteCall } from "@/hooks/useExecuteCall";
import { useJackpots } from "@/context/jackpots";
import { useConfig } from "@/context/config";
import { useDojoSdk } from "@/hooks/dojo";
import { ClauseBuilder, ToriiQueryBuilder } from "@dojoengine/sdk";
import { GameCreated } from "@/bindings";

const Play = ({
  isAgain,
  onReady,
  factoryId,
  label,
  ...buttonProps // Add this spread parameter
}: {
  isAgain?: boolean;
  onReady: (gameId: string) => void;
  factoryId: BigNumberish;
  label?: string;
  [key: string]: any;
}) => {
  const { account } = useAccount();
  const { connect, connectors } = useConnect();
  const { chain } = useNetwork();
  const [creating, setCreating] = useState<boolean>(false);
  const { playReplay } = useAudio();
  const { gameId } = useParams();
  const { execute } = useExecuteCall();
  const { config } = useConfig();
  const { sdk } = useDojoSdk();
  const subscriptionRef = useRef<any>(null);

  const gameCreatedQuery = useMemo(() => {
    return new ToriiQueryBuilder()
      .withEntityModels(["nums-GameCreated"])
      .withClause(
        new ClauseBuilder()
          .keys(
            ["nums-GameCreated"],
            [account?.address || "0", undefined],
            "FixedLen"
          )
          .build()
      )
      .includeHashedKeys();
  }, [account]);

  useEffect(() => {
    const initAsync = async () => {
      if (subscriptionRef.current) {
        if (subscriptionRef.current) {
          subscriptionRef.current.cancel();
        }
      }
      const [items, subscription] = await sdk.subscribeEventQuery({
        query: gameCreatedQuery,
        callback: (res) => {
          const gameCreated = res.data![0].models.nums
            .GameCreated as GameCreated;

          onReady(num.toHex(gameCreated.game_id));
        },
      });

      subscriptionRef.current = subscription;
    };

    initAsync();

    // return () => {
    //   if (subscriptionRef.current) {
    //     subscriptionRef.current.cancel();
    //   }
    // };
  }, [gameCreatedQuery]);

  const createGame = async () => {
    if (!account) return;

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
            calldata: [factoryId],
          },
        ],
        (_receipt) => {}
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
          onClick={createGame}
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
