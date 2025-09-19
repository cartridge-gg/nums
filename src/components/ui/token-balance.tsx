import {
  getContractAddress,
  getNumsAddress,
  STRK_CONTRACT_ADDRESS,
} from "@/config";
import useChain from "@/hooks/chain";
import { HStack, Image } from "@chakra-ui/react";
import { BigNumberish } from "starknet";
import { LogoIcon } from "../icons/Logo";
import { LuCircleHelp, LuFileQuestion } from "react-icons/lu";

export const TokenBalanceUi = ({
  balance,
  address,
  showIcon = true,
}: {
  balance: BigNumberish;
  address: BigNumberish;
  showIcon?: boolean;
}) => {
  const { chain } = useChain();
  const numsAddress = getNumsAddress(chain.id);
  const rewardAddress = getContractAddress(chain.id, "nums", "MockRewardToken");

  const isNums = BigInt(address) === BigInt(numsAddress);
  const isStrk =
    BigInt(address) === BigInt(STRK_CONTRACT_ADDRESS) ||
    BigInt(address) === BigInt(rewardAddress);
  return (
    <HStack fontFamily="Ekamai" fontSize="16px">
      {balance.toLocaleString()}
      {showIcon && (
        <>
          {isNums && <LogoIcon w={24} h={24} />}
          {isStrk && <Image src="/tokens/strk.png" w="24px" h="24px" />}
          {!isNums && !isStrk && <LuCircleHelp />}
        </>
      )}
    </HStack>
  );
};
