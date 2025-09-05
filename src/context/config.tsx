import { Config, Game } from "@/bindings";
import { useDojoSdk } from "@/hooks/dojo";
import { ClauseBuilder, ToriiQueryBuilder } from "@dojoengine/sdk";
import { useEntityQuery, useModels } from "@dojoengine/sdk/react";
import { useAccount } from "@starknet-react/core";
import { createContext, useCallback, useContext, useMemo } from "react";

type ConfigProviderProps = {
  children: React.ReactNode;
};

type ConfigProviderState = {
  config?: Config;
};

const ConfigProviderContext = createContext<ConfigProviderState | undefined>(
  undefined
);

export function ConfigProvider({ children, ...props }: ConfigProviderProps) {
  const { sdk } = useDojoSdk();
  const { account } = useAccount();

  const configQuery = useMemo(() => {
    return new ToriiQueryBuilder()
      .withEntityModels(["nums-Config"])
      .withClause(
        new ClauseBuilder().keys(["nums-Config"], ["0"], "FixedLen").build()
      )
      .withLimit(1)
      .includeHashedKeys();
  }, [account?.address]);

  useEntityQuery(configQuery);

  const configItems = useModels("nums-Config");

  const { config } = useMemo(() => {
    if (!configItems || !configItems[0]) return { config: undefined };

    const config = Object.values(configItems[0])[0] as Config;

    // if (config) {
    //   console.log("config", config);
    // }

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
