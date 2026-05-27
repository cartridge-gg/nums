import { createDojoConfig } from "@dojoengine/core";
import { type Chain, mainnet, sepolia } from "@starknet-react/chains";
import { shortString } from "starknet";
import manifestAppchain from "../../manifest_appchain.json";
import manifestMainnet from "../../manifest_mainnet.json";
import manifestSepolia from "../../manifest_sepolia.json";
import { NAMESPACE } from "@/constants";

export const DEFAULT_CHAIN = import.meta.env.VITE_DEFAULT_CHAIN;
export const DEFAULT_CHAIN_ID = shortString.encodeShortString(
  import.meta.env.VITE_DEFAULT_CHAIN,
);

export const PLAY_CHAIN_ID = DEFAULT_CHAIN_ID;
export const SETTLEMENT_CHAIN_ID = shortString.encodeShortString(
  import.meta.env.VITE_SETTLEMENT_CHAIN,
);

export const USDC_ADDRESS =
  "0x033068f6539f8e6e6b131e6b2b814e6c34a5224bc66947c47dab9dfee93b35fb";
export const SEPOLIA_CHAIN_ID = shortString.encodeShortString("SN_SEPOLIA");
export const MAINNET_CHAIN_ID = shortString.encodeShortString("SN_MAIN");
export const APPCHAIN_CHAIN_ID = shortString.encodeShortString(
  "NUMS_APPCHAIN_SEPOLIA",
);

type Manifest = typeof manifestSepolia;

type ChainConfig = {
  shortName: string;
  displayName: string;
  chain: Chain;
  manifest: Manifest;
  rpcUrl: string;
  toriiUrl: string;
};

const appchainRpcUrl = import.meta.env.VITE_NUMS_APPCHAIN_SEPOLIA_RPC_URL;
const appchainToriiUrl = import.meta.env.VITE_NUMS_APPCHAIN_SEPOLIA_TORII_URL;

const appchain: Chain = {
  id: BigInt(APPCHAIN_CHAIN_ID),
  network: "nums-appchain-sepolia",
  name: "Nums Appchain (Sepolia)",
  nativeCurrency: {
    address:
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  testnet: true,
  rpcUrls: {
    default: { http: [] },
    public: { http: appchainRpcUrl ? [appchainRpcUrl] : [] },
  },
  paymasterRpcUrls: {
    avnu: { http: [] },
  },
};

const chainConfigs: Record<string, ChainConfig> = {
  [SEPOLIA_CHAIN_ID]: {
    shortName: "SN_SEPOLIA",
    displayName: "Starknet Sepolia",
    chain: sepolia,
    manifest: manifestSepolia,
    rpcUrl: import.meta.env.VITE_SN_SEPOLIA_RPC_URL,
    toriiUrl: import.meta.env.VITE_SN_SEPOLIA_TORII_URL,
  },
  [MAINNET_CHAIN_ID]: {
    shortName: "SN_MAIN",
    displayName: "Starknet Mainnet",
    chain: mainnet,
    manifest: manifestMainnet as Manifest,
    rpcUrl: import.meta.env.VITE_SN_MAIN_RPC_URL,
    toriiUrl: import.meta.env.VITE_SN_MAIN_TORII_URL,
  },
  [APPCHAIN_CHAIN_ID]: {
    shortName: "NUMS_APPCHAIN_SEPOLIA",
    displayName: "Nums Appchain (Sepolia)",
    chain: appchain,
    manifest: manifestAppchain as Manifest,
    rpcUrl: appchainRpcUrl,
    toriiUrl: appchainToriiUrl,
  },
};

for (const [role, id] of [
  ["VITE_DEFAULT_CHAIN", PLAY_CHAIN_ID],
  ["VITE_SETTLEMENT_CHAIN", SETTLEMENT_CHAIN_ID],
] as const) {
  const cfg = chainConfigs[id];
  if (!cfg) {
    throw new Error(
      `Chain ${id} (from ${role}) is not registered in chainConfigs`,
    );
  }
  if (!cfg.rpcUrl) {
    throw new Error(
      `Missing RPC URL for ${cfg.shortName} (set VITE_${cfg.shortName}_RPC_URL); required for ${role}`,
    );
  }
  if (!cfg.toriiUrl) {
    throw new Error(
      `Missing Torii URL for ${cfg.shortName} (set VITE_${cfg.shortName}_TORII_URL); required for ${role}`,
    );
  }
}

const mapChainConfigs = <T>(fn: (cfg: ChainConfig) => T): Record<string, T> =>
  Object.fromEntries(
    Object.entries(chainConfigs).map(([id, cfg]) => [id, fn(cfg)]),
  );

export const chainName = mapChainConfigs((cfg) => cfg.displayName);
export const manifests = mapChainConfigs((cfg) => cfg.manifest);
export const chains = mapChainConfigs((cfg) => cfg.chain);
export const dojoConfigs = mapChainConfigs((cfg) =>
  createDojoConfig({
    rpcUrl: cfg.rpcUrl,
    toriiUrl: cfg.toriiUrl,
    manifest: cfg.manifest,
  }),
);

const getChainConfig = (chainId: bigint): ChainConfig => {
  const chainIdHex = `0x${chainId.toString(16)}`;
  const cfg = chainConfigs[chainIdHex];
  if (!cfg) {
    throw new Error(`Unsupported chain id: ${chainIdHex}`);
  }
  return cfg;
};

export const getEkuboUrl = (chainId: bigint) => {
  return `https://prod-api-quoter.ekubo.org/${chainId.toString(10)}`;
};

export const getContractAddress = (
  chainId: bigint,
  namespace: string,
  contractName: string,
) => {
  const { manifest } = getChainConfig(chainId);
  const contract = manifest.contracts.find(
    (i) => i.tag === `${namespace}-${contractName}`,
  );
  if (!contract && contractName === "MockNumsToken") {
    return "0x6d97c1eb0ad331837882af3a7a0cd49b4a8f24603f9ca42dfdcdf6ece0ac56d";
  }
  return contract!.address;
};

export const getVrfAddress = (chainId: bigint) => {
  const { shortName } = getChainConfig(chainId);
  const fromEnv = import.meta.env[`VITE_${shortName}_VRF`];
  if (fromEnv && BigInt(fromEnv) !== 0n) return fromEnv;
  return getContractAddress(chainId, NAMESPACE, "MockVRF");
};

export const getTokenAddress = (chainId: bigint) => {
  return getContractAddress(chainId, NAMESPACE, "Token");
};

export const getFaucetAddress = (chainId: bigint) => {
  const { shortName } = getChainConfig(chainId);
  const fromEnv = import.meta.env[`VITE_${shortName}_QUOTE`];
  if (fromEnv && BigInt(fromEnv) !== 0n) return fromEnv;
  return getContractAddress(chainId, NAMESPACE, "Faucet");
};

export const getVaultAddress = (chainId: bigint) => {
  return getContractAddress(chainId, NAMESPACE, "Vault");
};

export const getGameAddress = (chainId: bigint) => {
  return getContractAddress(chainId, NAMESPACE, "Play");
};

export const getSetupAddress = (chainId: bigint) => {
  return getContractAddress(chainId, NAMESPACE, "Setup");
};

export const getCollectionAddress = (chainId: bigint) => {
  return getContractAddress(chainId, NAMESPACE, "Collection");
};
