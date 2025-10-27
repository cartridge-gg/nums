// import { useJackpots } from "@/context/tournaments";
// import { HStack, Spacer, VStack, Text, Image, Stack } from "@chakra-ui/react";
// import {
//   ComponentProps,
//   CSSProperties,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";
// import { BigNumberish, CairoCustomEnum, num } from "starknet";
// import { TimeAgo } from "./ui/time-ago";
// import { Game, TokenTypeERC20 } from "@/bindings";
// import { LogoIcon } from "./icons/Logo";
// import { TimeCountdown } from "./TimeCountdown";
// import { getSwapQuote } from "@/utils/ekubo";
// import { InfoIcon } from "./icons/Info";
// import { getNumsAddress, STRK_CONTRACT_ADDRESS } from "@/config";
// import useChain from "@/hooks/chain";
// import { Tooltip } from "./ui/tooltip";
// import { mainnet } from "@starknet-react/chains";

// // USDC token address on Starknet mainnet
// const USDC_ADDRESS =
//   "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8";

// export const JackpotDetails = ({
//   jackpotId,
//   game,
//   computedId,
//   ...props
// }: {
//   jackpotId: BigNumberish;
//   game?: Game;
//   computedId?: number;
//   props?: ComponentProps<"div">;
// }) => {
//   const { getJackpotById, getFactoryById } = useJackpots();
//   const { chain } = useChain();
//   const [usdcValue, setUsdcValue] = useState<number | null>(null);
//   const [loading, setLoading] = useState(false);

//   const { jackpot, factory } = useMemo(() => {
//     const jackpot = getJackpotById(Number(jackpotId));
//     const factory = getFactoryById(Number(jackpot?.factory_id));

//     return { jackpot, factory };
//   }, [jackpotId, getJackpotById]);

//   const { numsBalance, tokenBalance } = useMemo(() => {
//     let tokenBalance = 0n;

//     if (jackpot?.token.isSome()) {
//       //
//       const token = jackpot.token.unwrap();

//       switch ((token.ty as CairoCustomEnum).activeVariant()) {
//         case "ERC20":
//           const values = (token.ty as CairoCustomEnum).variant[
//             "ERC20"
//           ] as TokenTypeERC20;
//           tokenBalance = BigInt(values.amount) / 10n ** 18n;
//           break;
//         default:
//           break;
//       }
//     }

//     const numsBalance = BigInt(jackpot?.nums_balance || 0) / 10n ** 18n;

//     return {
//       numsBalance,
//       tokenBalance,
//     };
//   }, [jackpot]);

//   // Fetch USDC quotes for NUMS and STRK tokens
//   useEffect(() => {
//     const fetchUSDCValue = async () => {
//       if (numsBalance === 0n && tokenBalance === 0n) {
//         setUsdcValue(0);
//         return;
//       }

//       setLoading(true);
//       try {
//         const numsAddress = getNumsAddress(mainnet.id);
//         let totalUsdcValue = 0;

//         // Get NUMS to USDC quote if there's NUMS balance
//         if (numsBalance > 0n) {
//           const numsAmount = numsBalance * 10n ** 18n; // Convert back to wei
//           const numsQuote = await getSwapQuote(
//             numsAmount,
//             numsAddress,
//             USDC_ADDRESS
//           );
//           if (numsQuote.total) {
//             // The total is in USDC units (6 decimals)
//             totalUsdcValue += Math.abs(numsQuote.total) / 1e6;
//           }
//         }

//         // Get STRK to USDC quote if there's STRK balance
//         if (tokenBalance > 0n) {
//           const strkAmount = tokenBalance * 10n ** 18n; // Convert back to wei
//           const strkQuote = await getSwapQuote(
//             strkAmount,
//             STRK_CONTRACT_ADDRESS,
//             USDC_ADDRESS
//           );
//           if (strkQuote.total) {
//             // The total is in USDC units (6 decimals)
//             totalUsdcValue += Math.abs(strkQuote.total) / 1e6;
//           }
//         }

//         setUsdcValue(totalUsdcValue);
//       } catch (error) {
//         console.error("Error fetching USDC quotes:", error);
//         setUsdcValue(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUSDCValue();
//   }, [numsBalance, tokenBalance, chain.id]);

//   if (!jackpot || !factory) return null;
//   return (
//     <Stack direction={["column", "column", "row"]} gap={[3, 3, 0]} {...props}>
//       <HStack
//         gap={[2, 3]}
//         alignItems="center"
//         justify={["center", "center", "flex-start"]}
//         h="full"
//         wrap={["wrap", "nowrap"]}
//       >
//         <Text fontSize={["16px", "18px"]} fontWeight="500">
//           Jackpot:
//         </Text>
//         <HStack gap={2} alignItems="center" flexWrap="wrap" justify="center">
//           <HStack fontFamily="Ekamai" fontSize={["20px", "22px"]}>
//             {numsBalance.toLocaleString()} <LogoIcon w={24} h={24} />
//           </HStack>
//           {tokenBalance !== undefined && tokenBalance > 0 && (
//             <>
//               <Text fontSize={["20px", "22px"]}>+</Text>
//               <HStack fontFamily="Ekamai" fontSize={["20px", "22px"]}>
//                 {tokenBalance.toLocaleString()}
//                 <Image src="/tokens/strk.png" w="24px" h="24px" />
//               </HStack>
//             </>
//           )}
//         </HStack>
//       </HStack>

//       <Spacer minW="0px" display={["none", "none", "block"]} />

//       <HStack justify={["center", "center", "flex-end"]}>
//         {game && (
//           <>
//             <VStack
//               gap={0}
//               alignItems={["center", "center", "flex-start"]}
//               display={["none", "flex"]}
//             >
//               <Text w="auto" fontSize="xs" lineHeight="24px">
//                 LVL {game.level.toString()}
//               </Text>
//               <Text
//                 w="auto"
//                 fontFamily="Ekamai"
//                 fontSize="16px"
//                 display={["none", "flex"]}
//               >
//                 + {game?.reward.toLocaleString()} NUMS
//               </Text>
//             </VStack>
//             <Spacer minW="20px" display={["none", "block"]} />
//           </>
//         )}
//         <HStack gap={2} alignItems="center">
//           <Text fontSize={["16px", "18px"]} fontWeight="500">
//             Ends:
//           </Text>
//           <TimeCountdown
//             timestampSec={Number(jackpot?.end_at || 0)}
//             fontSize={["20px", "22px", "22px"]}
//           />
//         </HStack>
//       </HStack>

//       <Spacer minW="0px" display={["none", "none", "block"]} />

//       {/* <Tooltip
//         content={
//           <VStack gap={0} alignItems="flex-start">
//             <Text>{numsBalance.toLocaleString()} NUMS</Text>
//             {tokenBalance > 0 && (
//               <Text>{tokenBalance.toLocaleString()} STRK</Text>
//             )}
//           </VStack>
//         }
//       > */}
//         <HStack
//           gap={2}
//           alignItems="center"
//           justify={["center", "center", "flex-end"]}
//         >
//           <Text fontSize={["16px", "18px"]} fontWeight="500">
//             Value:
//           </Text>
//           <HStack
//             fontFamily="Ekamai"
//             fontSize={["20px", "22px"]}
//             fontWeight="bold"
//           >
//             {loading ? (
//               <Text>Loading...</Text>
//             ) : usdcValue !== null ? (
//               <>
//                 <Text>${usdcValue.toFixed(2)}</Text>
//                 {/* <InfoIcon props={{ boxSize: "16px" }} /> */}
//               </>
//             ) : (
//               <Text>-</Text>
//             )}
//           </HStack>
//         </HStack>
//       {/* </Tooltip> */}
//     </Stack>
//   );
// };
