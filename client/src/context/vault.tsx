import type React from "react";
import { useAtomValue } from "jotai";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type * as torii from "@dojoengine/torii-wasm";
import { useAccount } from "@starknet-react/core";
import { Vault } from "@/api/torii";
import { subscribeEntities, subscribeEvents } from "@/api/torii/subscribe";
import { toriiClientAtom } from "@/atoms";
import type { VaultInfo, VaultPosition, VaultClaimed } from "@/models";

// ---------------------------------------------------------------------------
// Context types
// ---------------------------------------------------------------------------

interface VaultContextType {
  /** Global vault state (open flag, total_reward) */
  vaultInfo?: VaultInfo;
  /** Connected user's staking position */
  vaultPosition?: VaultPosition;
  /** Latest VaultClaimed event for the connected user */
  vaultClaimed?: VaultClaimed;
  status: "loading" | "error" | "success";
  refresh: () => Promise<void>;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const { address } = useAccount();
  const client = useAtomValue(toriiClientAtom);

  const infoSubRef = useRef<torii.Subscription | null>(null);
  const positionSubRef = useRef<torii.Subscription | null>(null);
  const claimedSubRef = useRef<torii.Subscription | null>(null);
  const infoSubKeyRef = useRef<string>();
  const positionSubKeyRef = useRef<string>();
  const claimedSubKeyRef = useRef<string>();

  const [vaultInfo, setVaultInfo] = useState<VaultInfo>();
  const [vaultPosition, setVaultPosition] = useState<VaultPosition>();
  const [vaultClaimed, setVaultClaimed] = useState<VaultClaimed>();
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading",
  );

  // -------------------------------------------------------------------------
  // Entity update handler
  // -------------------------------------------------------------------------

  const onEntityUpdate = useCallback((entities: torii.Entity[]) => {
    const info = Vault.parseInfo(entities);
    const position = Vault.parsePosition(entities);
    if (info) setVaultInfo(info);
    if (position) setVaultPosition(position);
  }, []);
  const onEntityUpdateRef = useRef(onEntityUpdate);
  onEntityUpdateRef.current = onEntityUpdate;

  const onClaimedEvent = useCallback((entities: torii.Entity[]) => {
    const claimed = Vault.parseClaimed(entities);
    if (!claimed) return;
    setVaultClaimed((prev) =>
      !prev || claimed.time > prev.time ? claimed : prev,
    );
  }, []);
  const onClaimedEventRef = useRef(onClaimedEvent);
  onClaimedEventRef.current = onClaimedEvent;

  const handleEntityUpdate = useCallback((entities: torii.Entity[]) => {
    onEntityUpdateRef.current(entities);
  }, []);

  const handleClaimedEvent = useCallback((entities: torii.Entity[]) => {
    onClaimedEventRef.current(entities);
  }, []);

  // -------------------------------------------------------------------------
  // Refresh — fetch initial data then subscribe
  // -------------------------------------------------------------------------

  const fetchVaultInfoInitial = useCallback(async () => {
    if (!client) return;

    const infoQuery = Vault.infoQuery();
    await client
      .getEntities(infoQuery.build())
      .then((result) => handleEntityUpdate(result.items));
  }, [client, handleEntityUpdate]);

  const fetchUserInitial = useCallback(async () => {
    if (!client || !address) return;

    const positionQuery = Vault.positionQuery(address);
    const claimedQuery = Vault.claimedQuery(address);

    await client
      .getEntities(positionQuery.build())
      .then((result) => handleEntityUpdate(result.items));

    await client
      .getEventMessages(claimedQuery.build())
      .then((result) => handleClaimedEvent(result.items));
  }, [client, address, handleEntityUpdate, handleClaimedEvent]);

  const setupVaultInfoSubscription = useCallback(async () => {
    if (!client) return;

    const infoClause = Vault.infoQuery().build().clause;
    const infoKey = JSON.stringify(infoClause);

    if (infoSubKeyRef.current === infoKey && infoSubRef.current) {
      return;
    }

    if (infoSubRef.current) {
      infoSubRef.current.cancel();
      infoSubRef.current = null;
    }

    infoSubRef.current = await subscribeEntities(
      client,
      infoClause,
      handleEntityUpdate,
    );
    infoSubKeyRef.current = infoKey;
  }, [client, handleEntityUpdate]);

  const setupUserSubscriptions = useCallback(async () => {
    if (!client || !address) return;

    const positionClause = Vault.positionQuery(address).build().clause;
    const claimedClause = Vault.claimedQuery(address).build().clause;
    const positionKey = JSON.stringify(positionClause);
    const claimedKey = JSON.stringify(claimedClause);

    if (
      !(positionSubKeyRef.current === positionKey && positionSubRef.current)
    ) {
      if (positionSubRef.current) {
        positionSubRef.current.cancel();
        positionSubRef.current = null;
      }
      positionSubRef.current = await subscribeEntities(
        client,
        positionClause,
        handleEntityUpdate,
      );
      positionSubKeyRef.current = positionKey;
    }

    if (!(claimedSubKeyRef.current === claimedKey && claimedSubRef.current)) {
      if (claimedSubRef.current) {
        claimedSubRef.current.cancel();
        claimedSubRef.current = null;
      }
      claimedSubRef.current = await subscribeEvents(
        client,
        claimedClause,
        handleClaimedEvent,
      );
      claimedSubKeyRef.current = claimedKey;
    }
  }, [client, address, handleEntityUpdate, handleClaimedEvent]);

  const refresh = useCallback(async () => {
    await fetchVaultInfoInitial();
    await fetchUserInitial();
  }, [fetchVaultInfoInitial, fetchUserInitial]);

  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!client) return;
    let cancelled = false;

    setStatus("loading");

    const run = async () => {
      await fetchVaultInfoInitial();
      await setupVaultInfoSubscription();
    };

    run()
      .then(() => setStatus("success"))
      .catch((error) => {
        console.error(error);
        if (!cancelled) {
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
      if (infoSubRef.current) {
        infoSubRef.current.cancel();
        infoSubRef.current = null;
      }
      infoSubKeyRef.current = undefined;
    };
  }, [client, fetchVaultInfoInitial, setupVaultInfoSubscription]);

  useEffect(() => {
    if (!client || !address) return;
    let cancelled = false;

    setStatus("loading");

    const run = async () => {
      await fetchUserInitial();
      await setupUserSubscriptions();
    };

    run()
      .then(() => {
        if (!cancelled) {
          setStatus("success");
        }
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) {
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
      if (positionSubRef.current) {
        positionSubRef.current.cancel();
        positionSubRef.current = null;
      }
      if (claimedSubRef.current) {
        claimedSubRef.current.cancel();
        claimedSubRef.current = null;
      }
      positionSubKeyRef.current = undefined;
      claimedSubKeyRef.current = undefined;
    };
  }, [client, address, fetchUserInitial, setupUserSubscriptions]);

  const value: VaultContextType = useMemo(
    () => ({ vaultInfo, vaultPosition, vaultClaimed, status, refresh }),
    [vaultInfo, vaultPosition, vaultClaimed, status, refresh],
  );

  return (
    <VaultContext.Provider value={value}>{children}</VaultContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error("useVault must be used within a VaultProvider");
  }
  return context;
}
