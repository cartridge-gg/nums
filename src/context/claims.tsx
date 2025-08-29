// import {
//   createContext,
//   useContext,
//   useState,
//   useCallback,
//   useEffect,
//   ReactNode,
// } from "react";
// import { useAccount } from "@starknet-react/core";
// import { AppchainClient, StarknetClient } from "@/graphql/clients";
// import { graphql } from "@/graphql/appchain";
// import { useTotals } from "@/context/totals";
// import { CallData, Provider } from "starknet";
// import { useInterval } from "usehooks-ts";

// const ClaimsQuery = graphql(`
//   query ClaimsQuery($address: String!) {
//     numsClaimsModels(where: { playerEQ: $address }, limit: 500) {
//       edges {
//         node {
//           claim_id
//           message_hash
//           block_timestamp
//           block_number
//           claimed_on_starknet
//           ty {
//             TOKEN {
//               amount
//             }
//           }
//         }
//       }
//     }
//   }
// `);

// export type Status = "Bridging" | "Ready to Claim" | "Claimed";

// export type ClaimData = {
//   claimId: number;
//   messageHash: string;
//   blockTimestamp: number;
//   blockNumber: number;
//   claimedOnStarknet: boolean;
//   amount: number;
//   status: Status;
// };

// export type MessageHash = string;
// export type Claims = Record<MessageHash, ClaimData>;

// export interface ClaimsContextType {
//   claims: Claims;
//   amountEarned: number;
//   amountClaimed: number;
//   amountBridging: number;
//   amountToClaim: number;
//   amountToBridge: number;
//   blockProcessing: number;
//   isRefreshing: boolean;
//   setAutoRefresh: (enabled: boolean) => void;
// }

// const ClaimsContext = createContext<ClaimsContextType | undefined>(undefined);

// export function ClaimsProvider({ children }: { children: ReactNode }) {
//   const { address } = useAccount();
//   const {
//     rewardsEarned: rewardsEarnedAppchain,
//     rewardsClaimed: rewardsClaimedAppchain,
//   } = useTotals();

//   // Local state for claims
//   const [claims, setClaims] = useState<Claims>({});
//   const [bridging, setBridging] = useState(0);
//   const [readyToClaim, setReadyToClaim] = useState(0);
//   const [claimed, setClaimed] = useState(0);
//   const [isRefreshing, setIsRefreshing] = useState(true);
//   const [blockProcessing, setBlockProcessing] = useState(0);

//   const readyToBridge = rewardsEarnedAppchain - rewardsClaimedAppchain;

//   const provider = new Provider({
//     nodeUrl: import.meta.env.VITE_MAINNET_RPC_URL,
//   });

//   const updateClaims = useCallback(async () => {
//     if (!address) return;

//     try {
//       // Fetch claims data from both Starknet and Appchain
//       const { starknetClaims, appchainClaims } = await fetchClaimsData(address);

//       // Format claims with initial statuses
//       const starknetClaimsMap = formatClaims(starknetClaims, "Claimed");
//       const appchainClaimsMap = formatClaims(appchainClaims, "Bridging");

//       // Merge Appchain claims with Starknet ones; if a claim exists on Starknet, mark it as Claimed.
//       const initialMergedClaims: Claims = Object.fromEntries(
//         Object.entries(appchainClaimsMap).map(([id, claim]) => [
//           id,
//           starknetClaimsMap[claim.messageHash]
//             ? { ...claim, status: "Claimed" }
//             : claim,
//         ]),
//       );

//       // Process claim statuses in parallel to update any Bridging claims
//       const [processedClaims, readyToClaimAmount] = await processClaimsStatuses(
//         initialMergedClaims,
//         provider,
//       );

//       // Calculate totals
//       const { bridgingAmount, claimedAmount } = calculateTotals(
//         starknetClaims,
//         rewardsClaimedAppchain,
//         readyToClaimAmount,
//       );

//       // Query the consumer contract to get the current processing block
//       const res = await provider.callContract({
//         contractAddress: import.meta.env.VITE_CONSUMER_CONTRACT,
//         entrypoint: "get_state",
//       });

//       if (parseInt(res[0]) !== 0) {
//         setBlockProcessing(parseInt(res[1]));
//       } else {
//         setBlockProcessing(0);
//       }

//       // Update state values
//       setClaims(processedClaims);
//       setBridging(bridgingAmount < 0 ? 0 : bridgingAmount);
//       setReadyToClaim(readyToClaimAmount);
//       setClaimed(claimedAmount);
//     } catch (error) {
//       console.error("Error updating claims:", error);
//     }
//   }, [address, provider, rewardsClaimedAppchain]);

//   // Refresh the claims periodically if auto-refresh is enabled.
//   useInterval(() => updateClaims(), isRefreshing && address ? 5000 : null);

//   const setAutoRefresh = useCallback(
//     (enabled: boolean) => {
//       setIsRefreshing(enabled);
//       if (enabled) {
//         updateClaims();
//       }
//     },
//     [updateClaims],
//   );

//   // Optionally, update claims immediately when the address changes.
//   useEffect(() => {
//     if (address) {
//       updateClaims();
//     }
//   }, [address]);

//   return (
//     <ClaimsContext.Provider
//       value={{
//         claims,
//         amountEarned: rewardsEarnedAppchain,
//         amountClaimed: claimed,
//         amountBridging: bridging,
//         amountToClaim: readyToClaim,
//         amountToBridge: readyToBridge,
//         blockProcessing,
//         isRefreshing,
//         setAutoRefresh,
//       }}
//     >
//       {children}
//     </ClaimsContext.Provider>
//   );
// }

// export function useClaims() {
//   const context = useContext(ClaimsContext);
//   if (context === undefined) {
//     throw new Error("useClaims must be used within a ClaimsProvider");
//   }
//   return context;
// }

// // ----------------------------------------------------------------------------
// // Helper Functions
// // ----------------------------------------------------------------------------

// const calculateTotals = (
//   starknetClaimsModels: any[],
//   rewardsClaimedAppchain: number,
//   readyToClaimAmount: number,
// ) => {
//   const rewardsClaimedStarknet = starknetClaimsModels.reduce(
//     (acc, claim) => acc + parseInt(claim!.node!.ty!.TOKEN!.amount!),
//     0,
//   );

//   return {
//     bridgingAmount:
//       rewardsClaimedAppchain - rewardsClaimedStarknet - readyToClaimAmount,
//     claimedAmount: rewardsClaimedStarknet,
//   };
// };

// const fetchClaimsData = async (address: string) => {
//   const [starknetResponse, appchainResponse] = await Promise.all([
//     StarknetClient.query(
//       ClaimsQuery,
//       { address },
//       { requestPolicy: "network-only" },
//     ).toPromise(),
//     AppchainClient.query(
//       ClaimsQuery,
//       { address },
//       { requestPolicy: "network-only" },
//     ).toPromise(),
//   ]);

//   return {
//     starknetClaims: starknetResponse.data?.numsClaimsModels?.edges || [],
//     appchainClaims: appchainResponse.data?.numsClaimsModels?.edges || [],
//   };
// };

// const checkMessageStatus = async (
//   provider: Provider,
//   messageHash: string,
// ): Promise<Status> => {
//   try {
//     const status = await provider.callContract({
//       contractAddress: import.meta.env.VITE_CONSUMER_CONTRACT,
//       entrypoint: "appchain_to_sn_messages",
//       calldata: CallData.compile({ message_hash: messageHash }),
//     });
//     return status.length > 1 ? "Ready to Claim" : "Bridging";
//   } catch (error) {
//     console.error("Error checking message status:", error);
//     return "Bridging";
//   }
// };

// const processClaimsStatuses = async (
//   mergedClaims: Claims,
//   provider: Provider,
// ): Promise<[Claims, number]> => {
//   let readyToClaimAmount = 0;

//   const statusChecks = Object.entries(mergedClaims).map(async ([id, claim]) => {
//     if (claim.status !== "Bridging") return [id, claim];

//     const status = await checkMessageStatus(provider, claim.messageHash);
//     if (status === "Ready to Claim") {
//       readyToClaimAmount += claim.amount;
//     }
//     return [id, { ...claim, status }];
//   });

//   const processedEntries = await Promise.all(statusChecks);
//   return [Object.fromEntries(processedEntries), readyToClaimAmount];
// };

// const formatClaims = (claimsModels: any[], status: Status): Claims =>
//   Object.fromEntries(
//     claimsModels.map((claim) => [
//       claim!.node!.message_hash!,
//       {
//         claimId: claim!.node!.claim_id!,
//         messageHash: claim!.node!.message_hash!,
//         blockTimestamp: parseInt(claim!.node!.block_timestamp!),
//         blockNumber: parseInt(claim!.node!.block_number!),
//         claimedOnStarknet: claim!.node!.claimed_on_starknet as boolean,
//         amount: parseInt(claim!.node!.ty!.TOKEN!.amount!),
//         status,
//       },
//     ]),
//   );
