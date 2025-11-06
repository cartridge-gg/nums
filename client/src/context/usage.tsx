import { ClauseBuilder, ToriiQueryBuilder } from "@dojoengine/sdk";
import { useEntityQuery, useModels } from "@dojoengine/sdk/react";
import { useAccount } from "@starknet-react/core";
import { createContext, useContext, useMemo } from "react";
import { addAddressPadding } from "starknet";
import { NAMESPACE } from "@/config";
import { UsageModel } from "@/models/usage";

type UsageProviderProps = {
  children: React.ReactNode;
};

type UsageProviderState = {
  usage?: UsageModel;
};

const UsageProviderContext = createContext<UsageProviderState | undefined>(
  undefined,
);

export function UsageProvider({ children, ...props }: UsageProviderProps) {
  const { account } = useAccount();

  const configQuery = useMemo(() => {
    return new ToriiQueryBuilder()
      .withEntityModels([`${NAMESPACE}-Usage`])
      .withClause(
        new ClauseBuilder()
          .keys([`${NAMESPACE}-Usage`], [addAddressPadding("0x0")], "FixedLen")
          .build(),
      )
      .withLimit(1)
      .includeHashedKeys();
  }, [account?.address]);

  useEntityQuery(configQuery);

  const items = useModels(`${NAMESPACE}-Usage`);

  const { usage } = useMemo(() => {
    if (!items || !items[0]) return { usage: undefined };
    const item = Object.values(items[0])[0];
    return {
      usage: UsageModel.from(item.entityId, item),
    };
  }, [items]);

  return (
    <UsageProviderContext.Provider
      {...props}
      value={{
        usage,
      }}
    >
      {children}
    </UsageProviderContext.Provider>
  );
}

export const useUsage = () => {
  const context = useContext(UsageProviderContext);

  if (context === undefined)
    throw new Error("useUsage must be used within a UsageProvider");

  return context;
};
