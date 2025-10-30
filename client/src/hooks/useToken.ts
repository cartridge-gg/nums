import { useAccount } from "@starknet-react/core";
import { useMemo } from "react";
import { num } from "starknet";
import { useTokens } from "./useTokens";

export function useToken(contractAddress: string) {
  const { account } = useAccount();

  const { tokens, balances, getBalance, toDecimal } = useTokens(
    {
      accountAddresses: account?.address ? [account?.address] : [],
      contractAddresses: [num.toHex64(contractAddress)],
    },
    true,
  );

  const { balance, token } = useMemo(() => {
    if (!account)
      return {
        balance: 0,
        token: undefined,
      };

    const token = tokens.find(
      (i) => BigInt(i.contract_address) === BigInt(contractAddress),
    );
    if (!token)
      return {
        balance: 0,
        token,
      };

    const balance = getBalance(token);
    if (!balance)
      return {
        balance: 0,
        token,
      };

    const balanceScaled = toDecimal(token, balance);

    return {
      balance: balanceScaled,
      token,
    };
  }, [balances, tokens, getBalance, toDecimal, account]);

  return {
    balance,
    token,
  };
}
