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

const AUTH_CHANGED_EVENT = "cartridge:auth-changed";
const CONTROLLER_STORAGE_PREFIX = "@cartridge/";
const CONTROLLER_STORAGE_KEYS = [
  "lastUsedConnector",
  "session",
  "sessionSigner",
  "sessionPolicies",
  "controller_standalone",
  "wagmi.store",
  "wagmi.connected",
  "wagmi.wallet",
  "walletconnect",
] as const;

function isIosAppWebView() {
  if (typeof navigator === "undefined") return false;
  return navigator.userAgent.includes("PWAShell");
}

function dispatchAuthChanged(authenticated: boolean, source: string) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(AUTH_CHANGED_EVENT, {
      detail: { authenticated, source },
    }),
  );
}

function clearControllerPersistence() {
  if (typeof window === "undefined") return;

  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (let i = storage.length - 1; i >= 0; i -= 1) {
      const key = storage.key(i);
      if (key?.startsWith(CONTROLLER_STORAGE_PREFIX)) {
        storage.removeItem(key);
      }
    }

    for (const key of CONTROLLER_STORAGE_KEYS) {
      storage.removeItem(key);
    }
  }
}

export const useHeader = () => {
  const { chain } = useNetwork();
  const { address, connector } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const isMainnet = chain.id === num.toBigInt(MAINNET_CHAIN_ID);

  const [username, setUsername] = useState<string | null>(null);
  const refreshIdRef = useRef(0);
  const controllerConnector = connector as ControllerConnector | undefined;

  const refreshUsername = useCallback(async () => {
    const refreshId = ++refreshIdRef.current;

    if (!address || !controllerConnector) {
      setUsername(null);
      return null;
    }

    try {
      const nextUsername = await controllerConnector.username();
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
  }, [address, controllerConnector]);

  useEffect(() => {
    void refreshUsername();
  }, [refreshUsername]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleAuthChanged = () => {
      void refreshUsername();
    };
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        void refreshUsername();
      }
    };

    window.addEventListener("focus", handleAuthChanged);
    window.addEventListener("storage", handleAuthChanged);
    window.addEventListener(
      AUTH_CHANGED_EVENT,
      handleAuthChanged as EventListener,
    );
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleAuthChanged);
      window.removeEventListener("storage", handleAuthChanged);
      window.removeEventListener(
        AUTH_CHANGED_EVENT,
        handleAuthChanged as EventListener,
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshUsername]);

  const handleConnect = async () => {
    const primaryConnector = connectors[0] as ControllerConnector | undefined;
    if (!primaryConnector) return;

    if (isIosAppWebView()) {
      primaryConnector.controller.open({ redirectUrl: window.location.href });
      return;
    }

    await connectAsync({ connector: primaryConnector });
    await refreshUsername();
    dispatchAuthChanged(true, "connect");
  };

  const handleOpenProfile = async () => {
    controllerConnector?.controller.openSettings();
  };

  const handleLogout = async () => {
    setUsername(null);
    clearControllerPersistence();

    try {
      await controllerConnector?.disconnect?.();
    } finally {
      disconnect();
      dispatchAuthChanged(false, "logout");
    }
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
    handleLogout,
    handleOpenProfile,
    refetchBalances: async () => {},
  };
};
