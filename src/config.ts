import { num, shortString } from "starknet";

import manifestDev from "../contracts/manifest_dev.json";
import manifestSlot from "../contracts/manifest_slot.json";
import manifestSepolia from "../contracts/manifest_dev.json"; // todo: updata when built
import manifestMainnet from "../contracts/manifest_dev.json"; // todo: updata when built
import { Chain, mainnet, sepolia } from "@starknet-react/chains";
import { createDojoConfig } from "@dojoengine/core";

export const DEFAULT_CHAIN = import.meta.env.VITE_DEFAULT_CHAIN;
export const DEFAULT_CHAIN_ID = shortString.encodeShortString(
  import.meta.env.VITE_DEFAULT_CHAIN
);

export const SEPOLIA_CHAIN_ID = shortString.encodeShortString("SN_SEPOLIA");
export const MAINNET_CHAIN_ID = shortString.encodeShortString("SN_MAIN");
export const SLOT_CHAIN_ID = shortString.encodeShortString("WP_NUMS");
export const KATANA_CHAIN_ID = shortString.encodeShortString("KATANA");

export const ETH_CONTRACT_ADDRESS =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
export const STRK_CONTRACT_ADDRESS =
  "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D";

export const katanaChain: Chain = {
  id: num.toBigInt(KATANA_CHAIN_ID),
  network: "katana",
  name: "Katana",
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_KATANA_RPC_URL],
    },
    public: {
      http: [import.meta.env.VITE_KATANA_RPC_URL],
    },
  },
  paymasterRpcUrls: {
    avnu: {
      http: [import.meta.env.VITE_KATANA_RPC_URL],
    },
  },
  nativeCurrency: {
    address: STRK_CONTRACT_ADDRESS,
    name: "Starknet",
    symbol: "STRK",
    decimals: 18,
  },
};

export const slotChain: Chain = {
  id: num.toBigInt(SLOT_CHAIN_ID),
  network: "slot",
  name: "slot",
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_SLOT_RPC_URL],
    },
    public: {
      http: [import.meta.env.VITE_SLOT_RPC_URL],
    },
  },
  paymasterRpcUrls: {
    avnu: {
      http: [import.meta.env.VITE_SLOT_RPC_URL],
    },
  },
  nativeCurrency: {
    address: STRK_CONTRACT_ADDRESS,
    name: "Starknet",
    symbol: "STRK",
    decimals: 18,
  },
};

export const chainName = {
  [SEPOLIA_CHAIN_ID]: "Starknet Sepolia",
  [MAINNET_CHAIN_ID]: "Starknet Mainnet",
  [SLOT_CHAIN_ID]: "Nums Slot",
  [KATANA_CHAIN_ID]: "Nums Katana",
};

export const manifests = {
  [SEPOLIA_CHAIN_ID]: manifestSepolia,
  [MAINNET_CHAIN_ID]: manifestMainnet,
  [SLOT_CHAIN_ID]: manifestSlot,
  [KATANA_CHAIN_ID]: manifestDev,
};

export const chains = {
  [SEPOLIA_CHAIN_ID]: sepolia,
  [MAINNET_CHAIN_ID]: mainnet,
  [SLOT_CHAIN_ID]: slotChain,
  [KATANA_CHAIN_ID]: katanaChain,
};

const dojoConfigDev = createDojoConfig({
  rpcUrl: import.meta.env.VITE_KATANA_RPC_URL,
  toriiUrl: import.meta.env.VITE_KATANA_GRAPHQL_URL.replace("/graphql", ""),
  manifest: manifestDev,
});

const dojoConfigSlot = createDojoConfig({
  rpcUrl: import.meta.env.VITE_SLOT_RPC_URL,
  toriiUrl: import.meta.env.VITE_SLOT_GRAPHQL_URL.replace("/graphql", ""),
  manifest: manifestSlot,
});

const dojoConfigSepolia = createDojoConfig({
  rpcUrl: import.meta.env.VITE_SEPOLIA_RPC_URL,
  toriiUrl: import.meta.env.VITE_SEPOLIA_GRAPHQL_URL.replace("/graphql", ""),
  manifest: manifestSlot,
});

const dojoConfigMainnet = createDojoConfig({
  rpcUrl: import.meta.env.VITE_MAINNET_RPC_URL,
  toriiUrl: import.meta.env.VITE_MAINNET_GRAPHQL_URL.replace("/graphql", ""),
  manifest: manifestSlot,
});

export const dojoConfigs = {
  [SEPOLIA_CHAIN_ID]: dojoConfigSepolia,
  [MAINNET_CHAIN_ID]: dojoConfigMainnet,
  [SLOT_CHAIN_ID]: dojoConfigSlot,
  [KATANA_CHAIN_ID]: dojoConfigDev,
};

export const getContractAddress = (
  chainId: bigint,
  namespace: string,
  contractName: string
) => {
  const chainIdHex = `0x${chainId.toString(16)}`;

  const manifest = manifests[chainIdHex];
  const contract = manifest.contracts.find(
    (i) => i.tag === `${namespace}-${contractName}`
  );
  return contract!.address;
};

export const getVrfAddress = (chainId: bigint) => {
  const decodedChainId = shortString.decodeShortString(
    `0x${chainId.toString(16)}`
  );
  const fromEnv = import.meta.env[`VITE_${decodedChainId}_VRF`];
  if (fromEnv && BigInt(fromEnv) !== 0n) return fromEnv;
  return getContractAddress(chainId, "nums", "MockVRF");
};

export const getNumsAddress = (chainId: bigint) => {
  const decodedChainId = shortString.decodeShortString(
    `0x${chainId.toString(16)}`
  );
  const fromEnv = import.meta.env[`VITE_${decodedChainId}_NUMS_ERC20`];
  if (fromEnv && BigInt(fromEnv) !== 0n) return fromEnv;
  return getContractAddress(chainId, "nums", "MockNumsToken");
};
