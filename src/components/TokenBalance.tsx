import useChain from "@/hooks/chain";
import { useDojoSdk } from "@/hooks/dojo";
import { useTokens } from "@/hooks/useTokens";
import { useAccount } from "@starknet-react/core";
import { useEffect, useMemo } from "react";
import { num } from "starknet";

export const TokenBalance = ({
  contractAddress,
  symbol,
}: {
  contractAddress: string;
  symbol: string;
}) => {
  const { account } = useAccount();

  const { tokens, balances, getBalance, toDecimal } = useTokens(
    {
      accountAddresses: account?.address ? [account?.address] : [],
      contractAddresses: [num.toHex64(contractAddress)],
    },
    true
  );

  const numsBalance = useMemo(() => {
    if (!account) return 0;

    const token = tokens.find(
      (i) => BigInt(i.contract_address) === BigInt(contractAddress)
    );
    if (!token) return 0;

    const balance = getBalance(token);
    if (!balance) return 0;

    return toDecimal(token, balance);

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
    <div>
      {numsBalance.toLocaleString()} {symbol}
    </div>
  );
};
