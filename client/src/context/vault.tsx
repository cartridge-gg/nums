import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ClauseBuilder,
  type SubscriptionCallbackArgs,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import type * as torii from "@dojoengine/torii-wasm";
import { getChecksumAddress } from "starknet";
import { useAccount } from "@starknet-react/core";
import {
  VaultInfo,
  VaultPosition,
  VaultClaimed,
  type RawVaultInfo,
  type RawVaultPosition,
  type RawVaultClaimed,
} from "@/models";
import { useEntities } from "./entities";
import { NAMESPACE } from "@/constants";

// ---------------------------------------------------------------------------
// Torii query builders
// ---------------------------------------------------------------------------

/** Query for VaultInfo — global entity, no user key needed */
const getVaultInfoQuery = (namespace: string) => {
  const model: `${string}-${string}` = `${namespace}-${VaultInfo.getModelName()}`;
  return new ToriiQueryBuilder()
    .withClause(
      new ClauseBuilder().keys([model], [undefined], "FixedLen").build(),
    )
    .includeHashedKeys();
};

/** Query for VaultPosition — scoped to the connected user address */
const getVaultPositionQuery = (namespace: string, userAddress: string) => {
  const model: `${string}-${string}` = `${namespace}-${VaultPosition.getModelName()}`;
  const key = getChecksumAddress(BigInt(userAddress)).toLowerCase();
  return new ToriiQueryBuilder()
    .withClause(new ClauseBuilder().keys([model], [key], "VariableLen").build())
    .includeHashedKeys();
};

/** Query for VaultClaimed events — scoped to the connected user address */
const getVaultClaimedQuery = (namespace: string, userAddress: string) => {
  const model: `${string}-${string}` = `${namespace}-${VaultClaimed.getModelName()}`;
  const key = getChecksumAddress(BigInt(userAddress)).toLowerCase();
  return new ToriiQueryBuilder()
    .withClause(new ClauseBuilder().keys([model], [key], "VariableLen").build())
    .includeHashedKeys();
};

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
  const { client } = useEntities();

  const infoSubRef = useRef<torii.Subscription | null>(null);
  const positionSubRef = useRef<torii.Subscription | null>(null);
  const claimedSubRef = useRef<torii.Subscription | null>(null);

  const [vaultInfo, setVaultInfo] = useState<VaultInfo>();
  const [vaultPosition, setVaultPosition] = useState<VaultPosition>();
  const [vaultClaimed, setVaultClaimed] = useState<VaultClaimed>();
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading",
  );

  // -------------------------------------------------------------------------
  // Entity update handler
  // -------------------------------------------------------------------------

  const onEntityUpdate = useCallback(
    (data: SubscriptionCallbackArgs<torii.Entity[], Error>) => {
      if (!data || data.error) return;
      (data.data || [data] || []).forEach((entity) => {
        if (entity.models[`${NAMESPACE}-${VaultInfo.getModelName()}`]) {
          const model = entity.models[
            `${NAMESPACE}-${VaultInfo.getModelName()}`
          ] as unknown as RawVaultInfo;
          const parsed = VaultInfo.parse(model);
          if (parsed.exists()) setVaultInfo(parsed);
        }
        if (entity.models[`${NAMESPACE}-${VaultPosition.getModelName()}`]) {
          const model = entity.models[
            `${NAMESPACE}-${VaultPosition.getModelName()}`
          ] as unknown as RawVaultPosition;
          const parsed = VaultPosition.parse(model);
          if (parsed.exists()) setVaultPosition(parsed);
        }
      });
    },
    [],
  );

  const onClaimedEvent = useCallback(
    (data: SubscriptionCallbackArgs<torii.Entity[], Error>) => {
      if (!data || data.error) return;
      (data.data || [data] || []).forEach((entity) => {
        if (entity.models[`${NAMESPACE}-${VaultClaimed.getModelName()}`]) {
          const model = entity.models[
            `${NAMESPACE}-${VaultClaimed.getModelName()}`
          ] as unknown as RawVaultClaimed;
          const parsed = VaultClaimed.parse(model);
          if (parsed.exists()) {
            setVaultClaimed((prev) =>
              !prev || parsed.time > prev.time ? parsed : prev,
            );
          }
        }
      });
    },
    [],
  );

  // -------------------------------------------------------------------------
  // Refresh — fetch initial data then subscribe
  // -------------------------------------------------------------------------

  const refresh = useCallback(async () => {
    if (!client) return;

    // Cancel existing subscriptions
    if (infoSubRef.current) {
      infoSubRef.current.cancel();
      infoSubRef.current = null;
    }
    if (positionSubRef.current) {
      positionSubRef.current.cancel();
      positionSubRef.current = null;
    }
    if (claimedSubRef.current) {
      claimedSubRef.current.cancel();
      claimedSubRef.current = null;
    }

    const infoQuery = getVaultInfoQuery(NAMESPACE);

    // Always fetch VaultInfo
    await client
      .getEntities(infoQuery.build())
      .then((result) =>
        onEntityUpdate({ data: result.items, error: undefined }),
      );

    // Subscribe to VaultInfo updates
    client
      .onEntityUpdated(infoQuery.build().clause, [], onEntityUpdate)
      .then((sub) => (infoSubRef.current = sub));

    // VaultPosition requires a connected account
    if (!address) return;

    const positionQuery = getVaultPositionQuery(NAMESPACE, address);
    const claimedQuery = getVaultClaimedQuery(NAMESPACE, address);

    await client
      .getEntities(positionQuery.build())
      .then((result) =>
        onEntityUpdate({ data: result.items, error: undefined }),
      );

    await client
      .getEventMessages(claimedQuery.build())
      .then((result) =>
        onClaimedEvent({ data: result.items, error: undefined }),
      );

    client
      .onEntityUpdated(positionQuery.build().clause, [], onEntityUpdate)
      .then((sub) => (positionSubRef.current = sub));

    client
      .onEventMessageUpdated(claimedQuery.build().clause, [], onClaimedEvent)
      .then((sub) => (claimedSubRef.current = sub));
  }, [client, address, onEntityUpdate, onClaimedEvent]);

  // -------------------------------------------------------------------------
  // Initial setup and re-run when account changes
  // -------------------------------------------------------------------------

  useEffect(() => {
    setStatus("loading");
    refresh()
      .then(() => setStatus("success"))
      .catch((error) => {
        console.error(error);
        setStatus("error");
      });

    return () => {
      if (infoSubRef.current) {
        infoSubRef.current.cancel();
        infoSubRef.current = null;
      }
      if (positionSubRef.current) {
        positionSubRef.current.cancel();
        positionSubRef.current = null;
      }
      if (claimedSubRef.current) {
        claimedSubRef.current.cancel();
        claimedSubRef.current = null;
      }
    };
  }, [refresh]);

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
