import {
  ClauseBuilder,
  type SubscriptionCallbackArgs,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import * as torii from "@dojoengine/torii-wasm";
import { useAccount } from "@starknet-react/core";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { NAMESPACE } from "@/constants";
import {
  Config,
  type RawConfig,
  type RawStarterpack,
  Starterpack,
} from "@/models";
import { DEFAULT_CHAIN_ID, dojoConfigs } from "@/config";

type EntitiesProviderProps = {
  children: React.ReactNode;
};

type EntitiesProviderState = {
  client?: torii.ToriiClient;
  config?: Config;
  starterpack?: Starterpack;
  status: "loading" | "error" | "success";
  refresh: () => Promise<void>;
};

const EntitiesProviderContext = createContext<
  EntitiesProviderState | undefined
>(undefined);

const getEntityQuery = (namespace: string) => {
  const config: `${string}-${string}` = `${namespace}-${Config.getModelName()}`;
  const starterpack: `${string}-${string}` = `${namespace}-${Starterpack.getModelName()}`;
  const clauses = new ClauseBuilder().keys(
    [config, starterpack],
    [undefined],
    "FixedLen",
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
};

export function EntitiesProvider({
  children,
  ...props
}: EntitiesProviderProps) {
  const account = useAccount();
  const [client, setClient] = useState<torii.ToriiClient>();
  const entitiesSubscriptionRef = useRef<torii.Subscription | null>(null);
  const [config, setConfig] = useState<Config>();
  const [starterpack, setStarterpack] = useState<Starterpack>();
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading",
  );

  // Initialize Torii client
  useEffect(() => {
    const getClient = async () => {
      const toriiUrl = dojoConfigs[DEFAULT_CHAIN_ID].toriiUrl;
      const client = await new torii.ToriiClient({
        toriiUrl: toriiUrl,
        worldAddress: "0x0",
      });
      setClient(client);
    };
    getClient();
  }, []);

  // Handler for entity updates (packs)
  const onEntityUpdate = useCallback(
    (data: SubscriptionCallbackArgs<torii.Entity[], Error>) => {
      if (!data || data.error) return;
      (data.data || [data] || []).forEach((entity) => {
        if (entity.models[`${NAMESPACE}-${Config.getModelName()}`]) {
          const model = entity.models[
            `${NAMESPACE}-${Config.getModelName()}`
          ] as unknown as RawConfig;
          const parsed = Config.parse(model);
          if (parsed) setConfig(parsed);
        }
        if (entity.models[`${NAMESPACE}-${Starterpack.getModelName()}`]) {
          const model = entity.models[
            `${NAMESPACE}-${Starterpack.getModelName()}`
          ] as unknown as RawStarterpack;
          const parsed = Starterpack.parse(model);
          if (parsed) setStarterpack(parsed);
        }
      });
    },
    [],
  );

  // Refresh function to fetch and subscribe to data
  const refresh = useCallback(async () => {
    if (!client || !account) return;

    // Cancel existing subscriptions
    entitiesSubscriptionRef.current = null;

    // Create queries
    const query = getEntityQuery(NAMESPACE);

    // Fetch initial data
    await Promise.all([
      client
        .getEntities(query.build())
        .then((result) =>
          onEntityUpdate({ data: result.items, error: undefined }),
        ),
    ]);

    // Subscribe to entity and event updates
    client
      .onEntityUpdated(query.build().clause, [], onEntityUpdate)
      .then((response) => {
        entitiesSubscriptionRef.current = response;
      });
  }, [client, account, onEntityUpdate]);

  // Initial fetch and subscription setup
  useEffect(() => {
    if (entitiesSubscriptionRef.current) return;
    setStatus("loading");
    refresh()
      .then(() => {
        setStatus("success");
      })
      .catch((error: Error) => {
        console.error(error);
        setStatus("error");
      });

    return () => {
      if (entitiesSubscriptionRef.current) {
        entitiesSubscriptionRef.current.cancel();
      }
    };
  }, [refresh]);

  const value: EntitiesProviderState = {
    client,
    config,
    starterpack,
    status,
    refresh,
  };

  return (
    <EntitiesProviderContext.Provider {...props} value={value}>
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
