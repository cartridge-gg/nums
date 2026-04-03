import { createDojoConfig } from "@dojoengine/core";
import { mainnet } from "@starknet-react/chains";
import { shortString } from "starknet";
import manifestMainnet from "../../manifest_mainnet.json";
import { NAMESPACE } from "@/constants";

export const DEFAULT_CHAIN = "SN_MAIN";
export const DEFAULT_CHAIN_ID = shortString.encodeShortString("SN_MAIN");

export const USDC_ADDRESS =
  "0x033068f6539f8e6e6b131e6b2b814e6c34a5224bc66947c47dab9dfee93b35fb";
export const MAINNET_CHAIN_ID = DEFAULT_CHAIN_ID;

export const RPC_URL = "https://api.cartridge.gg/x/starknet/mainnet";
export const TORII_URL = "https://api.cartridge.gg/x/nums-main/torii";

export const chainName = {
  [DEFAULT_CHAIN_ID]: "Starknet Mainnet",
};

export const manifests = {
  [DEFAULT_CHAIN_ID]: manifestMainnet,
};

export const chains = {
  [DEFAULT_CHAIN_ID]: mainnet,
};

const dojoConfig = createDojoConfig({
  rpcUrl: RPC_URL,
  toriiUrl: TORII_URL,
  manifest: manifestMainnet,
});

export const dojoConfigs = {
  [DEFAULT_CHAIN_ID]: dojoConfig,
};

export const getEkuboUrl = (chainId: bigint) => {
  return `https://prod-api-quoter.ekubo.org/${chainId.toString(10)}`;
};

export const getContractAddress = (
  chainId: bigint,
  namespace: string,
  contractName: string,
) => {
  const chainIdHex = `0x${chainId.toString(16)}`;

  const manifest = manifests[chainIdHex];
  if (!manifest) return "0x0";
  const contract = manifest.contracts.find(
    (i) => i.tag === `${namespace}-${contractName}`,
  );
  if (!contract) return "0x0";
  return contract.address;
};

export const getVrfAddress = (_chainId: bigint) => {
  return "0x051fea4450da9d6aee758bdeba88b2f665bcbf549d2c61421aa724e9ac0ced8f";
};

export const getTokenAddress = (chainId: bigint) => {
  return getContractAddress(chainId, NAMESPACE, "Token");
};

export const getFaucetAddress = (chainId: bigint) => {
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
