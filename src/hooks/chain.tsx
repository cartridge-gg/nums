import { useCallback, useState } from "react";
import { useNetwork, useSwitchChain } from "@starknet-react/core";
import { num, shortString } from "starknet";
import { Chain } from "@starknet-react/chains";
import useToast from "./toast";

// // mock starknet chain id
// export const STARKNET_CHAIN_ID =
//   shortString.encodeShortString("WP_NUMS_STARKNET");
export const SEPOLIA_CHAIN_ID = shortString.encodeShortString("SN_SEPOLIA");
export const MAINNET_CHAIN_ID = shortString.encodeShortString("SN_MAIN");

export const APPCHAIN_CHAIN_ID = shortString.encodeShortString(
  "WP_NUMS_APPCHAIN",
);

const chainName = {
  [SEPOLIA_CHAIN_ID]: "Starknet Sepolia",
  [MAINNET_CHAIN_ID]: "Starknet Mainnet",
  [APPCHAIN_CHAIN_ID]: "Nums Chain",
};

// export useChain interface
export interface UseChain {
  chain: Chain;
  error: Error | undefined;
  requestChain: (chainId: string, silent?: boolean) => void;
  requestStarknet: (silent?: boolean) => void;
  requestAppchain: (silent?: boolean) => void;
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

  const requestAppchain = useCallback(
    async (silent?: boolean) => {
      if (chain.id === num.toBigInt(APPCHAIN_CHAIN_ID)) {
        return;
      }

      await requestChain(APPCHAIN_CHAIN_ID, silent);
    },
    [chain],
  );

  return {
    chain,
    error,
    requestChain,
    requestStarknet,
    requestAppchain,
  };
};

export default useChain;
