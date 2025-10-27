import { num, shortString } from "starknet";

import manifestSepolia from "../manifest_sepolia.json"; 
import manifestMainnet from "../manifest_mainnet.json"; // todo: update when deployed
import { Chain, mainnet, sepolia } from "@starknet-react/chains";
import { createDojoConfig } from "@dojoengine/core";

export const NAMESPACE = "NUMS";
export const DEFAULT_CHAIN = import.meta.env.VITE_DEFAULT_CHAIN;
export const DEFAULT_CHAIN_ID = shortString.encodeShortString(
  import.meta.env.VITE_DEFAULT_CHAIN
);

export const SEPOLIA_CHAIN_ID = shortString.encodeShortString("SN_SEPOLIA");
export const MAINNET_CHAIN_ID = shortString.encodeShortString("SN_MAIN");

export const ETH_CONTRACT_ADDRESS =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
export const STRK_CONTRACT_ADDRESS =
  "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D";


export const chainName = {
  [SEPOLIA_CHAIN_ID]: "Starknet Sepolia",
  [MAINNET_CHAIN_ID]: "Starknet Mainnet",
};

export const manifests = {
  [SEPOLIA_CHAIN_ID]: manifestSepolia,
  [MAINNET_CHAIN_ID]: manifestMainnet,
};

export const chains = {
  [SEPOLIA_CHAIN_ID]: sepolia,
  [MAINNET_CHAIN_ID]: mainnet,
};

const dojoConfigSepolia = createDojoConfig({
  rpcUrl: import.meta.env.VITE_SEPOLIA_RPC_URL,
  toriiUrl: import.meta.env.VITE_SEPOLIA_GRAPHQL_URL.replace("/graphql", ""),
  manifest: manifestSepolia,
});

const dojoConfigMainnet = createDojoConfig({
  rpcUrl: import.meta.env.VITE_MAINNET_RPC_URL,
  toriiUrl: import.meta.env.VITE_MAINNET_GRAPHQL_URL.replace("/graphql", ""),
  manifest: manifestMainnet,
});

export const dojoConfigs = {
  [SEPOLIA_CHAIN_ID]: dojoConfigSepolia,
  [MAINNET_CHAIN_ID]: dojoConfigMainnet,
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
  return getContractAddress(chainId, NAMESPACE, "MockVRF");
};

export const getNumsAddress = (chainId: bigint) => {
  const decodedChainId = shortString.decodeShortString(
    `0x${chainId.toString(16)}`
  );
  const fromEnv = import.meta.env[`VITE_${decodedChainId}_NUMS_ERC20`];
  if (fromEnv && BigInt(fromEnv) !== 0n) return fromEnv;
  return getContractAddress(chainId, NAMESPACE, "MockNumsToken");
};
