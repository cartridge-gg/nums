import {
  ClauseBuilder,
  type SchemaType,
  type StandardizedQueryResult,
  type SubscriptionCallbackArgs,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { addAddressPadding } from "starknet";
import { NAMESPACE } from "@/config";
import { useDojoSdk } from "@/hooks/dojo";
import { Usage, type UsageModel } from "@/models/usage";

type UsageProviderProps = {
  children: React.ReactNode;
};

type UsageProviderState = {
  usage?: UsageModel;
  refresh: () => Promise<void>;
};

const UsageProviderContext = createContext<UsageProviderState | undefined>(
  undefined,
);

const getUsageQuery = () => {
  return new ToriiQueryBuilder()
    .withEntityModels([`${NAMESPACE}-${Usage.getModelName()}`])
    .withClause(
      new ClauseBuilder()
        .keys([`${NAMESPACE}-Usage`], [addAddressPadding("0x0")], "FixedLen")
        .build(),
    )
    .withLimit(1)
    .includeHashedKeys();
};

export function UsageProvider({ children, ...props }: UsageProviderProps) {
  const { sdk } = useDojoSdk();
  const [usage, setUsage] = useState<UsageModel | undefined>(undefined);

  const subscriptionRef = useRef<any>(null);

  const query = useMemo(() => {
    return getUsageQuery();
  }, []);

  const onUpdate = useCallback(
    ({
      data,
      error,
    }: SubscriptionCallbackArgs<
      StandardizedQueryResult<SchemaType>,
      Error
    >) => {
      if (
        error ||
        !data ||
        data.length === 0 ||
        BigInt(data[0].entityId) === 0n
      )
        return;
      const entity = data[0];
      if (BigInt(entity.entityId) === 0n) return;
      if (!entity.models[NAMESPACE]?.[Usage.getModelName()]) return;
      const usage = Usage.parse(entity as any);
      setUsage(usage);
    },
    [],
  );

  const refresh = useCallback(async () => {
    if (subscriptionRef.current) {
      subscriptionRef.current = null;
    }

    const [result, subscription] = await sdk.subscribeEntityQuery({
      query: query,
      callback: onUpdate,
    });
    subscriptionRef.current = subscription;

    const items = result.getItems();
    if (items && items.length > 0) {
      onUpdate({ data: items, error: undefined });
    }
  }, [query, onUpdate]);

  useEffect(() => {
    refresh();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
      }
    };
  }, [subscriptionRef, sdk, query, refresh]);

  return (
    <UsageProviderContext.Provider
      {...props}
      value={{
        usage,
        refresh,
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
