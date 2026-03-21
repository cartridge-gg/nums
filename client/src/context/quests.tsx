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
  QuestAdvancement,
  QuestCompletion,
  QuestDefinition,
  QuestCreation,
  type QuestCompleted,
  type QuestClaimed,
} from "@/models";
import { useAccount } from "@starknet-react/core";
import { Quest, subscribeEntities, subscribeEvents } from "@/api";
import { toriiClientAtom } from "@/atoms";
import { NAMESPACE } from "@/constants";
import type { QuestReward } from "@/models/quest";

export type Quests = {
  id: string;
  intervalId: number;
  name: string;
  description: string;
  icon: string;
  end: number;
  completed: boolean;
  locked: boolean;
  claimed: boolean;
  progression: number;
  registry: string;
  rewards: QuestReward[];
  tasks: {
    description: string;
    total: bigint;
    count: bigint;
  }[];
};

interface QuestsContextType {
  quests: Quests[];
  completeds: { event: QuestCompleted; quest: QuestCreation }[];
  claimeds: { event: QuestClaimed; quest: QuestCreation }[];
  status: "loading" | "error" | "success";
  refresh: () => Promise<void>;
}

const QuestsContext = createContext<QuestsContextType | undefined>(undefined);

export function QuestsProvider({ children }: { children: React.ReactNode }) {
  const { address } = useAccount();
  const client = useAtomValue(toriiClientAtom);
  const entitySubscriptionRef = useRef<torii.Subscription | null>(null);
  const eventSubscriptionRef = useRef<torii.Subscription | null>(null);
  const entitySubscriptionKeyRef = useRef<string>();
  const eventSubscriptionKeyRef = useRef<string>();
  const [definitions, setDefinitions] = useState<QuestDefinition[]>([]);
  const [completions, setCompletions] = useState<QuestCompletion[]>([]);
  const [advancements, setAdvancements] = useState<QuestAdvancement[]>([]);
  const [creations, setCreations] = useState<QuestCreation[]>([]);
  const creationsRef = useRef(creations);
  creationsRef.current = creations;
  const [completeds, setCompleteds] = useState<
    { event: QuestCompleted; quest: QuestCreation }[]
  >([]);
  const [claimeds, setClaimeds] = useState<
    { event: QuestClaimed; quest: QuestCreation }[]
  >([]);
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading",
  );

  const onEntityUpdate = useCallback((entities: torii.Entity[]) => {
    if (!entities.length) return;

    const parsedDefinitions = Quest.parseDefinitions(entities);
    if (parsedDefinitions.length) {
      setDefinitions((prev) =>
        QuestDefinition.deduplicate([...parsedDefinitions, ...prev]),
      );
    }

    const parsedCompletions = Quest.parseCompletions(entities);
    if (parsedCompletions.length) {
      setCompletions((prev) =>
        QuestCompletion.deduplicate([...parsedCompletions, ...prev]),
      );
    }

    const parsedAdvancements = Quest.parseAdvancements(entities);
    if (parsedAdvancements.length) {
      setAdvancements((prev) =>
        QuestAdvancement.deduplicate([...parsedAdvancements, ...prev]),
      );
    }

    const parsedCreations = Quest.parseCreations(entities);
    if (parsedCreations.length) {
      setCreations((prev) =>
        QuestCreation.deduplicate([...parsedCreations, ...prev]),
      );
    }
  }, []);
  const onEntityUpdateRef = useRef(onEntityUpdate);
  onEntityUpdateRef.current = onEntityUpdate;

  const onQuestEvent = useCallback((entities: torii.Entity[]) => {
    if (!entities.length) return;

    const completedEvents = Quest.parseCompleted(entities);
    const completedWithQuest = completedEvents
      .map((event) => {
        const quest = creationsRef.current.find(
          (creation) => creation.definition.id === event.quest_id,
        );
        return quest ? { event, quest } : undefined;
      })
      .filter(
        (
          item,
        ): item is {
          event: QuestCompleted;
          quest: QuestCreation;
        } => !!item,
      );

    if (completedWithQuest.length) {
      setCompleteds((prev) => [...completedWithQuest, ...prev]);
    }

    const claimedEvents = Quest.parseClaimed(entities);
    const claimedWithQuest = claimedEvents
      .map((event) => {
        const quest = creationsRef.current.find(
          (creation) => creation.definition.id === event.quest_id,
        );
        return quest ? { event, quest } : undefined;
      })
      .filter(
        (
          item,
        ): item is {
          event: QuestClaimed;
          quest: QuestCreation;
        } => !!item,
      );

    if (claimedWithQuest.length) {
      setClaimeds((prev) =>
        [...claimedWithQuest, ...prev].filter(
          (item) => !item.event.hasExpired(),
        ),
      );
    }
  }, []);
  const onQuestEventRef = useRef(onQuestEvent);
  onQuestEventRef.current = onQuestEvent;

  const handleEntityUpdate = useCallback((entities: torii.Entity[]) => {
    onEntityUpdateRef.current(entities);
  }, []);

  const handleQuestEvent = useCallback((entities: torii.Entity[]) => {
    onQuestEventRef.current(entities);
  }, []);

  const refresh = useCallback(async () => {
    if (!NAMESPACE || !client) return;

    const definitionsQuery = Quest.definitionsQuery();
    const creationsQuery = Quest.creationsQuery();

    await Promise.all([
      client
        .getEntities(definitionsQuery.build())
        .then((result) => handleEntityUpdate(result.items)),
      client
        .getEventMessages(creationsQuery.build())
        .then((result) => handleEntityUpdate(result.items)),
    ]);

    if (!address) return;

    const eventsQuery = Quest.eventsQuery(address);
    const playerQuery = Quest.playerQuery(address);

    await Promise.all([
      client
        .getEntities(playerQuery.build())
        .then((result) => handleEntityUpdate(result.items)),
      client
        .getEventMessages(eventsQuery.build())
        .then((result) => handleQuestEvent(result.items)),
    ]);
  }, [NAMESPACE, client, address, handleEntityUpdate, handleQuestEvent]);

  const fetchStaticData = useCallback(async () => {
    if (!NAMESPACE || !client) return;

    const definitionsQuery = Quest.definitionsQuery();
    const creationsQuery = Quest.creationsQuery();

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

    const eventsQuery = Quest.eventsQuery(address);
    const playerQuery = Quest.playerQuery(address);

    await Promise.all([
      client
        .getEntities(playerQuery.build())
        .then((result) => handleEntityUpdate(result.items)),
      client
        .getEventMessages(eventsQuery.build())
        .then((result) => handleQuestEvent(result.items)),
    ]);
  }, [NAMESPACE, client, address, handleEntityUpdate, handleQuestEvent]);

  const setupPlayerSubscriptions = useCallback(async () => {
    if (!NAMESPACE || !client || !address) return;

    const playerClause = Quest.playerQuery(address).build().clause;
    const eventsClause = Quest.eventsQuery(address).build().clause;
    const playerKey = JSON.stringify(playerClause);
    const eventsKey = JSON.stringify(eventsClause);

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
      eventSubscriptionKeyRef.current !== eventsKey ||
      !eventSubscriptionRef.current
    ) {
      if (eventSubscriptionRef.current) {
        eventSubscriptionRef.current.cancel();
        eventSubscriptionRef.current = null;
      }

      eventSubscriptionRef.current = await subscribeEvents(
        client,
        eventsClause,
        handleQuestEvent,
      );
      eventSubscriptionKeyRef.current = eventsKey;
    }
  }, [NAMESPACE, client, address, handleEntityUpdate, handleQuestEvent]);

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
      if (eventSubscriptionRef.current) {
        eventSubscriptionRef.current.cancel();
        eventSubscriptionRef.current = null;
      }
      entitySubscriptionKeyRef.current = undefined;
      eventSubscriptionKeyRef.current = undefined;
    };
  }, [NAMESPACE, client, address, fetchPlayerData, setupPlayerSubscriptions]);

  const quests: Quests[] = useMemo(() => {
    const questList = definitions.map((definition) => {
      const intervalId = definition.getIntervalId();
      const creation = creations.find(
        (creation) => creation.definition.id === definition.id,
      );
      const completion = completions.find(
        (completion) =>
          completion.quest_id === definition.id &&
          completion.interval_id === intervalId,
      );
      return {
        id: definition.id,
        intervalId: intervalId || 0,
        name: creation?.metadata.name || "Quest",
        description: creation?.metadata.description || "",
        icon: creation?.metadata.icon || "",
        registry: creation?.metadata.registry || "",
        end: definition.getNextEnd() || 0,
        completed: (completion?.timestamp || 0) > 0,
        claimed: !!completion && !completion.unclaimed,
        locked: (completion?.lock_count || 0) > 0,
        conditions: definition.conditions,
        progression: 0,
        rewards: creation?.metadata.rewards || [],
        tasks: definition.tasks.map((task) => {
          const advancement = advancements.find(
            (advancement) =>
              advancement.quest_id === definition.id &&
              advancement.task_id === task.id &&
              advancement.interval_id === intervalId,
          );
          return {
            description: task.description,
            total: task.total,
            count: advancement?.count || 0n,
          };
        }),
      };
    });

    return questList
      .map((quest) => {
        const unlocked =
          quest.conditions.every(
            (questId) => questList.find((q) => q.id === questId)?.completed,
          ) || false;
        return {
          ...quest,
          locked: !unlocked,
          progression: quest.tasks.reduce(
            (acc, task) =>
              acc + (Number(task.count) / Number(task.total)) * 100,
            0,
          ),
        };
      })
      .sort((a, b) => a.id.localeCompare(b.id))
      .sort((a, b) => (a.end > b.end ? 1 : -1))
      .sort((a, b) => b.progression - a.progression)
      .sort((a, b) => (a.completed && !b.completed ? -1 : 1));
  }, [definitions, completions, advancements, creations]);

  const value: QuestsContextType = {
    quests,
    completeds,
    claimeds,
    status,
    refresh,
  };

  return (
    <QuestsContext.Provider value={value}>{children}</QuestsContext.Provider>
  );
}

export function useQuests() {
  const context = useContext(QuestsContext);
  if (!context) {
    throw new Error("useQuestContext must be used within a QuestProvider");
  }
  return context;
}
