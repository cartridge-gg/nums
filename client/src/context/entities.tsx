import type * as torii from "@dojoengine/torii-wasm";
import { useSetAtom } from "jotai";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { initToriiClient } from "@/api/torii/client";
import {
  Config as ConfigApi,
  Event,
  Starterpack as StarterpackApi,
} from "@/api/torii";
import { subscribeEntities, subscribeEvents } from "@/api/torii/subscribe";
import { toriiClientAtom } from "@/atoms";
import {
  Claimed,
  type Config,
  Purchased,
  Started,
  Starterpack,
  Score,
} from "@/models";

type EntitiesProviderProps = {
  children: React.ReactNode;
};

type EntitiesProviderState = {
  client?: torii.ToriiClient;
  config?: Config;
  starterpacks: Starterpack[];
  purchaseds: Purchased[];
  purchased: Purchased | undefined;
  starteds: Started[];
  started: Started | undefined;
  scores: Score[];
  claimeds: Claimed[];
  claimed: Claimed | undefined;
  status: "loading" | "error" | "success";
  refresh: () => Promise<void>;
};

const EntitiesProviderContext = createContext<
  EntitiesProviderState | undefined
>(undefined);

export function EntitiesProvider({
  children,
  ...props
}: EntitiesProviderProps) {
  const [client, setClient] = useState<torii.ToriiClient>();
  const setToriiClient = useSetAtom(toriiClientAtom);
  const entitiesSubscriptionRef = useRef<torii.Subscription | null>(null);
  const eventsSubscriptionRef = useRef<torii.Subscription | null>(null);
  const entitiesSubscriptionKeyRef = useRef<string>();
  const eventsSubscriptionKeyRef = useRef<string>();
  const [config, setConfig] = useState<Config>();
  const [starterpacks, setStarterpacks] = useState<Starterpack[]>([]);
  const [purchaseds, setPurchaseds] = useState<Purchased[]>([]);
  const [starteds, setStarteds] = useState<Started[]>([]);
  const [claimeds, setClaimeds] = useState<Claimed[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [purchased, setPurchased] = useState<Purchased>();
  const [started, setStarted] = useState<Started>();
  const [claimed, setClaimed] = useState<Claimed>();
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading",
  );

  // Initialize Torii clients
  useEffect(() => {
    let mounted = true;
    const getClient = async () => {
      const client = await initToriiClient();
      if (!mounted) return;
      setClient(client);
      setToriiClient(client);
    };
    getClient();
    return () => {
      mounted = false;
    };
  }, [setToriiClient]);

  // Handler for entity updates
  const onEntityUpdate = useCallback((entities: torii.Entity[]) => {
    const parsedConfig = ConfigApi.parse(entities);
    const parsedStarterpacks = StarterpackApi.parse(entities);

    if (parsedConfig) setConfig(parsedConfig);
    if (parsedStarterpacks.length > 0) {
      setStarterpacks((prev) =>
        Starterpack.dedupe([...(prev || []), ...parsedStarterpacks]).sort(
          (a, b) => Number(a.price - b.price),
        ),
      );
    }
  }, []);
  const onEntityUpdateRef = useRef(onEntityUpdate);
  onEntityUpdateRef.current = onEntityUpdate;

  // Handler for event updates
  const onEventUpdate = useCallback((entities: torii.Entity[]) => {
    const parsedPurchaseds = Event.parsePurchaseds(entities);
    const parsedStarteds = Event.parseStarteds(entities);
    const parsedClaimeds = Event.parseClaimeds(entities);
    const parsedScores = Event.parseScores(entities);

    if (parsedPurchaseds.length > 0) {
      setPurchaseds((prev) =>
        Purchased.dedupe(
          [...parsedPurchaseds, ...(prev || [])].sort(
            (a, b) => b.time - a.time,
          ),
        ).slice(0, 10),
      );
      const nextPurchased = parsedPurchaseds.find((item) => !item.hasExpired());
      if (nextPurchased) setPurchased(nextPurchased);
    }

    if (parsedStarteds.length > 0) {
      setStarteds((prev) =>
        Started.dedupe(
          [...parsedStarteds, ...(prev || [])].sort((a, b) => b.time - a.time),
        ).slice(0, 10),
      );
      const nextStarted = parsedStarteds.find((item) => !item.hasExpired());
      if (nextStarted) setStarted(nextStarted);
    }

    if (parsedClaimeds.length > 0) {
      setClaimeds((prev) =>
        Claimed.dedupe(
          [...parsedClaimeds, ...(prev || [])].sort((a, b) => b.time - a.time),
        ).slice(0, 10),
      );
      const nextClaimed = parsedClaimeds.find((item) => !item.hasExpired());
      if (nextClaimed) setClaimed(nextClaimed);
    }

    if (parsedScores.length > 0) {
      setScores((prev) => Score.dedupe([...parsedScores, ...(prev || [])]));
    }
  }, []);
  const onEventUpdateRef = useRef(onEventUpdate);
  onEventUpdateRef.current = onEventUpdate;

  const handleEntityUpdate = useCallback((entities: torii.Entity[]) => {
    onEntityUpdateRef.current(entities);
  }, []);

  const handleEventUpdate = useCallback((entities: torii.Entity[]) => {
    onEventUpdateRef.current(entities);
  }, []);

  const fetchInitialData = useCallback(async () => {
    if (!client) return;
    const entityQuery = ConfigApi.query();
    const eventQuery = Event.query();

    await Promise.all([
      client
        .getEntities(entityQuery.build())
        .then((result) => handleEntityUpdate(result.items)),
    ]);
    await Promise.all([
      client
        .getEventMessages(eventQuery.build())
        .then((result) => handleEventUpdate(result.items)),
    ]);
  }, [client, handleEntityUpdate, handleEventUpdate]);

  const setupSubscriptions = useCallback(async () => {
    if (!client) return;

    const entityClause = ConfigApi.query().build().clause;
    const eventClause = Event.query().build().clause;
    const entityKey = JSON.stringify(entityClause);
    const eventKey = JSON.stringify(eventClause);

    if (
      entitiesSubscriptionKeyRef.current !== entityKey ||
      !entitiesSubscriptionRef.current
    ) {
      if (entitiesSubscriptionRef.current) {
        entitiesSubscriptionRef.current.cancel();
      }
      entitiesSubscriptionRef.current = await subscribeEntities(
        client,
        entityClause,
        handleEntityUpdate,
      );
      entitiesSubscriptionKeyRef.current = entityKey;
    }

    if (
      eventsSubscriptionKeyRef.current !== eventKey ||
      !eventsSubscriptionRef.current
    ) {
      if (eventsSubscriptionRef.current) {
        eventsSubscriptionRef.current.cancel();
      }
      eventsSubscriptionRef.current = await subscribeEvents(
        client,
        eventClause,
        handleEventUpdate,
      );
      eventsSubscriptionKeyRef.current = eventKey;
    }
  }, [client, handleEntityUpdate, handleEventUpdate]);

  const refresh = useCallback(async () => {
    await fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (!client) return;
    let cancelled = false;

    setStatus("loading");

    const run = async () => {
      await fetchInitialData();
      await setupSubscriptions();
    };

    run()
      .then(() => {
        if (!cancelled) {
          setStatus("success");
        }
      })
      .catch((error: Error) => {
        console.error(error);
        if (!cancelled) {
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
      if (entitiesSubscriptionRef.current) {
        entitiesSubscriptionRef.current.cancel();
        entitiesSubscriptionRef.current = null;
      }
      if (eventsSubscriptionRef.current) {
        eventsSubscriptionRef.current.cancel();
        eventsSubscriptionRef.current = null;
      }
      entitiesSubscriptionKeyRef.current = undefined;
      eventsSubscriptionKeyRef.current = undefined;
    };
  }, [client, fetchInitialData, setupSubscriptions]);

  const value: EntitiesProviderState = {
    client,
    config,
    starterpacks,
    scores,
    purchaseds,
    purchased,
    starteds,
    started,
    claimeds,
    claimed,
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
