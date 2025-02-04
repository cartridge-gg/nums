import { HStack, Text, VStack } from "@chakra-ui/react";
import Overlay from "./Overlay";
import { useAccount, useNetwork } from "@starknet-react/core";
import { useQuery } from "urql";
import { useCallback, useEffect, useState } from "react";
import { Button } from "./Button";
import { CallData } from "starknet";
import useChain from "@/hooks/chain";
import useToast from "@/hooks/toast";
import { graphql } from "@/graphql/appchain";

const RewardsQuery = graphql(`
  query RewardsQuery($address: String!) {
    numsGameModels(where: { playerEQ: $address, rewardNEQ: 0, claimed: true }) {
      edges {
        node {
          game_id
          reward
          max_slots
          remaining_slots
        }
      }
    }
  }
`);

type Status = "claimable" | "proving" | "confirming" | "claimed" | "loading";

type RewardStatus = {
  gameId: number;
  score: number;
  reward: number;
  eta: number;
  status: Status;
};

const RewardsOverlay = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [rewards, setRewards] = useState<RewardStatus[]>([]);
  const { address } = useAccount();
  const { requestAppchain } = useChain();

  const [queryResult] = useQuery({
    query: RewardsQuery,
    variables: { address: address! },
  });

  useEffect(() => {
    const gamesModels = queryResult.data?.numsGameModels?.edges;
    if (!gamesModels) return;

    const status: RewardStatus[] = gamesModels.map((gameModel) => {
      const gameId = gameModel!.node!.game_id as number;
      const reward = gameModel!.node!.reward as number;
      const score =
        (gameModel!.node!.max_slots as number) -
        (gameModel!.node!.remaining_slots as number);
      const status = "loading";
      const eta = 0;
      return {
        gameId,
        score,
        reward,
        status,
        eta,
      };
    });

    setRewards(status);
  }, [queryResult]);

  if (!address) return <></>;

  return (
    <Overlay
      open={open}
      onClose={() => {
        requestAppchain();
        onClose();
      }}
    >
      <VStack
        w={["100%", "100%", "50%"]}
        h="full"
        align="flex-start"
        p="24px"
        pt="60px"
      >
        <HStack
          p="16px"
          justify="space-between"
          w="full"
          opacity={0.5}
          fontSize="14px"
          fontWeight="450"
        >
          <Text flex="1" textAlign="center">
            SCORE
          </Text>
          <Text flex="1" textAlign="center">
            REWARDS
          </Text>
          <Text flex="1" textAlign="center">
            STEP
          </Text>
          <Text flex="1" textAlign="center">
            TEST CLAIM
          </Text>
        </HStack>
        {rewards.map((reward) => (
          <Row key={reward.gameId} {...reward} />
        ))}
      </VStack>
    </Overlay>
  );
};

const Row = ({
  gameId,
  score,
  reward,
  status,
}: {
  gameId: number;
  score: number;
  reward: number;
  status: Status;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { chain } = useNetwork();
  const { showTxn } = useToast();
  const { account } = useAccount();
  const { requestAppchain, requestStarknet } = useChain();

  const onClaim = useCallback(async () => {
    if (!account) return;
    setIsLoading(true);

    try {
      await requestStarknet(true);
      const { transaction_hash } = await account.execute([
        {
          contractAddress: import.meta.env.VITE_CONSUMER_CONTRACT,
          entrypoint: "consume_claim_reward",
          calldata: CallData.compile({
            player: account.address,
            game_id: gameId,
            reward: reward,
          }),
        },
      ]);
      showTxn(transaction_hash, chain.name);

      // await requestAppchain(true);
      // await account.execute([
      //   {
      //     contractAddress: import.meta.env.VITE_CLAIM_CONTRACT,
      //     entrypoint: "claimed_on_starknet",
      //     calldata: CallData.compile({
      //       game_id: gameId,
      //     }),
      //   },
      // ]);
    } finally {
      setIsLoading(false);
    }
  }, [account, gameId, reward, requestAppchain]);

  return (
    <HStack
      borderRadius="8px"
      bgColor="rgba(255,255,255,0.04)"
      p="5px"
      justify="space-between"
      w="full"
      fontSize="16px"
      fontWeight="500"
    >
      <Text flex="1" textAlign="center">
        {score}
      </Text>
      <Text flex="1" textAlign="center">
        {reward.toLocaleString()} NUMS
      </Text>
      <Text flex="1" textAlign="center">
        {status}
      </Text>
      <HStack flex="1" justify="center">
        {" "}
        <Button
          h="40px"
          visual="secondary"
          fontSize="16px"
          disabled={isLoading}
          onClick={() => onClaim()}
        >
          Claim
        </Button>
      </HStack>
    </HStack>
  );
};

export default RewardsOverlay;
