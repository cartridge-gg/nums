import { Button, Spinner, VStack, Text, HStack, Box } from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useConnect, useNetwork } from "@starknet-react/core";
import { Call, CallData, num, uint256 } from "starknet";
import { RefreshIcon } from "./icons/Refresh";
import { useAudio } from "@/context/audio";
import { useParams } from "react-router-dom";
import {
  getContractAddress,
  getNumsAddress,
  getVrfAddress,
  MAINNET_CHAIN_ID,
  SEPOLIA_CHAIN_ID,
} from "@/config";
import { useExecuteCall } from "@/hooks/useExecuteCall";
import { useDojoSdk } from "@/hooks/dojo";
import { JackpotFactory } from "@/bindings";

const Play = ({
  isAgain,
  onReady,
  factory,
  label,
  ...buttonProps // Add this spread parameter
}: {
  isAgain?: boolean;
  onReady: (gameId: string) => void;
  factory: JackpotFactory;
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
  const { sdk } = useDojoSdk();

  // const subscriptionRef = useRef<any>(null);
  // const gameCreatedQuery = useMemo(() => {
  //   if (!account) return undefined;

  //   return new ToriiQueryBuilder()
  //     .withEntityModels(["nums-GameCreated"])
  //     .withClause(
  //       new ClauseBuilder()
  //         .keys(
  //           ["nums-GameCreated"],
  //           [num.toHex64(account.address), undefined],
  //           "FixedLen"
  //         )
  //         .build()
  //     )
  //     .includeHashedKeys();
  // }, [account]);

  // useEffect(() => {
  //   const initAsync = async () => {
  //     if (subscriptionRef.current) {
  //       if (subscriptionRef.current) {
  //         subscriptionRef.current.cancel();
  //       }
  //     }
  //     const [items, subscription] = await sdk.subscribeEventQuery({
  //       query: gameCreatedQuery!,
  //       callback: (res) => {
  //         const gameCreated = res.data![0].models.nums
  //           .GameCreated as GameCreated;

  //         if (BigInt(gameCreated.player) === BigInt(account?.address || 0)) {
  //           console.log("onReady subs");
  //           onReady(num.toHex(gameCreated.game_id));
  //         }
  //       },
  //     });

  //     subscriptionRef.current = subscription;
  //   };

  //   if (account && gameCreatedQuery) {
  //     initAsync();
  //   }

  //   // return () => {
  //   //   if (subscriptionRef.current) {
  //   //     subscriptionRef.current.cancel();
  //   //   }
  //   // };
  // }, [gameCreatedQuery, account]);

  const createGame = async () => {
    if (!account) return;

    try {
      setCreating(true);
      playReplay();

      const vrfAddress = getVrfAddress(chain.id);
      const numsAddress = getNumsAddress(chain.id);
      const gameAddress = getContractAddress(chain.id, "nums", "game_actions");

      const calls: Call[] = [];

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

      calls.push(
        ...[
          {
            contractAddress: numsAddress,
            entrypoint: "approve",
            calldata: [
              gameAddress,
              uint256.bnToUint256(
                BigInt(factory.game_config.entry_cost) * 10n ** 18n
              ),
            ],
          },
          {
            contractAddress: gameAddress,
            entrypoint: "create_game",
            calldata: [factory.id],
          },
        ]
      );

      const { receipt } = await execute(calls, (receipt) => {
        const gameCreatedSelector = BigInt(
          "0x613f127a45b984440eb97077f485d7718ffff0d065fa4c427774abd166fba2b"
        );
        if (receipt) {
          const gameCreatedEvent = receipt.events.find(
            (i: any) => BigInt(i.keys[1]) === gameCreatedSelector
          );
          if (gameCreatedEvent) {
            console.log("onReady receipt");
            setTimeout(() => {
              onReady(num.toHex(gameCreatedEvent.data[4]));
            }, 1_000);
          }
        }
      });
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
          <HStack alignItems="center" gap={3}>
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
            <Box
              w="5px"
              h="18px"
              borderRight="solid 2px"
              borderColor="white"
              opacity={0.5}
            ></Box>
            <Text>{factory.game_config.entry_cost.toLocaleString()} NUMS</Text>
          </HStack>
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
