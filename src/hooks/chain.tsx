import { useCallback, useState } from "react";
import { useNetwork, useSwitchChain } from "@starknet-react/core";
import { num, shortString } from "starknet";
import { Chain } from "@starknet-react/chains";
import useToast from "./toast";

// mock starknet chain id
export const STARKNET_CHAIN_ID =
  shortString.encodeShortString("WP_NUMS_STARKNET");
export const APPCHAIN_CHAIN_ID =
  shortString.encodeShortString("WP_NUMS_APPCHAIN");

const chainName = {
  [STARKNET_CHAIN_ID]: "Starknet Mainnet",
  [APPCHAIN_CHAIN_ID]: "Nums Chain",
};

// export useChain interface
export interface UseChain {
  chain: Chain;
  error: Error | undefined;
  requestChain: (chainId: string) => void;
  requestStarknet: () => void;
  requestAppchain: () => void;
}

const useChain = () => {
  const [error, setError] = useState<Error>();
  const { showChainSwitch, showError } = useToast();
  const { chain } = useNetwork();
  const { switchChainAsync } = useSwitchChain({
    params: {
      chainId: APPCHAIN_CHAIN_ID,
    },
  });

  const requestChain = useCallback(
    async (chainId: string) => {
      if (chain.id === num.toBigInt(chainId)) {
        showChainSwitch(chainName[chainId]);
        return;
      }

      try {
        const res = await switchChainAsync({ chainId });
        if (!res) {
          showError("Failed to switch chain");
          return;
        }

        showChainSwitch(chainName[chainId]);
      } catch (e) {
        setError(e as Error);
        console.error(e);
      }
    },
    [chain],
  );

  const requestStarknet = useCallback(async () => {
    if (chain.id === num.toBigInt(STARKNET_CHAIN_ID)) {
      return;
    }

    requestChain(STARKNET_CHAIN_ID);
  }, [chain]);

  const requestAppchain = useCallback(async () => {
    if (chain.id === num.toBigInt(APPCHAIN_CHAIN_ID)) {
      return;
    }

    requestChain(APPCHAIN_CHAIN_ID);
  }, [chain]);

  return {
    chain,
    error,
    requestChain,
    requestStarknet,
    requestAppchain,
  };
};

export default useChain;
