import type ControllerConnector from "@cartridge/connector/controller";
import type { BundleOptions } from "@cartridge/controller";
import { useAccount } from "@starknet-react/core";
import { useCallback } from "react";
import { PLAY_CHAIN_ID, SETTLEMENT_CHAIN_ID } from "@/config";

export const useOpenBundleOnSettlement = () => {
  const { connector } = useAccount();
  return useCallback(
    async (
      bundleId: number,
      registry: string,
      options?: BundleOptions,
    ): Promise<void> => {
      if (!connector) {
        throw new Error("Wallet not connected — cannot open bundle");
      }
      const controller = (connector as unknown as ControllerConnector)
        .controller;
      await controller.switchStarknetChain(SETTLEMENT_CHAIN_ID);
      try {
        await controller.openBundle(bundleId, registry, options);
      } finally {
        await controller.switchStarknetChain(PLAY_CHAIN_ID);
      }
    },
    [connector],
  );
};
