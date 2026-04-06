import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useConnect, useNetwork } from "@starknet-react/core";
import { useEffect, useState } from "react";
import { num } from "starknet";
import { MAINNET_CHAIN_ID } from "@/config";

export const useHeader = () => {
  const { chain } = useNetwork();
  const { address, connector } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const isMainnet = chain.id === num.toBigInt(MAINNET_CHAIN_ID);

  const [username, setUsername] = useState<string | null>(null);
  const controllerConnector = connector as never as ControllerConnector;

  useEffect(() => {
    if (controllerConnector) {
      controllerConnector.username()?.then((nextUsername) => {
        setUsername(nextUsername);
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
    supply: 0n,
    balance: 0,
    faucetBalance: 0,
    shares: 0,
    assets: 0n,
    total: 0n,
    username,
    address,
    isMainnet,
    handleConnect,
    handleOpenProfile,
    refetchBalances: async () => {},
  };
};
