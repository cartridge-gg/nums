import { HStack, Image, Spinner, Text, VStack } from "@chakra-ui/react";
import Overlay from "./Overlay";
import { useAccount, useNetwork } from "@starknet-react/core";
import { useQuery } from "urql";
import { useCallback, useEffect, useState } from "react";
import { Button } from "./Button";
import { CallData } from "starknet";
import useChain from "@/hooks/chain";
import useToast from "@/hooks/toast";
import { graphql } from "@/graphql/appchain";
import { StarknetColoredIcon } from "./icons/StarknetColored";
import { useTotals } from "@/context/totals";

const ClaimsQuery = graphql(`
  query ClaimsQuery($address: String!) {
    numsClaimsModels(where: { playerEQ: $address }) {
      edges {
        node {
          claim_id
          message_hash
          ty {
            TOKEN {
              amount
            }
          }
        }
      }
    }
  }
`);

type Status = "claimable" | "proving" | "confirming" | "claimed" | "loading";

type ClaimStatus = {
  claimId: number;
  amount: number;
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
  const [claiming, setClaiming] = useState(false);
  const { requestAppchain } = useChain();
  const { rewardsEarned, rewardsClaimed } = useTotals();
  const { showTxn } = useToast();
  const { chain } = useNetwork();
  const [claims, setClaims] = useState<ClaimStatus[]>([]);
  const { address, account } = useAccount();
  const [queryResult, executeQuery] = useQuery({
    query: ClaimsQuery,
    variables: { address: address! },
  });

  useEffect(() => {
    if (!queryResult.fetching) {
      const id = setTimeout(
        () => executeQuery({ requestPolicy: "network-only" }),
        2000,
      );
      return () => clearTimeout(id);
    }
  }, [queryResult.fetching, executeQuery]);

  const claimReward = useCallback(async () => {
    if (!account) return;

    setClaiming(true);
    try {
      const { transaction_hash } = await account.execute([
        {
          contractAddress: import.meta.env.VITE_CLAIM_CONTRACT,
          entrypoint: "claim_reward",
          calldata: [],
        },
      ]);
      showTxn(transaction_hash, chain.name);
      await executeQuery({ requestPolicy: "network-only" });
    } catch (e) {
      console.error(e);
    } finally {
      setClaiming(false);
    }
  }, [account, executeQuery]);

  useEffect(() => {
    const claimsModels = queryResult.data?.numsClaimsModels?.edges;
    if (!claimsModels) return;

    const status: ClaimStatus[] = claimsModels.map((claimModel) => {
      const claimId = claimModel!.node!.claim_id as number;
      const amount = parseInt(claimModel!.node!.ty!.TOKEN!.amount!) as number;
      const status = "loading";
      const eta = 0;
      return {
        claimId,
        amount,
        status,
        eta,
      };
    });

    setClaims(status);
  }, [queryResult]);

  if (!address) return <></>;

  return (
    <Overlay open={open} onClose={() => {
      requestAppchain();

      onClose();
    }}>
      <VStack
        w={["100%", "100%", "50%"]}
        h="full"
        align="flex-start"
        p="24px"
        pt="60px"
      >
        <HStack w="full" h="80px">
          <HStack
            h="full"
            flex={1}
            layerStyle="faded"
            align="center"
            justify="flex-start"
            p="20px"
          >
            <VStack>
              <HStack>
                <Image
                  boxSize="24px"
                  borderRadius="full"
                  fit="cover"
                  src="/nums_logo.png"
                />
                <Text fontSize="14px" fontWeight="700" opacity={0.5}>
                  Nums Chain
                </Text>
              </HStack>
              <Text fontSize="16px" fontWeight="450">
                {(rewardsEarned - rewardsClaimed).toLocaleString()} NUMS
              </Text>
            </VStack>
          </HStack>
          <Button
            visual="secondary"
            fontSize="16px"
            h="30px"
            disabled={claiming || rewardsEarned - rewardsClaimed <= 0}
            opacity={claiming || rewardsEarned - rewardsClaimed <= 0 ? 0.5 : 1}
            onClick={() => claimReward()}
          >
            {claiming ? <Spinner /> : <>{"> > Claim > >"}</>}
          </Button>
          <VStack
            h="full"
            flex={1}
            layerStyle="faded"
            align="flex-start"
            justify="center"
          >
            <HStack>
              <StarknetColoredIcon />
              <Text fontSize="14px" fontWeight="700" opacity={0.5}>
                Starknet Mainnet
              </Text>
            </HStack>
            <Text fontSize="16px" fontWeight="450">
              {rewardsClaimed.toLocaleString()} NUMS
            </Text>
          </VStack>
        </HStack>
        <HStack
          p="16px"
          justify="space-between"
          w="full"
          opacity={0.5}
          fontSize="14px"
          fontWeight="450"
        >
          <Text flex="1" textAlign="center">
            CLAIM ID
          </Text>
          <Text flex="1" textAlign="center">
            AMOUNT
          </Text>
          <Text flex="1" textAlign="center">
            STEP
          </Text>
          <Text flex="1" textAlign="center">
            TEST CLAIM
          </Text>
        </HStack>
        {claims.map((claim) => (
          <Row key={claim.claimId} {...claim} />
        ))}
      </VStack>
    </Overlay>
  );
};

const Row = ({
  claimId,
  amount,
  status,
}: {
  claimId: number;
  amount: number;
  status: Status;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { showTxn } = useToast();
  const { account } = useAccount();
  const { requestStarknet } = useChain();

  const onClaim = useCallback(async () => {
    if (!account) return;
    setIsLoading(true);

    try {
      await requestStarknet();
      const { transaction_hash } = await account.execute([
        {
          contractAddress: import.meta.env.VITE_CONSUMER_CONTRACT,
          entrypoint: "consume_claim_reward",
          calldata: CallData.compile({
            player: account.address,
            claim_id: claimId,
            amount: amount,
          }),
        },
      ]);
      showTxn(transaction_hash, "Starknet Mainnet");

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
  }, [account, claimId, amount, requestStarknet]);

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
        {claimId}
      </Text>
      <Text flex="1" textAlign="center">
        {amount.toLocaleString()} NUMS
      </Text>
      <Text flex="1" textAlign="center">
        {status}
      </Text>
      <HStack flex="1" justify="center">
        {" "}
        <Button
          h="30px"
          visual="secondary"
          fontSize="16px"
          disabled={isLoading}
          onClick={() => onClaim()}
        >
          Receive on SN
        </Button>
      </HStack>
    </HStack>
  );
};

export default RewardsOverlay;
