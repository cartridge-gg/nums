import { ClauseBuilder, ToriiQueryBuilder } from "@dojoengine/sdk";
import { useEntityQuery, useModels } from "@dojoengine/sdk/react";
import { createContext, useContext, useMemo } from "react";
import type {
  Config as ConfigEntity,
  Usage as UsageEntity,
} from "@/bindings";
import { NAMESPACE } from "@/config";
import { Usage, UsageModel } from "@/models/usage";
import { Config, ConfigModel } from "@/models/config";

type EntitiesProviderProps = {
  children: React.ReactNode;
};

type EntitiesProviderState = {
  config?: ConfigModel;
  usage?: UsageModel;
};

const EntitiesProviderContext = createContext<
  EntitiesProviderState | undefined
>(undefined);

const usageQuery = new ToriiQueryBuilder()
  .withEntityModels([`${NAMESPACE}-${Usage.getModelName()}`])
  .withClause(
    new ClauseBuilder()
      .keys([`${NAMESPACE}-${Usage.getModelName()}`], [undefined], "FixedLen")
      .build(),
  )
  .withLimit(1)
  .includeHashedKeys();

const configQuery = new ToriiQueryBuilder()
.withEntityModels([`${NAMESPACE}-${Config.getModelName()}`])
.withClause(
  new ClauseBuilder()
    .keys([`${NAMESPACE}-${Config.getModelName()}`], [undefined], "FixedLen")
    .build(),
)
.withLimit(1)
.includeHashedKeys();

export function EntitiesProvider({
  children,
  ...props
}: EntitiesProviderProps) {
  useEntityQuery(usageQuery);
  useEntityQuery(configQuery);

  const usageItems = useModels(`${NAMESPACE}-${Usage.getModelName()}`);
  const usage = useMemo(() => {
    const usages = Object.keys(usageItems).flatMap((key) => {
      const items = usageItems[key] as UsageEntity[];
      return Object.values(items).map((entity) =>
        UsageModel.from(key, entity),
      );
    });
    return usages[0];
  }, [usageItems]);

  const configItems = useModels(`${NAMESPACE}-${Config.getModelName()}`);
  const config = useMemo(() => {
    const configs = Object.keys(configItems).flatMap((key) => {
      const items = configItems[key] as ConfigEntity[];
      return Object.values(items).map((entity) =>
        ConfigModel.from(key, entity),
      );
    });
    return configs[0];
  }, [configItems]);

  return (
    <EntitiesProviderContext.Provider
      {...props}
      value={{ config, usage, }}
    >
      {children}
    </EntitiesProviderContext.Provider>
  );
}

export const useEntities = () => {
  const context = useContext(EntitiesProviderContext);

  if (context === undefined)
    throw new Error("useEntities must be used within a EntitiesProvider");

  return context;
};
