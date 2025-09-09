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
  factory,
  winners,
}: {
  game?: Game;
  jackpot?: Jackpot;
  factory?: JackpotFactory;
  winners?: JackpotWinner[];
}) => {
  const { chain } = useChain();
  const numsAddress = getNumsAddress(chain.id);
  const rewardAddress = getContractAddress(chain.id, "nums", "MockRewardToken");
  const { controllers, findController } = useControllers();

  const { numsBalance, tokenBalance } = useMemo(() => {
    let tokenBalance = 0n;

    if (jackpot?.token.isSome()) {
      //
      const token = jackpot.token.unwrap();

      switch ((token.ty as CairoCustomEnum).activeVariant()) {
        case "ERC20":
          const values = (token.ty as CairoCustomEnum).variant[
            "ERC20"
          ] as TokenTypeERC20;
          tokenBalance = BigInt(values.amount) / 10n ** 18n;
          break;
        default:
          break;
      }
    }

    const numsBalance = BigInt(jackpot?.nums_balance || 0) / 10n ** 18n;

    return {
      name,
      numsBalance,
      tokenBalance,
    };
  }, [jackpot]);

  const winnersNames = useMemo(() => {
    if (winners?.length === 0) return "None";
    return winners
      ?.map((i) => {
        const controller = findController(i.player);
        const name = controller ? controller.username : shortAddress(i.player);
        return name;
      })
      .join(", ");
  }, [winners]);

  const [open, setOpen] = useState(false);
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
      {game && jackpot && <JackpotDetails jackpotId={jackpot.id} w="full"/>}

      {/* <Spacer /> */}

      {/* {game && (
        <VStack gap={0} alignItems="center">
          <Text w="auto" fontSize="xs">
            LVL {Number(game.max_slots) - Number(game.remaining_slots)}
          </Text>
          <Text w="auto" fontFamily="Ekamai" fontSize="16px">
            + {game?.reward.toLocaleString()} NUMS
          </Text>
        </VStack>
      )} */}

      {/* <Spacer maxW="20px" />
      <Box fontFamily="Ekamai" fontSize="16px">
        <VStack alignItems="flex-end">
          <TokenBalance contractAddress={numsAddress} />
          <TokenBalance contractAddress={rewardAddress} />
        </VStack>
      </Box> */}
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
