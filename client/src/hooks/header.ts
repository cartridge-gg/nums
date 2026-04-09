import type ControllerConnector from "@cartridge/connector/controller";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useNetwork,
} from "@starknet-react/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { num } from "starknet";
import { MAINNET_CHAIN_ID } from "@/config";

export const useHeader = () => {
  const { chain } = useNetwork();
  const { address, connector } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const isMainnet = chain.id === num.toBigInt(MAINNET_CHAIN_ID);

  const [username, setUsername] = useState<string | null>(null);
  const refreshIdRef = useRef(0);
  const controllerConnector = connector as ControllerConnector | undefined;

  const refreshUsername = useCallback(
    async (targetConnector?: ControllerConnector) => {
      const refreshId = ++refreshIdRef.current;
      const activeConnector = targetConnector ?? controllerConnector;

      if (!address || !activeConnector) {
        setUsername(null);
        return null;
      }

      try {
        const nextUsername = await activeConnector.username?.();
        if (refreshId === refreshIdRef.current) {
          setUsername(nextUsername ?? null);
        }
        return nextUsername ?? null;
      } catch {
        if (refreshId === refreshIdRef.current) {
          setUsername(null);
        }
        return null;
      }
    },
    [address, controllerConnector],
  );

  useEffect(() => {
    void refreshUsername();
  }, [refreshUsername]);

  useEffect(() => {
    const handleRefresh = () => {
      void refreshUsername();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        void refreshUsername();
      }
    };

    window.addEventListener("focus", handleRefresh);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleRefresh);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshUsername]);

  const handleConnect = async () => {
    const primaryConnector = connectors[0] as ControllerConnector | undefined;
    if (!primaryConnector) return;

    await connectAsync({ connector: primaryConnector });
    await refreshUsername(primaryConnector);
  };

  const handleOpenProfile = async () => {
    (connector as ControllerConnector)?.controller.openSettings();
  };

  const handleLogout = useCallback(async () => {
    refreshIdRef.current += 1;
    setUsername(null);

    try {
      await controllerConnector?.disconnect?.();
    } finally {
      disconnect();
    }
  }, [controllerConnector, disconnect]);

  return {
    supply: 0n,
    balance: 0,
    faucetBalance: 0,
    shares: 0,
    assets: 0n,
    total: 0n,
    username,
    address,
    isConnected: Boolean(address),
    isMainnet,
    handleConnect,
    handleLogout,
    handleOpenProfile,
    refetchBalances: async () => {},
  };
};
