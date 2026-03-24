import type * as torii from "@dojoengine/torii-wasm";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { BundleApi } from "@/api/torii";
import { subscribeEntities } from "@/api/torii/subscribe";
import { Bundle } from "@/models";
import { useEntities } from "@/context/entities";

type BundlesProviderProps = {
  children: React.ReactNode;
};

type BundlesProviderState = {
  bundles: Bundle[];
  freeBundles: Bundle[];
  paidBundles: Bundle[];
  status: "loading" | "error" | "success";
  refresh: () => Promise<void>;
};

const BundlesProviderContext = createContext<BundlesProviderState | undefined>(
  undefined,
);

export function BundlesProvider({ children, ...props }: BundlesProviderProps) {
  const { client } = useEntities();
  const subscriptionRef = useRef<torii.Subscription | null>(null);
  const subscriptionKeyRef = useRef<string>();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading",
  );

  const onEntityUpdate = useCallback((entities: torii.Entity[]) => {
    const parsed = BundleApi.parseBundles(entities);
    if (parsed.length > 0) {
      setBundles((prev) =>
        Bundle.dedupe([...parsed, ...(prev || [])]).sort((a, b) =>
          Number(a.price - b.price),
        ),
      );
    }
  }, []);
  const onEntityUpdateRef = useRef(onEntityUpdate);
  onEntityUpdateRef.current = onEntityUpdate;

  const handleEntityUpdate = useCallback((entities: torii.Entity[]) => {
    onEntityUpdateRef.current(entities);
  }, []);

  const fetchInitialData = useCallback(async () => {
    if (!client) return;
    const query = BundleApi.allBundlesQuery();
    const result = await client.getEntities(query.build());
    handleEntityUpdate(result.items);
  }, [client, handleEntityUpdate]);

  const setupSubscription = useCallback(async () => {
    if (!client) return;

    const clause = BundleApi.allBundlesQuery().build().clause;
    const key = JSON.stringify(clause);

    if (subscriptionKeyRef.current === key && subscriptionRef.current) {
      return;
    }

    if (subscriptionRef.current) {
      subscriptionRef.current.cancel();
    }

    subscriptionRef.current = await subscribeEntities(
      client,
      clause,
      handleEntityUpdate,
    );
    subscriptionKeyRef.current = key;
  }, [client, handleEntityUpdate]);

  const refresh = useCallback(async () => {
    await fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (!client) return;
    let cancelled = false;

    setStatus("loading");

    const run = async () => {
      await fetchInitialData();
      await setupSubscription();
    };

    run()
      .then(() => {
        if (!cancelled) setStatus("success");
      })
      .catch((error: Error) => {
        console.error(error);
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
        subscriptionRef.current = null;
      }
      subscriptionKeyRef.current = undefined;
    };
  }, [client, fetchInitialData, setupSubscription]);

  const value: BundlesProviderState = {
    bundles,
    freeBundles: bundles.filter((b) => b.price === 0n),
    paidBundles: bundles.filter((b) => b.price > 0n),
    status,
    refresh,
  };

  return (
    <BundlesProviderContext.Provider {...props} value={value}>
      {children}
    </BundlesProviderContext.Provider>
  );
}

export const useBundles = () => {
  const context = useContext(BundlesProviderContext);

  if (context === undefined)
    throw new Error("useBundles must be used within a BundlesProvider");

  return context;
};
