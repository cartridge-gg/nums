import { useJackpots } from "@/context/jackpots";
import { VStack, HStack, Text, Tooltip } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { BigNumberish, CairoCustomEnum, num } from "starknet";
import { TimeAgo } from "./ui/time-ago";
import { TokenTypeERC20 } from "@/bindings";
import { getSwapQuote } from "@/utils/ekubo";
import { getNumsAddress, STRK_CONTRACT_ADDRESS } from "@/config";
import { InfoIcon } from "./icons/Info";
import useChain from "@/hooks/chain";

// USDC token address on Starknet mainnet
const USDC_ADDRESS = "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8";

export const JackpotInfos = ({ jackpotId }: { jackpotId: BigNumberish }) => {
  const { getJackpotById, getFactoryById } = useJackpots();
  const { chain } = useChain();
  const [usdcValue, setUsdcValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const { jackpot, factory } = useMemo(() => {
    const jackpot = getJackpotById(Number(jackpotId));
    const factory = getFactoryById(Number(jackpot?.factory_id));

    return { jackpot, factory };
  }, [jackpotId, getJackpotById]);

  const numsBalance = useMemo(() => {
    if (!jackpot) return 0;
    return BigInt(jackpot?.nums_balance) / 10n ** 18n;
  }, [jackpot]);

  const tokenRewards = useMemo(() => {
    if (!jackpot) return 0n;

    if (jackpot.token.isSome()) {
      const token = jackpot.token.unwrap();

      switch ((token.ty as CairoCustomEnum).activeVariant()) {
        case "ERC20":
          const values = (token.ty as CairoCustomEnum).variant[
            "ERC20"
          ] as TokenTypeERC20;
          const amount_by_jackpot = BigInt(values.amount) / 10n ** 18n;
          return amount_by_jackpot;
          break;
        default:
          return 0n;
      }
    }
    return 0n;
  }, [jackpot]);

  // Fetch USDC quotes for NUMS and STRK tokens
  useEffect(() => {
    const fetchUSDCValue = async () => {
      if (numsBalance === 0n && tokenRewards === 0n) {
        setUsdcValue(0);
        return;
      }

      setLoading(true);
      try {
        const numsAddress = getNumsAddress(chain.id);
        let totalUsdcValue = 0;

        // Get NUMS to USDC quote if there's NUMS balance
        if (numsBalance > 0n) {
          const numsAmount = Number(numsBalance) * 1e18; // Convert back to wei
          const numsQuote = await getSwapQuote(numsAmount, numsAddress, USDC_ADDRESS);
          if (numsQuote.total) {
            // The total is in USDC units (6 decimals)
            totalUsdcValue += Math.abs(numsQuote.total) / 1e6;
          }
        }

        // Get STRK to USDC quote if there's STRK balance
        if (tokenRewards > 0n) {
          const strkAmount = Number(tokenRewards) * 1e18; // Convert back to wei
          const strkQuote = await getSwapQuote(strkAmount, STRK_CONTRACT_ADDRESS, USDC_ADDRESS);
          if (strkQuote.total) {
            // The total is in USDC units (6 decimals)
            totalUsdcValue += Math.abs(strkQuote.total) / 1e6;
          }
        }

        setUsdcValue(totalUsdcValue);
      } catch (error) {
        console.error("Error fetching USDC quotes:", error);
        setUsdcValue(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUSDCValue();
  }, [numsBalance, tokenRewards, chain.id]);

  if (!jackpot || !factory) return <div>Invalid Jackpot</div>;
  return (
    <VStack
      border="solid 1px"
      p={1}
      gap={1}
      fontSize="xs"
      position="absolute"
      top={"95px"}
      left={"0px"}
      width="auto"
      zIndex={99}
      userSelect="text"
      //   pointerEvents="none"
    >
      <div>Jackpot #{jackpot?.id.toString()}</div>
      {/* @ts-ignore */}
      <div>
        Mode {jackpot.mode as unknown as string} (min slots{" "}
        {factory.min_slots.toString()})
      </div>
      <Tooltip
        label={
          <VStack gap={0} alignItems="flex-start">
            <Text>{numsBalance.toLocaleString()} NUMS</Text>
            {tokenRewards > 0n && (
              <Text>{tokenRewards.toLocaleString()} STRK</Text>
            )}
          </VStack>
        }
        placement="right"
        hasArrow
      >
        <HStack>
          <Text>
            Total Value: {loading ? "Loading..." : usdcValue !== null ? `$${usdcValue.toFixed(2)}` : "N/A"}
          </Text>
          <InfoIcon props={{ boxSize: "12px" }} />
        </HStack>
      </Tooltip>
      {Number(jackpot.total_winners) > 0 && (
        <>
          <div>
            Winners count: {jackpot.total_winners.toString()}/
            {factory.max_winners.toString()}
          </div>
        </>
      )}
      <div>Best score: {jackpot.best_score.toString()}</div>
      <div>
        Started <TimeAgo date={new Date(Number(jackpot.created_at) * 1_000)} />
      </div>
      <div>
        End <TimeAgo date={new Date(Number(jackpot.end_at) * 1_000)} />
      </div>
      {/* <div>{JSON.stringify(jackpot, bigIntSerializer, 2)}</div>
      <div>{JSON.stringify(factory, bigIntSerializer, 2)}</div> */}
    </VStack>
  );
};
