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
      contractAddresses: [contractAddress],
    },
    true
  );

  useEffect(() => {
    const initAsync = async () => {
      // dat shit not working
      // console.log(address)
      // const tokens = await sdk.client.getTokens({
      //   contract_addresses: [num.toHex64(address)],
      //   token_ids: [],
      //   pagination: {
      //     cursor: undefined,
      //     direction: "Backward",
      //     limit: 10,
      //     order_by: [],
      //   },
      // });
      // const tokens = await sdk.getTokens({
      //   // contractAddresses: [num.toHex64(address)],
      // });
      // console.log("tokens", tokens);
    };
    initAsync();
  }, []);

  const numsBalance = useMemo(() => {
    //
    // // should work, but not token returned :/
    //

    // const token = tokens.find(
    //   (i) => BigInt(i.contract_address) === BigInt(address)
    // );
    // if (!token) return 0;

    // const balance = getBalance(token);
    // if (!balance) return 0;

    // return toDecimal(token, balance);

    const balance = balances.find(
      (i) =>
        BigInt(i.contract_address) === BigInt(contractAddress) &&
        BigInt(i.account_address) === BigInt(account?.address || 0)
    );
    if (!balance) return 0;

    return (BigInt(balance.balance) / 10n ** 18n).toLocaleString();
  }, [balances, tokens, getBalance, toDecimal, account]);

  return (
    <div>
      {numsBalance} {symbol}
    </div>
  );
};
