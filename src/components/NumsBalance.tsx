import { getNumsAddress } from "@/config";
import useChain from "@/hooks/chain";
import { useTokens } from "@/hooks/useTokens";
import { useAccount } from "@starknet-react/core";
import { useMemo } from "react";

export const NumsBalance = () => {
  const { account } = useAccount();

  const { chain } = useChain();
  const numsAddress = getNumsAddress(chain.id);

  const { tokens, balances, getBalance, toDecimal } = useTokens(
    {
      accountAddresses: [account?.address || "0x0"],
      contractAddresses: [numsAddress],
    },
    true
  );

  const numsBalance = useMemo(() => {
    //
    // // should work, but not token returned :/
    //

    // const token = tokens.find(
    //   (i) => BigInt(i.contract_address) === BigInt(numsAddress)
    // );
    // if (!token) return 0;

    // const balance = getBalance(token);
    // if (!balance) return 0;

    // return toDecimal(token, balance);

    const balance = balances.find(
      (i) =>
        BigInt(i.contract_address) === BigInt(numsAddress) &&
        BigInt(i.account_address) === BigInt(account?.address || 0)
    );
    if (!balance) return 0;

    return (BigInt(balance.balance) / 10n ** 18n).toLocaleString();
  }, [balances, tokens, getBalance, toDecimal, account]);

  return <div>{numsBalance} NUMS</div>;
};
