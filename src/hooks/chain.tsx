import { useCallback, useState } from "react";
import { useNetwork, useSwitchChain } from "@starknet-react/core";
import { num } from "starknet";
import { Chain } from "@starknet-react/chains";
import useToast from "./toast";
import { chainName, KATANA_CHAIN_ID, MAINNET_CHAIN_ID } from "@/config";

export interface UseChain {
  chain: Chain;
  error: Error | undefined;
  requestChain: (chainId: string, silent?: boolean) => void;
  requestStarknet: (silent?: boolean) => void;
}

const useChain = () => {
  const [error, setError] = useState<Error>();
  const { showChainSwitch, showError } = useToast();
  const { chain } = useNetwork();
  const { switchChainAsync } = useSwitchChain({
    params: {
      chainId: KATANA_CHAIN_ID,
    },
  });

  const requestChain = useCallback(
    async (chainId: string, silent?: boolean) => {
      if (chain.id === num.toBigInt(chainId) && !silent) {
        showChainSwitch(chainName[chainId]);
        return;
      }

      try {
        const res = await switchChainAsync({ chainId });
        if (!res) {
          showError("Failed to switch chain");
          return;
        }

        if (!silent) {
          showChainSwitch(chainName[chainId]);
        }
      } catch (e) {
        setError(e as Error);
        console.error(e);
      }
    },
    [chain]
  );

  const requestStarknet = useCallback(
    async (silent?: boolean) => {
      if (chain.id === num.toBigInt(MAINNET_CHAIN_ID)) {
        return;
      }

      await requestChain(MAINNET_CHAIN_ID, silent);
    },
    [chain]
  );

  return {
    chain,
    error,
    requestChain,
    requestStarknet,
  };
};

export default useChain;
