import { AppchainClient, StarknetClient } from "@/graphql/clients";
import { graphql } from "@/graphql/appchain";
import { useCallback, useState } from "react";
import { useAccount } from "@starknet-react/core";
import { useTotals } from "@/context/totals";
import { CallData, Provider } from "starknet";
import { useInterval } from "usehooks-ts";

const ClaimsQuery = graphql(`
  query ClaimsQuery($address: String!) {
    numsClaimsModels(where: { playerEQ: $address }, limit: 500) {
      edges {
        node {
          claim_id
          message_hash
          block_timestamp
          block_number
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

export type ClaimData = {
  claimId: number;
  messageHash: string;
  blockTimestamp: number;
  blockNumber: number;
  claimedOnStarknet: boolean;
  amount: number;
  status: Status;
};

export type Status = "Bridging" | "Ready to Claim" | "Claimed";
export type MessageHash = string;
export type Claims = Record<MessageHash, ClaimData>;

export const useClaims = () => {
  const { address } = useAccount();
  const [claims, setClaims] = useState<Claims>({});
  const [bridging, setBridging] = useState(0);
  const [readyToClaim, setReadyToClaim] = useState(0);
  const [claimed, setClaimed] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [blockProcessing, setBlockProcessing] = useState(0);
  const {
    rewardsEarned: rewardsEarnedAppchain,
    rewardsClaimed: rewardsClaimedAppchain,
  } = useTotals();
  const readyToBridge = rewardsEarnedAppchain - rewardsClaimedAppchain;

  const provider = new Provider({
    nodeUrl: import.meta.env.VITE_SEPOLIA_RPC_URL,
  });

  useInterval(
    () => {
      updateClaims();
    },
    isRefreshing ? 5000 : null,
  );

  const updateClaims = useCallback(async () => {
    if (!address) return;

    try {
      // Fetch claims data
      const { starknetClaims, appchainClaims } = await fetchClaimsData(address);

      // Format claims
      const starknetClaimsMap = formatClaims(starknetClaims, "Claimed");
      const appchainClaimsMap = formatClaims(appchainClaims, "Bridging");

      // Merge claims and mark claimed ones
      const initialMergedClaims: Claims = Object.fromEntries(
        Object.entries(appchainClaimsMap).map(([id, claim]) => [
          id,
          starknetClaimsMap[claim.messageHash]
            ? { ...claim, status: "Claimed" }
            : claim,
        ]),
      );

      // Process message statuses in parallel
      const [processedClaims, readyToClaimAmount] = await processClaimsStatuses(
        initialMergedClaims,
        provider,
      );

      // Calculate totals
      const { bridgingAmount, claimedAmount } = calculateTotals(
        starknetClaims,
        rewardsClaimedAppchain,
      );

      // Get processing block
      const res = await provider.callContract({
        contractAddress: import.meta.env.VITE_CONSUMER_CONTRACT,
        entrypoint: "get_state",
      });

      setBlockProcessing(parseInt(res[1]));
      // Update state
      setClaims(processedClaims);
      setBridging(bridgingAmount);
      setReadyToClaim(readyToClaimAmount);
      setClaimed(claimedAmount);
    } catch (error) {
      console.error("Error updating claims:", error);
    }
  }, [address, rewardsEarnedAppchain, rewardsClaimedAppchain]);

  const setAutoRefresh = useCallback(
    (enabled: boolean) => {
      setIsRefreshing(enabled);
      if (enabled) {
        updateClaims();
      }
    },
    [updateClaims],
  );

  return {
    claims,
    amountClaimed: claimed,
    amountBridging: bridging,
    amountToClaim: readyToClaim,
    amountToBridge: readyToBridge,
    blockProcessing,
    setAutoRefresh,
    isRefreshing,
  };
};

const calculateTotals = (
  starknetClaimsModels: any[],
  rewardsClaimedAppchain: number,
) => {
  const rewardsClaimedStarknet = starknetClaimsModels.reduce(
    (acc, claim) => acc + parseInt(claim!.node!.ty!.TOKEN!.amount!),
    0,
  );

  return {
    bridgingAmount: rewardsClaimedAppchain - rewardsClaimedStarknet,
    claimedAmount: rewardsClaimedStarknet,
  };
};

const fetchClaimsData = async (address: string) => {
  const [starknetResponse, appchainResponse] = await Promise.all([
    StarknetClient.query(
      ClaimsQuery,
      { address },
      { requestPolicy: "network-only" },
    ).toPromise(),
    AppchainClient.query(
      ClaimsQuery,
      { address },
      { requestPolicy: "network-only" },
    ).toPromise(),
  ]);

  return {
    starknetClaims: starknetResponse.data?.numsClaimsModels?.edges!,
    appchainClaims: appchainResponse.data?.numsClaimsModels?.edges!,
  };
};

const checkMessageStatus = async (
  provider: Provider,
  messageHash: string,
): Promise<Status> => {
  try {
    const status = await provider.callContract({
      contractAddress: import.meta.env.VITE_CONSUMER_CONTRACT,
      entrypoint: "appchain_to_sn_messages",
      calldata: CallData.compile({ message_hash: messageHash }),
    });
    return status.length > 1 ? "Ready to Claim" : "Bridging";
  } catch (error) {
    console.error(`Error checking message status:`, error);
    return "Bridging";
  }
};

const processClaimsStatuses = async (
  mergedClaims: Claims,
  provider: Provider,
): Promise<[Claims, number]> => {
  let readyToClaimAmount = 0;

  const statusChecks = Object.entries(mergedClaims).map(async ([id, claim]) => {
    if (claim.status !== "Bridging") return [id, claim];

    const status = await checkMessageStatus(provider, claim.messageHash);
    if (status === "Ready to Claim") {
      readyToClaimAmount += claim.amount;
    }
    return [id, { ...claim, status }];
  });

  const processedEntries = await Promise.all(statusChecks);
  return [Object.fromEntries(processedEntries), readyToClaimAmount];
};

const formatClaims = (claimsModels: any[], status: Status): Claims =>
  Object.fromEntries(
    claimsModels.map((claim) => [
      claim!.node!.message_hash!,
      {
        claimId: claim!.node!.claim_id!,
        messageHash: claim!.node!.message_hash!,
        blockTimestamp: parseInt(claim!.node!.block_timestamp!),
        blockNumber: parseInt(claim!.node!.block_number!),
        claimedOnStarknet: claim!.node!.claimed_on_starknet as boolean,
        amount: parseInt(claim!.node!.ty!.TOKEN!.amount!),
        status,
      },
    ]),
  );
