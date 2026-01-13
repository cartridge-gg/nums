/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEFAULT_CHAIN: string;
  readonly VITE_SN_MAIN_RPC_URL?: string;
  readonly VITE_SN_SEPOLIA_RPC_URL?: string;
  readonly VITE_SN_MAIN_TORII_URL?: string;
  readonly VITE_SN_SEPOLIA_TORII_URL?: string;
  readonly [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
