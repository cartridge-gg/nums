import {
  Box,
  HStack,
  Spacer,
  Text,
  VStack,
  Image,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Portal,
} from "@chakra-ui/react";
import { TokenBalance } from "./TokenBalance";
import { getContractAddress, getNumsAddress } from "@/config";
import useChain from "@/hooks/chain";
import {
  Game,
  Jackpot,
  JackpotFactory,
  JackpotWinner,
  TokenTypeERC20,
} from "@/bindings";
import { useMemo, useState } from "react";
import { CairoCustomEnum } from "starknet";
import { LogoIcon } from "./icons/Logo";
import { TimeAgo } from "./ui/time-ago";
import { useControllers } from "@/context/controllers";
import { shortAddress } from "@/utils/address";
import { InfoIcon } from "./icons/Info";
import { getAddress } from "@starknet-react/core";
import { TimeCountdown } from "./TimeCountdown";
import { JackpotDetails } from "./JackpotDetails";

export const Footer = ({
  game,
  jackpot,
  winners,
}: {
  game?: Game;
  jackpot?: Jackpot;
  winners?: JackpotWinner[];
}) => {
  const { chain } = useChain();

  return (
    <HStack
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      w="full"
      h="70px"
      p="8px"
      bg="linear-gradient(0deg, rgba(0, 0, 0, 0.24) 0%, rgba(0, 0, 0, 0.16) 100%), {colors.purple.100}"
    >
      {/* @ts-ignore */}
      {game && jackpot && <JackpotDetails jackpotId={jackpot.id} w="full" />}
    </HStack>
  );
};

// <Popover.Root
//               positioning={{ placement: "top" }}
//               open={open}
//               onOpenChange={(e) => setOpen(e.open)}
//             >
//               <Popover.Trigger cursor="pointer">
//                 <InfoIcon />
//               </Popover.Trigger>
//               <Portal>
//                 <Popover.Positioner>
//                   <Popover.Content bg="linear-gradient(0deg, rgba(0, 0, 0, 0.24) 0%, rgba(0, 0, 0, 0.16) 100%), {colors.purple.100}">
//                     <Popover.Arrow />
//                     <Popover.Body>
//                       <>
//                         <VStack>
//                           {/* @ts-ignore */}
//                           {jackpot?.mode === "ConditionalVictory" && (
//                             <Text>
//                               First player to fill{" "}
//                               {factory?.min_slots.toString()} slots win the
//                               jackpot!
//                             </Text>
//                           )}
//                           {/* @ts-ignore */}
//                           {jackpot?.mode === "KingOfTheHill" && (
//                             <VStack alignItems="flex-start">
//                               <Text>
//                                 Become the King of the Hill and earn special
//                                 prizes!{" "}
//                               </Text>
//                               <Text>
//                                 Max winners: {factory?.max_winners.toString()}
//                               </Text>
//                               <Text>
//                                 Min slots: {factory?.min_slots.toString()}
//                               </Text>
//                             </VStack>
//                           )}
//                         </VStack>
//                       </>
//                     </Popover.Body>
//                   </Popover.Content>
//                 </Popover.Positioner>
//               </Portal>
//             </Popover.Root>
