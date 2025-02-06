import { Box, HStack, Image, Spinner, Text, VStack } from "@chakra-ui/react";
import Overlay from "./Overlay";
import { useAccount, useNetwork } from "@starknet-react/core";
import { useQuery } from "urql";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { Button } from "./Button";
import { CallData } from "starknet";
import useChain from "@/hooks/chain";
import useToast from "@/hooks/toast";
import { graphql } from "@/graphql/appchain";
import { StarknetColoredIcon } from "./icons/StarknetColored";
import { useTotals } from "@/context/totals";
import { useMessage } from "@/hooks/message";

const ClaimsQuery = graphql(`
  query ClaimsQuery($address: String!) {
    numsClaimsModels(where: { playerEQ: $address }) {
      edges {
        node {
          claim_id
          message_hash
          claimed_on_starknet
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

type Status = "Claimed" | "Bridging" | "Ready to Claim";

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
  const [bridging, setBridging] = useState(false);
  const { requestAppchain } = useChain();
  const { rewardsEarned, rewardsClaimed } = useTotals();
  const { messages, setHashes } = useMessage();
  const [rewardsBridging, setRewardsBridging] = useState(0);
  const [rewardsReady, setRewardsReady] = useState(0);
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

  const bridgeRewards = useCallback(async () => {
    if (!account) return;

    setBridging(true);
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
      setBridging(false);
    }
  }, [account, executeQuery]);

  useEffect(() => {
    console.log(messages);
  }, [messages]);

  useEffect(() => {
    const claimsModels = queryResult.data?.numsClaimsModels?.edges;
    if (!claimsModels) return;

    const brdiging = claimsModels
      .filter((claim) => !claim!.node!.claimed_on_starknet)
      .reduce(
        (acc, claim) => acc + parseInt(claim!.node!.ty!.TOKEN!.amount!),
        0,
      );
    setRewardsBridging(brdiging);

    const hashes = claimsModels.map((claim) => claim!.node!.message_hash!);
    setHashes(hashes);

    const status: ClaimStatus[] = claimsModels.map((claimModel) => {
      const claimId = claimModel!.node!.claim_id as number;
      const amount = parseInt(claimModel!.node!.ty!.TOKEN!.amount!) as number;
      const status = "Bridging";
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
    <Overlay
      open={open}
      onClose={() => {
        requestAppchain();
        onClose();
      }}
    >
      <VStack
        w={["100%", "100%", "60%"]}
        h="full"
        align="flex-start"
        p="24px"
        pt="60px"
      >
        <HStack w="full">
          <Step
            title="Ready to Bridge"
            body={
              <VStack>
                <HStack>
                  <Image
                    boxSize="24px"
                    borderRadius="full"
                    fit="cover"
                    src="/nums_logo.png"
                  />
                  <Text fontSize="16px" fontWeight="450">
                    {(rewardsEarned - rewardsClaimed).toLocaleString()} NUMS
                  </Text>
                </HStack>
              </VStack>
            }
            footer={
              <Button
                visual="secondary"
                h="40px"
                w="full"
                fontSize="16px"
                disabled={bridging}
                onClick={async () => {
                  await requestAppchain();
                  bridgeRewards();
                }}
              >
                Bridge
              </Button>
            }
          />

          <Step
            title="Bridging"
            body={
              <VStack>
                <HStack>
                  {rewardsBridging > 0 ? <Spinner /> : <></>}
                  <Text fontSize="16px" fontWeight="450">
                    {rewardsBridging.toLocaleString()} NUMS
                  </Text>
                </HStack>
              </VStack>
            }
            footer={<Box h="40px"></Box>}
          />

          <Step
            title="Ready to Claim"
            body={
              <VStack>
                <HStack>
                  <Image
                    boxSize="24px"
                    borderRadius="full"
                    fit="cover"
                    src="/nums_logo.png"
                  />
                  <Text fontSize="16px" fontWeight="450">
                    {(rewardsEarned - rewardsClaimed).toLocaleString()} NUMS
                  </Text>
                </HStack>
              </VStack>
            }
            footer={
              <Button visual="secondary" h="40px" w="full" fontSize="16px">
                Claim
              </Button>
            }
          />

          <Step
            title="Claimed"
            body={
              <VStack>
                <HStack>
                  <Text fontSize="16px" fontWeight="450">
                    {(rewardsEarned - rewardsClaimed).toLocaleString()} NUMS
                  </Text>
                </HStack>
              </VStack>
            }
            footer={
              <Button
                h="40px"
                w="full"
                fontSize="16px"
                visual="transparent"
                textAlign="center"
              >
                <StarknetColoredIcon /> Trade
              </Button>
            }
          />
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
        </HStack>
        {claims.map((claim) => (
          <Row key={claim.claimId} {...claim} />
        ))}
      </VStack>
    </Overlay>
  );
};

const Step = ({
  title,
  body,
  footer,
}: {
  title: string;
  body: ReactNode;
  footer: ReactNode;
}) => {
  return (
    <VStack flex={1} gap="2px">
      <VStack
        w="full"
        layerStyle="faded"
        align="flex-start"
        justify="center"
        borderRadius="8px 8px 0 0"
        p="20px"
      >
        <Text>{title}</Text>
        {body}
      </VStack>
      <HStack
        w="full"
        layerStyle="faded"
        align="center"
        justify="flex-start"
        borderRadius="0 0 8px 8px"
      >
        {footer}
      </HStack>
    </VStack>
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
    </HStack>
  );
};

export default RewardsOverlay;
