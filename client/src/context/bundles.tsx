import type * as torii from "@dojoengine/torii-wasm";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useAccount } from "@starknet-react/core";
import { getChecksumAddress } from "starknet";
import { BundleApi } from "@/api/torii";
import { subscribeEntities } from "@/api/torii/subscribe";
import { Bundle, BundleIssuance } from "@/models";
import { useEntities } from "@/context/entities";

type BundlesProviderProps = {
  children: React.ReactNode;
};

type BundlesProviderState = {
  bundles: Bundle[];
  issuances: BundleIssuance[];
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
  const { address } = useAccount();
  const subscriptionRef = useRef<torii.Subscription | null>(null);
  const subscriptionKeyRef = useRef<string>();
  const issuanceSubscriptionRef = useRef<torii.Subscription | null>(null);
  const issuanceSubscriptionKeyRef = useRef<string>();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [issuances, setIssuances] = useState<BundleIssuance[]>([]);
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

  const onIssuanceUpdate = useCallback((entities: torii.Entity[]) => {
    const parsed = BundleApi.parseIssuances(entities);
    if (parsed.length > 0) {
      setIssuances((prev) => BundleIssuance.dedupe([...parsed, ...prev]));
    }
  }, []);
  const onIssuanceUpdateRef = useRef(onIssuanceUpdate);
  onIssuanceUpdateRef.current = onIssuanceUpdate;

  const handleIssuanceUpdate = useCallback((entities: torii.Entity[]) => {
    onIssuanceUpdateRef.current(entities);
  }, []);

  const fetchIssuances = useCallback(async () => {
    if (!client || !address) return;
    const recipient = getChecksumAddress(BigInt(address)).toLowerCase();
    const query = BundleApi.issuancesByRecipientQuery(recipient);
    const result = await client.getEntities(query.build());
    handleIssuanceUpdate(result.items);
  }, [client, address, handleIssuanceUpdate]);

  const setupIssuanceSubscription = useCallback(async () => {
    if (!client || !address) return;

    const recipient = getChecksumAddress(BigInt(address)).toLowerCase();
    const clause =
      BundleApi.issuancesByRecipientQuery(recipient).build().clause;
    const key = JSON.stringify(clause);

    if (
      issuanceSubscriptionKeyRef.current === key &&
      issuanceSubscriptionRef.current
    ) {
      return;
    }

    if (issuanceSubscriptionRef.current) {
      issuanceSubscriptionRef.current.cancel();
    }

    issuanceSubscriptionRef.current = await subscribeEntities(
      client,
      clause,
      handleIssuanceUpdate,
    );
    issuanceSubscriptionKeyRef.current = key;
  }, [client, address, handleIssuanceUpdate]);

  const refresh = useCallback(async () => {
    await fetchInitialData();
    await fetchIssuances();
  }, [fetchInitialData, fetchIssuances]);

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

  useEffect(() => {
    if (!client || !address) return;
    let cancelled = false;

    const run = async () => {
      await fetchIssuances();
      await setupIssuanceSubscription();
    };

    run().catch((error: Error) => {
      if (!cancelled) console.error(error);
    });

    return () => {
      cancelled = true;
      if (issuanceSubscriptionRef.current) {
        issuanceSubscriptionRef.current.cancel();
        issuanceSubscriptionRef.current = null;
      }
      issuanceSubscriptionKeyRef.current = undefined;
    };
  }, [client, address, fetchIssuances, setupIssuanceSubscription]);

  const value: BundlesProviderState = {
    bundles,
    issuances,
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
