import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useConnect, useNetwork } from "@starknet-react/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { addAddressPadding, num } from "starknet";
import {
  getFaucetAddress,
  getTokenAddress,
  getVaultAddress,
  MAINNET_CHAIN_ID,
} from "@/config";
import { useTokens, toDecimal } from "@/hooks/tokens";

export const useHeader = () => {
  const { chain } = useNetwork();
  const { address, account, connector } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const isMainnet = chain.id === num.toBigInt(MAINNET_CHAIN_ID);
  const numsAddress = getTokenAddress(chain.id);
  const vaultAddress = getVaultAddress(chain.id);
  const faucetAddress = getFaucetAddress(chain.id);

  const { tokenContracts, tokenBalances } = useTokens({
    accountAddresses: account?.address
      ? [addAddressPadding(account.address), addAddressPadding(vaultAddress)]
      : [],
    contractAddresses: [
      addAddressPadding(num.toHex64(numsAddress)),
      addAddressPadding(num.toHex64(vaultAddress)),
      addAddressPadding(num.toHex64(faucetAddress)),
    ],
  });

  const token = useMemo(() => {
    return tokenContracts.find(
      (i) => BigInt(i.contract_address) === BigInt(numsAddress),
    );
  }, [tokenContracts, numsAddress]);

  const vault = useMemo(() => {
    return tokenContracts.find(
      (i) => BigInt(i.contract_address) === BigInt(vaultAddress),
    );
  }, [tokenContracts, vaultAddress]);

  const faucet = useMemo(() => {
    return tokenContracts.find(
      (i) => BigInt(i.contract_address) === BigInt(faucetAddress),
    );
  }, [tokenContracts, faucetAddress]);

  const prevBalanceRef = useRef<number | undefined>(undefined);
  const balanceDiff = useRef<{ value: number }>({ value: 0 });

  const balance = useMemo(() => {
    if (!account || !token) return 0;

    const tokenBalance = tokenBalances.find(
      (b) =>
        BigInt(b.contract_address) === BigInt(numsAddress) &&
        BigInt(b.account_address) ===
          BigInt(addAddressPadding(account.address)),
    );
    if (!tokenBalance) return 0;

    const balanceScaled = toDecimal(token, tokenBalance);

    const diff = balanceScaled - (prevBalanceRef.current || 0);

    if (diff !== 0) {
      balanceDiff.current = { value: diff };
      prevBalanceRef.current = balanceScaled;
    }

    return balanceScaled;
  }, [tokenBalances, token, account, numsAddress]);

  const shares = useMemo(() => {
    if (!account || !vault) return 0;
    const tokenBalance = tokenBalances.find(
      (b) =>
        BigInt(b.contract_address) === BigInt(vaultAddress) &&
        BigInt(b.account_address) ===
          BigInt(addAddressPadding(account.address)),
    );
    if (!tokenBalance) return 0;
    const balanceScaled = toDecimal(vault, tokenBalance);
    return balanceScaled;
  }, [tokenBalances, vault, account, vaultAddress]);

  const assets = useMemo(() => {
    if (!vault) return 0n;
    const tokenBalance = tokenBalances.find(
      (b) =>
        BigInt(b.contract_address) === BigInt(numsAddress) &&
        BigInt(b.account_address) === BigInt(vaultAddress),
    );
    if (!tokenBalance) return 0n;
    return BigInt(tokenBalance?.balance ?? "0");
  }, [tokenBalances, vault, numsAddress, vaultAddress]);

  const faucetBalance = useMemo(() => {
    if (!account || !faucet) return 0;
    const tokenBalance = tokenBalances.find(
      (b) =>
        BigInt(b.contract_address) === BigInt(faucetAddress) &&
        BigInt(b.account_address) ===
          BigInt(addAddressPadding(account.address)),
    );
    if (!tokenBalance) return 0;
    return toDecimal(faucet, tokenBalance);
  }, [tokenBalances, faucet, account, faucetAddress]);

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
    supply: BigInt(token?.total_supply ?? "0"),
    balance,
    faucetBalance,
    shares,
    assets,
    total: BigInt(vault?.total_supply ?? "0"),
    username,
    address,
    isMainnet,
    handleConnect,
    handleOpenProfile,
  };
};
