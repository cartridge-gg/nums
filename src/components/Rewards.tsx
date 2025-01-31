import { HStack, Text, VStack } from "@chakra-ui/react";
import Overlay from "./Overlay";
import { useAccount } from "@starknet-react/core";
import { graphql } from "gql.tada";
import { useQuery } from "urql";
import { useCallback, useEffect, useState } from "react";
import { Button } from "./Button";
import { CallData } from "starknet";
import useChain from "@/hooks/chain";

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
      <Text textStyle="h-md">Rewards</Text>
      <VStack w="75%">
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
  const { account } = useAccount();

  const { requestStarknet } = useChain();

  // Claim rewards are automatically triggered on appchain when game is over, however,
  // we need to trigger the consume claim contract on starknet to actually claim the rewards.
  // Switch chain to starknet and trigger the consume claim contract.
  const onClaim = useCallback(async () => {
    if (!account) return;
    setIsLoading(true);

    try {
      await requestStarknet();
      await account.execute([
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
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [account, gameId, reward, requestStarknet]);

  return (
    <HStack
      borderRadius="8px"
      bgColor="rgba(255,255,255,0.04)"
      p="10px"
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
          visual="secondary"
          fontSize="18px"
          disabled={isLoading}
          onClick={() => onClaim()}
        >
          Claim on Starknet
        </Button>
      </HStack>
    </HStack>
  );
};

export default RewardsOverlay;
