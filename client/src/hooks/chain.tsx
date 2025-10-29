import type { Chain } from "@starknet-react/chains";
import { useNetwork, useSwitchChain } from "@starknet-react/core";
import { useCallback, useState } from "react";
import { num } from "starknet";
import { chainName, MAINNET_CHAIN_ID } from "@/config";
import useToast from "@/hooks/toast";

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
      chainId: MAINNET_CHAIN_ID,
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
    [chain],
  );

  const requestStarknet = useCallback(
    async (silent?: boolean) => {
      if (chain.id === num.toBigInt(MAINNET_CHAIN_ID)) {
        return;
      }

      await requestChain(MAINNET_CHAIN_ID, silent);
    },
    [chain],
  );

  return {
    chain,
    error,
    requestChain,
    requestStarknet,
  };
};

export default useChain;
