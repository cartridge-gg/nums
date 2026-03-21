import type React from "react";
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAtomValue } from "jotai";
import type * as torii from "@dojoengine/torii-wasm";
import {
  AchievementDefinition,
  AchievementCompletion,
  AchievementAdvancement,
  type AchievementCreation,
  type AchievementCompleted,
} from "@/models";
import { useAccount } from "@starknet-react/core";
import {
  Achievement as AchievementApi,
  subscribeEntities,
  subscribeEvents,
} from "@/api";
import { toriiClientAtom } from "@/atoms";
import { NAMESPACE } from "@/constants";

export type Achievement = {
  id: string;
  index: number;
  group: string;
  icon: string;
  title: string;
  description: string;
  count: number;
  total: number;
  completed: boolean;
  hidden: boolean;
};

interface AchievementsContextType {
  achievements: Achievement[];
  completeds: {
    event: AchievementCompleted;
    achievement: AchievementCreation;
  }[];
  status: "loading" | "error" | "success";
}

const AchievementsContext = createContext<AchievementsContextType | undefined>(
  undefined,
);

export function AchievementsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { address } = useAccount();
  const client = useAtomValue(toriiClientAtom);
  const entitySubscriptionRef = useRef<torii.Subscription | null>(null);
  const completedSubscriptionRef = useRef<torii.Subscription | null>(null);
  const entitySubscriptionKeyRef = useRef<string>();
  const completedSubscriptionKeyRef = useRef<string>();
  const [definitions, setDefinitions] = useState<AchievementDefinition[]>([]);
  const [creations, setCreations] = useState<Map<string, AchievementCreation>>(
    new Map(),
  );
  const creationsRef = useRef(creations);
  creationsRef.current = creations;
  const [completions, setCompletions] = useState<AchievementCompletion[]>([]);
  const [advancements, setAdvancements] = useState<AchievementAdvancement[]>(
    [],
  );
  const [completeds, setCompleteds] = useState<
    { event: AchievementCompleted; achievement: AchievementCreation }[]
  >([]);
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading",
  );

  const onEntityUpdate = useCallback((entities: torii.Entity[]) => {
    if (!entities.length) return;

    const parsedDefinitions = AchievementApi.parseDefinitions(entities);
    if (parsedDefinitions.length) {
      setDefinitions((prev) =>
        AchievementDefinition.deduplicate([...parsedDefinitions, ...prev]),
      );
    }

    const parsedCompletions = AchievementApi.parseCompletions(entities);
    if (parsedCompletions.length) {
      setCompletions((prev) =>
        AchievementCompletion.deduplicate([...parsedCompletions, ...prev]),
      );
    }

    const parsedAdvancements = AchievementApi.parseAdvancements(entities);
    if (parsedAdvancements.length) {
      setAdvancements((prev) =>
        AchievementAdvancement.deduplicate([...parsedAdvancements, ...prev]),
      );
    }

    const parsedCreations = AchievementApi.parseCreations(entities);
    if (parsedCreations.length) {
      setCreations((prev) => {
        const next = new Map(prev);
        for (const creation of parsedCreations) {
          next.set(creation.id, creation);
        }
        return next;
      });
    }
  }, []);
  const onEntityUpdateRef = useRef(onEntityUpdate);
  onEntityUpdateRef.current = onEntityUpdate;

  const onCompletedEvent = useCallback((entities: torii.Entity[]) => {
    if (!entities.length) return;

    const parsedCompleteds = AchievementApi.parseCompleted(entities);
    const resolved = parsedCompleteds
      .map((event) => {
        const achievement = creationsRef.current.get(event.achievement_id);
        return achievement ? { event, achievement } : undefined;
      })
      .filter(
        (
          item,
        ): item is {
          event: AchievementCompleted;
          achievement: AchievementCreation;
        } => !!item,
      );

    if (!resolved.length) return;

    setCompleteds((prev) =>
      [...resolved, ...prev].filter((item) => !item.event.hasExpired()),
    );
  }, []);
  const onCompletedEventRef = useRef(onCompletedEvent);
  onCompletedEventRef.current = onCompletedEvent;

  const handleEntityUpdate = useCallback((entities: torii.Entity[]) => {
    onEntityUpdateRef.current(entities);
  }, []);

  const handleCompletedEvent = useCallback((entities: torii.Entity[]) => {
    onCompletedEventRef.current(entities);
  }, []);

  const fetchStaticData = useCallback(async () => {
    if (!NAMESPACE || !client) return;

    const definitionsQuery = AchievementApi.definitionsQuery();
    const creationsQuery = AchievementApi.creationsQuery();

    await Promise.all([
      client
        .getEntities(definitionsQuery.build())
        .then((result) => handleEntityUpdate(result.items)),
      client
        .getEventMessages(creationsQuery.build())
        .then((result) => handleEntityUpdate(result.items)),
    ]);
  }, [NAMESPACE, client, handleEntityUpdate]);

  const fetchPlayerData = useCallback(async () => {
    if (!NAMESPACE || !client || !address) return;

    const playerQuery = AchievementApi.playerQuery(address);
    const completedQuery = AchievementApi.completedQuery(address);

    await Promise.all([
      client
        .getEntities(playerQuery.build())
        .then((result) => handleEntityUpdate(result.items)),
      client
        .getEventMessages(completedQuery.build())
        .then((result) => handleCompletedEvent(result.items)),
    ]);
  }, [NAMESPACE, client, address, handleEntityUpdate, handleCompletedEvent]);

  const setupPlayerSubscriptions = useCallback(async () => {
    if (!NAMESPACE || !client || !address) return;

    const playerClause = AchievementApi.playerQuery(address).build().clause;
    const completedClause =
      AchievementApi.completedQuery(address).build().clause;
    const playerKey = JSON.stringify(playerClause);
    const completedKey = JSON.stringify(completedClause);

    if (
      entitySubscriptionKeyRef.current !== playerKey ||
      !entitySubscriptionRef.current
    ) {
      if (entitySubscriptionRef.current) {
        entitySubscriptionRef.current.cancel();
        entitySubscriptionRef.current = null;
      }

      entitySubscriptionRef.current = await subscribeEntities(
        client,
        playerClause,
        handleEntityUpdate,
      );
      entitySubscriptionKeyRef.current = playerKey;
    }

    if (
      completedSubscriptionKeyRef.current !== completedKey ||
      !completedSubscriptionRef.current
    ) {
      if (completedSubscriptionRef.current) {
        completedSubscriptionRef.current.cancel();
        completedSubscriptionRef.current = null;
      }

      completedSubscriptionRef.current = await subscribeEvents(
        client,
        completedClause,
        handleCompletedEvent,
      );
      completedSubscriptionKeyRef.current = completedKey;
    }
  }, [NAMESPACE, client, address, handleEntityUpdate, handleCompletedEvent]);

  useEffect(() => {
    if (!NAMESPACE || !client) return;
    let cancelled = false;

    setStatus("loading");

    fetchStaticData()
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
    };
  }, [NAMESPACE, client, fetchStaticData]);

  useEffect(() => {
    if (!NAMESPACE || !client || !address) return;
    let cancelled = false;

    setStatus("loading");

    const run = async () => {
      await fetchPlayerData();
      await setupPlayerSubscriptions();
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
      if (entitySubscriptionRef.current) {
        entitySubscriptionRef.current.cancel();
        entitySubscriptionRef.current = null;
      }
      if (completedSubscriptionRef.current) {
        completedSubscriptionRef.current.cancel();
        completedSubscriptionRef.current = null;
      }
      entitySubscriptionKeyRef.current = undefined;
      completedSubscriptionKeyRef.current = undefined;
    };
  }, [NAMESPACE, client, address, fetchPlayerData, setupPlayerSubscriptions]);

  const achievements: Achievement[] = useMemo(() => {
    return definitions
      .map((definition) => {
        const creation = creations.get(definition.id);
        const completion = completions.find(
          (c) => c.achievement_id === definition.id,
        );
        const totalCount = definition.tasks.reduce((acc, task) => {
          const advancement = advancements.find(
            (a) => a.achievement_id === definition.id && a.task_id === task.id,
          );
          return acc + Number(advancement?.count || 0n);
        }, 0);
        const totalTotal = definition.tasks.reduce(
          (acc, task) => acc + Number(task.total),
          0,
        );
        return {
          id: definition.id,
          index: creation?.index ?? 0,
          group: creation?.group || "",
          icon: creation?.icon || "",
          title: creation?.title || definition.id,
          description:
            creation?.tasks[0]?.description || creation?.description || "",
          count: (completion?.timestamp || 0) > 0 ? totalTotal : totalCount,
          total: totalTotal,
          completed: (completion?.timestamp || 0) > 0,
          hidden: creation?.hidden || false,
        };
      })
      .sort((a, b) => a.id.localeCompare(b.id));
  }, [definitions, creations, completions, advancements]);

  const value: AchievementsContextType = {
    achievements,
    completeds,
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
