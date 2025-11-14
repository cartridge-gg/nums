import { createDojoConfig } from "@dojoengine/core";
import { mainnet, sepolia } from "@starknet-react/chains";
import { shortString } from "starknet";
import manifestMainnet from "../../manifest_mainnet.json"; // todo: update when deployed
import manifestSepolia from "../../manifest_sepolia.json";

export const NAMESPACE = "NUMS";
export const DEFAULT_CHAIN = import.meta.env.VITE_DEFAULT_CHAIN;
export const DEFAULT_CHAIN_ID = shortString.encodeShortString(
  import.meta.env.VITE_DEFAULT_CHAIN,
);

export const SEPOLIA_CHAIN_ID = shortString.encodeShortString("SN_SEPOLIA");
export const MAINNET_CHAIN_ID = shortString.encodeShortString("SN_MAIN");

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
  rpcUrl: import.meta.env.VITE_SN_SEPOLIA_RPC_URL,
  toriiUrl: import.meta.env.VITE_SN_SEPOLIA_TORII_URL,
  manifest: manifestSepolia,
});

const dojoConfigMainnet = createDojoConfig({
  rpcUrl: import.meta.env.VITE_SN_MAIN_RPC_URL,
  toriiUrl: import.meta.env.VITE_SN_MAIN_TORII_URL,
  manifest: manifestMainnet,
});

export const dojoConfigs = {
  [SEPOLIA_CHAIN_ID]: dojoConfigSepolia,
  [MAINNET_CHAIN_ID]: dojoConfigMainnet,
};

export const getContractAddress = (
  chainId: bigint,
  namespace: string,
  contractName: string,
) => {
  const chainIdHex = `0x${chainId.toString(16)}`;

  const manifest = manifests[chainIdHex];
  const contract = manifest.contracts.find(
    (i) => i.tag === `${namespace}-${contractName}`,
  );
  if (!contract && contractName === "MockNumsToken") {
    return "0x6d97c1eb0ad331837882af3a7a0cd49b4a8f24603f9ca42dfdcdf6ece0ac56d";
  }
  return contract!.address;
};

export const getVrfAddress = (chainId: bigint) => {
  const decodedChainId = shortString.decodeShortString(
    `0x${chainId.toString(16)}`,
  );
  const fromEnv = import.meta.env[`VITE_${decodedChainId}_VRF`];
  if (fromEnv && BigInt(fromEnv) !== 0n) return fromEnv;
  return getContractAddress(chainId, NAMESPACE, "MockVRF");
};

export const getNumsAddress = (chainId: bigint) => {
  const decodedChainId = shortString.decodeShortString(
    `0x${chainId.toString(16)}`,
  );
  const fromEnv = import.meta.env[`VITE_${decodedChainId}_NUMS_ERC20`];
  if (fromEnv && BigInt(fromEnv) !== 0n) return fromEnv;
  return getContractAddress(chainId, NAMESPACE, "MockNumsToken");
};

export const getGameAddress = (chainId: bigint) => {
  return getContractAddress(chainId, NAMESPACE, "Play");
};
