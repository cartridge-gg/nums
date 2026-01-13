import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useConnect } from "@starknet-react/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { addAddressPadding, num } from "starknet";
import { getNumsAddress, MAINNET_CHAIN_ID } from "@/config";
import { useAudio } from "@/context/audio";
import useChain from "@/hooks/chain";
import { useMintNums } from "@/hooks/useMintNums";
import { useTokens } from "@/hooks/useTokens";

export const useHeader = () => {
  const { chain } = useChain();
  const { address, account, connector } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { isMuted, toggleMute } = useAudio();
  const { mintMockNums } = useMintNums();
  const isMainnet = chain.id === num.toBigInt(MAINNET_CHAIN_ID);
  const numsAddress = getNumsAddress(chain.id);

  const { tokens, balances, getBalance, toDecimal } = useTokens({
    accountAddresses: account?.address
      ? [addAddressPadding(account.address)]
      : [],
    contractAddresses: [addAddressPadding(num.toHex64(numsAddress))],
  });

  const prevBalanceRef = useRef<bigint | undefined>(undefined);
  const balanceDiff = useRef<{ value: bigint }>({ value: 0n });

  const balance: string = useMemo(() => {
    if (!account) return "0";

    const token = tokens.find(
      (i) => BigInt(i.contract_address) === BigInt(numsAddress),
    );
    if (!token) return "0";

    const tokenBalance = getBalance(token);
    if (!tokenBalance) return "0";

    const balanceScaled = toDecimal(token, tokenBalance);

    const diff = balanceScaled - (prevBalanceRef.current || 0n);

    if (diff !== 0n) {
      balanceDiff.current = { value: diff };
      prevBalanceRef.current = balanceScaled;
    }

    return balanceScaled.toString();
  }, [balances, tokens, getBalance, toDecimal, account, numsAddress]);

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
    balance,
    username,
    address,
    isMainnet,
    handleConnect,
    handleOpenProfile,
    mintMockNums,
  };
};
