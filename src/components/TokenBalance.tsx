import useChain from "@/hooks/chain";
import { useDojoSdk } from "@/hooks/dojo";
import { useTokens } from "@/hooks/useTokens";
import { useAccount } from "@starknet-react/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { addAddressPadding, num, uint256 } from "starknet";
import { TokenBalanceUi } from "./ui/token-balance";
import { ShowDiff } from "./ShowDiff";
import { Box } from "@chakra-ui/react";

export const TokenBalance = ({
  contractAddress,
  showIcon = true,
}: {
  contractAddress: string;
  showIcon?: boolean;
}) => {
  const { account } = useAccount();

  const { tokens, balances, getBalance, toDecimal } = useTokens(
    {
      accountAddresses: account?.address ? [addAddressPadding(account.address)] : [],
      contractAddresses: [addAddressPadding(num.toHex64(contractAddress))],
    },
    true
  );

  const prevBalanceRef = useRef<number | undefined>(undefined);
  const balanceDiff = useRef<{ value: number }>({ value: 0 });

  const balance = useMemo(() => {
    if (!account) return 0;

    const token = tokens.find(
      (i) => BigInt(i.contract_address) === BigInt(contractAddress)
    );
    if (!token) return 0;

    const balance = getBalance(token);
    if (!balance) return 0;

    const balanceScaled = toDecimal(token, balance);

    const diff = Math.round(balanceScaled - (prevBalanceRef.current || 0));

    if (diff !== 0) {
      balanceDiff.current = { value: diff };
      prevBalanceRef.current = balanceScaled;
    }

    return balanceScaled;
    // console.log(balances)

    // const balance = balances.find(
    //   (i) =>
    //     BigInt(i.contract_address) === BigInt(contractAddress) &&
    //     BigInt(i.account_address) === BigInt(account?.address || 0)
    // );
    // if (!balance) return 0;

    // return (BigInt(balance.balance) / 10n ** 18n).toLocaleString();
  }, [balances, tokens, getBalance, toDecimal, account]);

  if (!account) return null;
  return (
    <Box position="relative">
      <TokenBalanceUi address={contractAddress} balance={balance} showIcon={showIcon} />
      <ShowDiff x={"-30px"} y={"20px"} obj={balanceDiff.current} />
    </Box>
  );
};
