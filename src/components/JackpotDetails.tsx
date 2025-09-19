import { useJackpots } from "@/context/jackpots";
import {
  HStack,
  Spacer,
  VStack,
  Text,
  Image,
  StackProps,
  ChakraProviderProps,
} from "@chakra-ui/react";
import { ComponentProps, CSSProperties, useEffect, useMemo } from "react";
import { BigNumberish, CairoCustomEnum, num } from "starknet";
import { TimeAgo } from "./ui/time-ago";
import { Game, TokenTypeERC20 } from "@/bindings";
import { LogoIcon } from "./icons/Logo";
import { TimeCountdown } from "./TimeCountdown";

export const JackpotDetails = ({
  jackpotId,
  game,
  computedId,
  ...props
}: {
  jackpotId: BigNumberish;
  game?: Game;
  computedId?: number;
  props?: ComponentProps<"div">;
}) => {
  const { getJackpotById, getFactoryById } = useJackpots();

  const { jackpot, factory } = useMemo(() => {
    const jackpot = getJackpotById(Number(jackpotId));
    const factory = getFactoryById(Number(jackpot?.factory_id));

    return { jackpot, factory };
  }, [jackpotId, getJackpotById]);

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
      numsBalance,
      tokenBalance,
    };
  }, [jackpot]);

  if (!jackpot || !factory) return null;
  return (
    <HStack  {...props}>
      <VStack
        gap={0}
        alignItems="flex-start"
        justify="flex-start"
        fontSize="18px"
        h="full"
      >
        <HStack fontFamily="Ekamai" fontSize="16px">
          {numsBalance.toLocaleString()} <LogoIcon w={24} h={24} />
        </HStack>
        {tokenBalance !== undefined && tokenBalance > 0 && (
          <HStack fontFamily="Ekamai" fontSize="16px">
            {tokenBalance.toLocaleString()}
            <Image src="/tokens/strk.png" w="24px" h="24px" />
          </HStack>
        )}
      </VStack>

      <Spacer minW="0px" />
      
      <HStack>
        {game && (
          <>
            <VStack gap={0} alignItems="flex-start">
              <Text w="auto" fontSize="xs" lineHeight="24px">
                LVL {game.level.toString()}
              </Text>
              <Text
                w="auto"
                fontFamily="Ekamai"
                fontSize="16px"
                display={["none", "flex"]}
              >
                + {game?.reward.toLocaleString()} NUMS
              </Text>
            </VStack>
            <Spacer minW="20px" />
          </>
        )}
        <VStack gap={0} alignItems="flex-end">
          <HStack w="full" justifyContent="space-between">
            <Text>Ends in: </Text>
            <TimeCountdown timestampSec={Number(jackpot?.end_at || 0)} />
          </HStack>
        </VStack>
      </HStack>
    </HStack>
  );
};
