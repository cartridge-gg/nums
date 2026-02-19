import type React from "react";
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ClauseBuilder,
  type SubscriptionCallbackArgs,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import type * as torii from "@dojoengine/torii-wasm";
import {
  AchievementCreation,
  AchievementCompleted,
  type RawAchievementCreation,
  type RawAchievementCompleted,
} from "@/models";
import { getChecksumAddress } from "starknet";
import { useAccount } from "@starknet-react/core";
import { useEntities } from "./entities";
import { NAMESPACE } from "@/constants";
import { toast } from "sonner";

interface AchievementsContextType {
  status: "loading" | "error" | "success";
}

const AchievementsContext = createContext<AchievementsContextType | undefined>(
  undefined,
);

const getAchievementCreationEventQuery = (NAMESPACE: string) => {
  const creation: `${string}-${string}` = `${NAMESPACE}-${AchievementCreation.getModelName()}`;
  const clauses = new ClauseBuilder().keys([creation], [undefined], "FixedLen");
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
};

const getPlayerCompletedEventQuery = (NAMESPACE: string, playerId: string) => {
  const completed: `${string}-${string}` = `${NAMESPACE}-${AchievementCompleted.getModelName()}`;
  const key = getChecksumAddress(BigInt(playerId)).toLowerCase();
  const clauses = new ClauseBuilder().keys([completed], [key], "VariableLen");
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
};

export function AchievementsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { address } = useAccount();
  const { client } = useEntities();
  const creationSubscriptionRef = useRef<torii.Subscription | null>(null);
  const completedSubscriptionRef = useRef<torii.Subscription | null>(null);
  const [creations, setCreations] = useState<Map<string, AchievementCreation>>(
    new Map(),
  );
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading",
  );

  // Handler for AchievementCreation events - stores achievement metadata
  const onCreationEvent = useCallback(
    (data: SubscriptionCallbackArgs<torii.Entity[], Error>) => {
      if (!data || data.error) return;
      (data.data || [data] || []).forEach((entity) => {
        if (
          entity.models[`${NAMESPACE}-${AchievementCreation.getModelName()}`]
        ) {
          const model = entity.models[
            `${NAMESPACE}-${AchievementCreation.getModelName()}`
          ] as unknown as RawAchievementCreation;
          const creation = AchievementCreation.parse(model);
          setCreations((prev) => {
            const next = new Map(prev);
            next.set(creation.id, creation);
            return next;
          });
        }
      });
    },
    [NAMESPACE],
  );

  // Handler for AchievementCompleted events - displays toast
  const onCompletedEvent = useCallback(
    (data: SubscriptionCallbackArgs<torii.Entity[], Error>) => {
      if (!data || data.error) return;
      (data.data || [data] || []).forEach((entity) => {
        if (
          entity.models[`${NAMESPACE}-${AchievementCompleted.getModelName()}`]
        ) {
          const model = entity.models[
            `${NAMESPACE}-${AchievementCompleted.getModelName()}`
          ] as unknown as RawAchievementCompleted;
          const event = AchievementCompleted.parse(model);
          const achievement = creations.get(event.achievement_id);
          if (achievement) {
            toast(achievement.title, {
              description: achievement.description,
              duration: 4000,
            });
          }
        }
      });
    },
    [NAMESPACE, creations],
  );

  // Refresh function to fetch and subscribe to events
  const refresh = useCallback(async () => {
    if (!NAMESPACE || !client || !address) return;

    // Cancel existing subscriptions
    if (creationSubscriptionRef.current) {
      creationSubscriptionRef.current.cancel();
      creationSubscriptionRef.current = null;
    }
    if (completedSubscriptionRef.current) {
      completedSubscriptionRef.current.cancel();
      completedSubscriptionRef.current = null;
    }

    // Create queries
    const creationEventQuery = getAchievementCreationEventQuery(NAMESPACE);
    const completedEventQuery = getPlayerCompletedEventQuery(
      NAMESPACE,
      address,
    );

    // Fetch initial creation events to populate the map
    try {
      const creationResult = await client.getEventMessages(
        creationEventQuery.build(),
      );
      onCreationEvent({ data: creationResult.items, error: undefined });
    } catch (error) {
      console.error("Error fetching achievement creations:", error);
    }

    // Subscribe to creation events
    client
      .onEventMessageUpdated(
        creationEventQuery.build().clause,
        [],
        onCreationEvent,
      )
      .then((response) => (creationSubscriptionRef.current = response))
      .catch((error) => {
        console.error("Error subscribing to creation events:", error);
      });

    // Subscribe to completed events
    client
      .onEventMessageUpdated(
        completedEventQuery.build().clause,
        [],
        onCompletedEvent,
      )
      .then((response) => (completedSubscriptionRef.current = response))
      .catch((error) => {
        console.error("Error subscribing to completed events:", error);
      });
  }, [NAMESPACE, client, address, onCreationEvent, onCompletedEvent]);

  // Initial fetch and subscription setup
  useEffect(() => {
    if (creationSubscriptionRef.current || completedSubscriptionRef.current) {
      return;
    }
    setStatus("loading");
    refresh()
      .then(() => {
        setStatus("success");
      })
      .catch((error) => {
        console.error(error);
        setStatus("error");
      });

    return () => {
      if (creationSubscriptionRef.current) {
        creationSubscriptionRef.current.cancel();
      }
      if (completedSubscriptionRef.current) {
        completedSubscriptionRef.current.cancel();
      }
    };
  }, [refresh]);

  const value: AchievementsContextType = {
    status,
  };

  return (
    <AchievementsContext.Provider value={value}>
      {children}
    </AchievementsContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementsContext);
  if (!context) {
    throw new Error(
      "useAchievements must be used within an AchievementsProvider",
    );
  }
  return context;
}
