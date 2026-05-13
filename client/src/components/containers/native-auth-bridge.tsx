import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useConnect } from "@starknet-react/core";
import { useEffect, useRef } from "react";

const AUTH_CHANGED_EVENT = "cartridge:auth-changed";

type AuthChangedDetail = {
  authenticated?: boolean;
  source?: string;
};

export function NativeAuthBridge() {
  const { isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const isConnectingRef = useRef(false);

  useEffect(() => {
    const handleAuthChanged = (event: Event) => {
      const detail = (event as CustomEvent<AuthChangedDetail>).detail;
      if (detail?.authenticated !== true) return;
      if (isConnected || isConnectingRef.current) return;

      const connector = connectors[0];
      if (!connector) return;

      isConnectingRef.current = true;
      connectAsync({ connector })
        .then(() => {
          (connector as unknown as ControllerConnector).controller?.close?.();
        })
        .finally(() => {
          isConnectingRef.current = false;
        });
    };

    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);
    };
  }, [connectAsync, connectors, isConnected]);

  return null;
}
