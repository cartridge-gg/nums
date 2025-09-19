import { useJackpots } from "@/context/jackpots";
import {
  HStack,
  Spacer,
  VStack,
  Text,
  Image,
  Box,
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
      <HStack
        gap={3}
        alignItems="center"
        justify="flex-start"
        h="full"
      >
        <Text fontSize="18px" fontWeight="500">
          Jackpot:
        </Text>
        <HStack gap={2} alignItems="center">
          <HStack fontFamily="Ekamai" fontSize="22px">
            {numsBalance.toLocaleString()} <LogoIcon w={24} h={24} />
          </HStack>
          {tokenBalance !== undefined && tokenBalance > 0 && (
            <>
              <Text fontSize="22px">+</Text>
              <HStack fontFamily="Ekamai" fontSize="22px">
                {tokenBalance.toLocaleString()}
                <Image src="/tokens/strk.png" w="24px" h="24px" />
              </HStack>
            </>
          )}
        </HStack>
      </HStack>

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
        <HStack gap={2} alignItems="center">
          <Text fontSize="18px" fontWeight="500">Ends in:</Text>
          <Box fontSize="22px" fontFamily="Ekamai">
            <TimeCountdown timestampSec={Number(jackpot?.end_at || 0)} />
          </Box>
        </HStack>
      </HStack>
    </HStack>
  );
};
