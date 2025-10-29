// Dojo related imports
import type { SDK } from "@dojoengine/sdk";
import { DojoSdkProvider } from "@dojoengine/sdk/react";
import { type PropsWithChildren, useEffect, useState } from "react";
import type { StarknetDomain } from "starknet";
import { DEFAULT_CHAIN, DEFAULT_CHAIN_ID, dojoConfigs } from "@/config";
import { setupWorld } from "../bindings/typescript/contracts.gen";
import type { SchemaType } from "../bindings/typescript/models.gen";

// TODO:: idk xd
export const appDomain = {
  name: "nums",
  version: "1.0",
  chainId: DEFAULT_CHAIN,
  revision: "1",
};

export function DojoSdkProviderInitialized({
  children,
  domain = appDomain,
}: PropsWithChildren & {
  domain?: StarknetDomain;
}) {
  const dojoConfig = dojoConfigs[DEFAULT_CHAIN_ID];
  const [sdk, setSdk] = useState<SDK<SchemaType>>();

  useEffect(() => {
    const initAsync = async () => {
      const { init } = await import("@dojoengine/sdk");
      const sdk = await init<SchemaType>({
        client: {
          toriiUrl: dojoConfig.toriiUrl,
          worldAddress: dojoConfig.manifest.world.address,
        },
        domain,
      });
      setSdk(sdk);
    };

    initAsync();
  }, [dojoConfig]);

  if (!sdk) return null;

  return (
    <DojoSdkProvider sdk={sdk} dojoConfig={dojoConfig} clientFn={setupWorld}>
      {children}
    </DojoSdkProvider>
  );
}
