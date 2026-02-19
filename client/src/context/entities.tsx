import {
  ClauseBuilder,
  type SubscriptionCallbackArgs,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import * as torii from "@dojoengine/torii-wasm";
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
  type RawClaimed,
  type RawPurchased,
  type RawStarted,
  type RawConfig,
  type RawStarterpack,
  Claimed,
  Config,
  Purchased,
  Started,
  Starterpack,
} from "@/models";
import { DEFAULT_CHAIN_ID, dojoConfigs } from "@/config";

type EntitiesProviderProps = {
  children: React.ReactNode;
};

type EntitiesProviderState = {
  client?: torii.ToriiClient;
  config?: Config;
  starterpacks: Starterpack[];
  purchaseds: Purchased[];
  starteds: Started[];
  claimeds: Claimed[];
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

const getEventQuery = (namespace: string) => {
  const purchased: `${string}-${string}` = `${namespace}-${Purchased.getModelName()}`;
  const started: `${string}-${string}` = `${namespace}-${Started.getModelName()}`;
  const claimed: `${string}-${string}` = `${namespace}-${Claimed.getModelName()}`;
  const clauses = new ClauseBuilder().keys(
    [purchased, started, claimed],
    [],
    "VariableLen",
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
};

export function EntitiesProvider({
  children,
  ...props
}: EntitiesProviderProps) {
  const [client, setClient] = useState<torii.ToriiClient>();
  const entitiesSubscriptionRef = useRef<torii.Subscription | null>(null);
  const eventsSubscriptionRef = useRef<torii.Subscription | null>(null);
  const [config, setConfig] = useState<Config>();
  const [starterpacks, setStarterpacks] = useState<Starterpack[]>([]);
  const [purchaseds, setPurchaseds] = useState<Purchased[]>([]);
  const [starteds, setStarteds] = useState<Started[]>([]);
  const [claimeds, setClaimeds] = useState<Claimed[]>([]);
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

  // Handler for entity updates
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
          if (parsed)
            setStarterpacks((prev) =>
              Starterpack.dedupe([...(prev || []), parsed]).sort((a, b) =>
                Number(a.price - b.price),
              ),
            );
        }
      });
    },
    [],
  );

  // Handler for event updates
  const onEventUpdate = useCallback(
    (data: SubscriptionCallbackArgs<torii.Entity[], Error>) => {
      if (!data || data.error) return;
      (data.data || [data] || []).forEach((entity) => {
        if (entity.models[`${NAMESPACE}-${Purchased.getModelName()}`]) {
          const model = entity.models[
            `${NAMESPACE}-${Purchased.getModelName()}`
          ] as unknown as RawPurchased;
          const parsed = Purchased.parse(model);
          setPurchaseds((prev) => Purchased.dedupe([...(prev || []), parsed]));
        }
        if (entity.models[`${NAMESPACE}-${Started.getModelName()}`]) {
          const model = entity.models[
            `${NAMESPACE}-${Started.getModelName()}`
          ] as unknown as RawStarted;
          const parsed = Started.parse(model);
          setStarteds((prev) => Started.dedupe([...(prev || []), parsed]));
        }
        if (entity.models[`${NAMESPACE}-${Claimed.getModelName()}`]) {
          const model = entity.models[
            `${NAMESPACE}-${Claimed.getModelName()}`
          ] as unknown as RawClaimed;
          const parsed = Claimed.parse(model);
          setClaimeds((prev) => Claimed.dedupe([...(prev || []), parsed]));
        }
      });
    },
    [],
  );

  // Refresh function to fetch and subscribe to data
  const refresh = useCallback(async () => {
    if (!client) return;

    // Cancel existing subscriptions
    if (entitiesSubscriptionRef.current) {
      entitiesSubscriptionRef.current = null;
    }
    if (eventsSubscriptionRef.current) {
      eventsSubscriptionRef.current = null;
    }

    // Create queries
    const entityQuery = getEntityQuery(NAMESPACE);
    const eventQuery = getEventQuery(NAMESPACE);

    // Fetch initial data
    await Promise.all([
      client
        .getEntities(entityQuery.build())
        .then((result) =>
          onEntityUpdate({ data: result.items, error: undefined }),
        ),
    ]);

    // Subscribe to entity and event updates
    if (!config) return;
    client
      .onEntityUpdated(entityQuery.build().clause, [], onEntityUpdate)
      .then((response) => {
        entitiesSubscriptionRef.current = response;
      });
    client
      .onEventMessageUpdated(eventQuery.build().clause, [], onEventUpdate)
      .then((response) => {
        console.log("Event subscription", response);
        eventsSubscriptionRef.current = response;
      });
  }, [client, config, onEntityUpdate, onEventUpdate]);

  // Initial fetch and subscription setup
  useEffect(() => {
    if (entitiesSubscriptionRef.current || eventsSubscriptionRef.current)
      return;
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
      if (eventsSubscriptionRef.current) {
        eventsSubscriptionRef.current.cancel();
      }
    };
  }, [refresh, client]);

  const value: EntitiesProviderState = {
    client,
    config,
    starterpacks,
    purchaseds,
    starteds,
    claimeds,
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
