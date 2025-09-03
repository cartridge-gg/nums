import { useJackpots } from "@/context/jackpots";
import { VStack } from "@chakra-ui/react";
import { useEffect, useMemo } from "react";
import { BigNumberish, CairoCustomEnum, num } from "starknet";
import { TimeAgo } from "./ui/time-ago";
import { TokenTypeERC20 } from "@/bindings";

export const JackpotInfos = ({ jackpotId }: { jackpotId: BigNumberish }) => {
  const { getJackpotById, getFactoryById } = useJackpots();

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
    if (!jackpot) return undefined;

    if (jackpot.token.isSome()) {
      const token = jackpot.token.unwrap();

      switch ((token.ty as CairoCustomEnum).activeVariant()) {
        case "ERC20":
          const values = (token.ty as CairoCustomEnum).variant[
            "ERC20"
          ] as TokenTypeERC20;
          const amount_by_jackpot =
            BigInt(values.amount) / BigInt(values.count) / 10n ** 18n;
          return amount_by_jackpot.toLocaleString();
          break;
        default:
          return undefined;
      }
    }
  }, [jackpot]);

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
      <div>Nums balance: {numsBalance.toLocaleString()}</div>
      {tokenRewards && <div>{tokenRewards} REW</div>}
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
