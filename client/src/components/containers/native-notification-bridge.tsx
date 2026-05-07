import { useAccount, useConnect } from "@starknet-react/core";
import { useEffect, useRef } from "react";

type NativeMessageHandler = {
  postMessage: (message: unknown) => void;
};

type NativeNotificationWindow = Window & {
  webkit?: {
    messageHandlers?: Record<string, NativeMessageHandler | undefined>;
  };
};

export function NativeNotificationBridge() {
  const { account, address, isConnected } = useAccount();
  const { connector } = useConnect();
  const lastPostedKey = useRef("");

  useEffect(() => {
    const connectedAddress = address || account?.address;
    if (!isConnected || !connectedAddress) {
      lastPostedKey.current = "";
      return;
    }

    const postKey = `${connector?.id || "unknown"}:${connectedAddress}`;
    if (lastPostedKey.current === postKey) return;

    const handler = (window as NativeNotificationWindow).webkit
      ?.messageHandlers?.["notification-session-ready"];
    if (!handler) return;

    handler.postMessage({
      source: "starknet-react",
      address: connectedAddress,
      connectorId: connector?.id || "",
    });
    lastPostedKey.current = postKey;
  }, [account?.address, address, connector?.id, isConnected]);

  return null;
}
