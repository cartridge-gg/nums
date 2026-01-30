import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useConnect } from "@starknet-react/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { addAddressPadding, num } from "starknet";
import { getTokenAddress, MAINNET_CHAIN_ID } from "@/config";
import { useAudio } from "@/context/audio";
import useChain from "@/hooks/chain";
import { useTokens } from "@/hooks/tokens";
import { toDecimal } from "@/hooks/tokens";

export const useHeader = () => {
  const { chain } = useChain();
  const { address, account, connector } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { isMuted, toggleMute } = useAudio();
  const isMainnet = chain.id === num.toBigInt(MAINNET_CHAIN_ID);
  const numsAddress = getTokenAddress(chain.id);

  const { tokenContracts, tokenBalances } = useTokens({
    accountAddresses: account?.address
      ? [addAddressPadding(account.address)]
      : [],
    contractAddresses: [addAddressPadding(num.toHex64(numsAddress))],
  });

  const prevBalanceRef = useRef<number | undefined>(undefined);
  const balanceDiff = useRef<{ value: number }>({ value: 0 });

  const { balance, supply }: { balance: string; supply: bigint } =
    useMemo(() => {
      if (!account) return { balance: "0", supply: 0n };

      const token = tokenContracts.find(
        (i) => BigInt(i.contract_address) === BigInt(numsAddress),
      );
      if (!token) return { balance: "0", supply: 0n };

      const tokenBalance = tokenBalances.find(
        (b) =>
          BigInt(b.contract_address) === BigInt(numsAddress) &&
          BigInt(b.account_address) ===
            BigInt(addAddressPadding(account.address)),
      );
      const tokenSupply = BigInt(token?.total_supply ?? "0");
      if (!tokenBalance) return { balance: "0", supply: tokenSupply };

      const balanceScaled = toDecimal(token, tokenBalance);

      const diff = balanceScaled - (prevBalanceRef.current || 0);

      if (diff !== 0) {
        balanceDiff.current = { value: diff };
        prevBalanceRef.current = balanceScaled;
      }

      return {
        balance: balanceScaled.toFixed(0).toLocaleString(),
        supply: tokenSupply,
      };
    }, [tokenBalances, tokenContracts, account, numsAddress]);

  const [username, setUsername] = useState<string | null>(null);
  const controllerConnector = connector as never as ControllerConnector;

  useEffect(() => {
    if (controllerConnector) {
      controllerConnector.username()?.then((username) => {
        setUsername(username);
      });
    }
  }, [controllerConnector]);

  const handleConnect = async () => {
    await connectAsync({ connector: connectors[0] });
  };

  const handleOpenProfile = async () => {
    (connector as ControllerConnector)?.controller.openProfile("inventory");
  };

  return {
    isMuted,
    toggleMute,
    supply,
    balance,
    username,
    address,
    isMainnet,
    handleConnect,
    handleOpenProfile,
  };
};
