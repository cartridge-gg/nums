import { ClauseBuilder, ToriiQueryBuilder } from "@dojoengine/sdk";
import { useEntityQuery, useModels } from "@dojoengine/sdk/react";
import { useAccount } from "@starknet-react/core";
import { createContext, useContext, useMemo } from "react";
import type { Config } from "@/bindings";
import { NAMESPACE } from "@/config";

type ConfigProviderProps = {
  children: React.ReactNode;
};

type ConfigProviderState = {
  config?: Config;
};

const ConfigProviderContext = createContext<ConfigProviderState | undefined>(
  undefined,
);

export function ConfigProvider({ children, ...props }: ConfigProviderProps) {
  const { account } = useAccount();

  const configQuery = useMemo(() => {
    return new ToriiQueryBuilder()
      .withEntityModels([`${NAMESPACE}-Config`])
      .withClause(
        new ClauseBuilder()
          .keys([`${NAMESPACE}-Config`], ["0"], "FixedLen")
          .build(),
      )
      .withLimit(1)
      .includeHashedKeys();
  }, [account?.address]);

  useEntityQuery(configQuery);

  const configItems = useModels(`${NAMESPACE}-Config`);

  const { config } = useMemo(() => {
    if (!configItems || !configItems[0]) return { config: undefined };

    const config = Object.values(configItems[0])[0] as Config;

    return {
      config,
    };
  }, [configItems]);

  return (
    <ConfigProviderContext.Provider
      {...props}
      value={{
        config,
      }}
    >
      {children}
    </ConfigProviderContext.Provider>
  );
}

export const useConfig = () => {
  const context = useContext(ConfigProviderContext);

  if (context === undefined)
    throw new Error("useConfig must be used within a ConfigProvider");

  return context;
};
