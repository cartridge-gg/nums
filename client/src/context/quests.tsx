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
import {
  ClauseBuilder,
  type SubscriptionCallbackArgs,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import type * as torii from "@dojoengine/torii-wasm";
import {
  QuestAdvancement,
  QuestCompletion,
  QuestDefinition,
  QuestCreation,
  QuestClaimed,
  type RawQuestDefinition,
  type RawQuestCompletion,
  type RawQuestAdvancement,
  type RawQuestCreation,
  type RawQuestClaimed,
} from "@/models";
import { getChecksumAddress } from "starknet";
import { useAccount } from "@starknet-react/core";
import { useEntities } from "./entities";
import { NAMESPACE } from "@/constants";
import type { QuestReward } from "@/models/quest";

export type Quests = {
  id: string;
  intervalId: number;
  name: string;
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
  claimeds: { event: QuestClaimed; quest: QuestCreation }[];
  status: "loading" | "error" | "success";
  refresh: () => Promise<void>;
}

const QuestsContext = createContext<QuestsContextType | undefined>(undefined);

const getQuestEntityQuery = (NAMESPACE: string) => {
  const definition: `${string}-${string}` = `${NAMESPACE}-${QuestDefinition.getModelName()}`;
  const clauses = new ClauseBuilder().keys(
    [definition],
    [undefined],
    "FixedLen",
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
};

const getQuestEventQuery = (NAMESPACE: string) => {
  const creation: `${string}-${string}` = `${NAMESPACE}-${QuestCreation.getModelName()}`;
  const clauses = new ClauseBuilder().keys([creation], [undefined], "FixedLen");
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
};

const getPlayerEntityQuery = (NAMESPACE: string, playerId: string) => {
  const completion: `${string}-${string}` = `${NAMESPACE}-${QuestCompletion.getModelName()}`;
  const advancement: `${string}-${string}` = `${NAMESPACE}-${QuestAdvancement.getModelName()}`;
  const key = getChecksumAddress(BigInt(playerId)).toLowerCase();
  const clauses = new ClauseBuilder().keys(
    [completion, advancement],
    [key],
    "VariableLen",
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
};

const getPlayerEventQuery = (NAMESPACE: string, playerId: string) => {
  // const unlocked: `${string}-${string}` = `${NAMESPACE}-${QuestUnlocked.getModelName()}`;
  // const completed: `${string}-${string}` = `${NAMESPACE}-${QuestCompleted.getModelName()}`;
  const claimeds: `${string}-${string}` = `${NAMESPACE}-${QuestClaimed.getModelName()}`;
  const key = getChecksumAddress(BigInt(playerId)).toLowerCase();
  const clauses = new ClauseBuilder().keys([claimeds], [key], "VariableLen");
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
};

export function QuestsProvider({ children }: { children: React.ReactNode }) {
  const { address } = useAccount();
  const { client } = useEntities();
  const entitySubscriptionRef = useRef<torii.Subscription | null>(null);
  const eventSubscriptionRef = useRef<torii.Subscription | null>(null);
  const [definitions, setDefinitions] = useState<QuestDefinition[]>([]);
  const [completions, setCompletions] = useState<QuestCompletion[]>([]);
  const [advancements, setAdvancements] = useState<QuestAdvancement[]>([]);
  const [creations, setCreations] = useState<QuestCreation[]>([]);
  const [claimeds, setClaimeds] = useState<
    { event: QuestClaimed; quest: QuestCreation }[]
  >([]);
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading",
  );

  // Handler for entity updates (definitions, completions, advancements, creations)
  const onEntityUpdate = useCallback(
    (data: SubscriptionCallbackArgs<torii.Entity[], Error>) => {
      if (!data || data.error) return;
      (data.data || [data] || []).forEach((entity) => {
        if (entity.models[`${NAMESPACE}-${QuestDefinition.getModelName()}`]) {
          const model = entity.models[
            `${NAMESPACE}-${QuestDefinition.getModelName()}`
          ] as unknown as RawQuestDefinition;
          setDefinitions((prev) =>
            QuestDefinition.deduplicate([
              QuestDefinition.parse(model),
              ...prev,
            ]),
          );
        }
        if (entity.models[`${NAMESPACE}-${QuestCompletion.getModelName()}`]) {
          const model = entity.models[
            `${NAMESPACE}-${QuestCompletion.getModelName()}`
          ] as unknown as RawQuestCompletion;
          setCompletions((prev) =>
            QuestCompletion.deduplicate([
              QuestCompletion.parse(model),
              ...prev,
            ]),
          );
        }
        if (entity.models[`${NAMESPACE}-${QuestAdvancement.getModelName()}`]) {
          const model = entity.models[
            `${NAMESPACE}-${QuestAdvancement.getModelName()}`
          ] as unknown as RawQuestAdvancement;
          setAdvancements((prev) =>
            QuestAdvancement.deduplicate([
              QuestAdvancement.parse(model),
              ...prev,
            ]),
          );
        }
        if (entity.models[`${NAMESPACE}-${QuestCreation.getModelName()}`]) {
          const model = entity.models[
            `${NAMESPACE}-${QuestCreation.getModelName()}`
          ] as unknown as RawQuestCreation;
          setCreations((prev) =>
            QuestCreation.deduplicate([QuestCreation.parse(model), ...prev]),
          );
        }
      });
    },
    [NAMESPACE],
  );

  // Handler for quest events (unlocked, completed, claimed) - triggers toasts
  const onQuestEvent = useCallback(
    (data: SubscriptionCallbackArgs<torii.Entity[], Error>) => {
      if (!data || data.error) return;
      (data.data || [data] || []).forEach((entity) => {
        if (entity.models[`${NAMESPACE}-${QuestClaimed.getModelName()}`]) {
          const model = entity.models[
            `${NAMESPACE}-${QuestClaimed.getModelName()}`
          ] as unknown as RawQuestClaimed;
          const event = QuestClaimed.parse(model);
          const quest = creations.find(
            (creation) => creation.definition.id === event.quest_id,
          );
          if (quest) {
            setClaimeds((prev) =>
              [{ event, quest }, ...prev].filter(
                (item) => !item.event.hasExpired(),
              ),
            );
          }
        }
      });
    },
    [NAMESPACE, creations],
  );

  // Refresh function to fetch and subscribe to data
  const refresh = useCallback(async () => {
    if (!NAMESPACE || !client || !address) return;

    // Cancel existing subscriptions
    if (entitySubscriptionRef.current) {
      entitySubscriptionRef.current = null;
    }
    if (eventSubscriptionRef.current) {
      eventSubscriptionRef.current = null;
    }

    // Create queries
    const questEntityQuery = getQuestEntityQuery(NAMESPACE);
    const questEventQuery = getQuestEventQuery(NAMESPACE);
    const playerEventQuery = getPlayerEventQuery(NAMESPACE, address);
    const playerEntityQuery = getPlayerEntityQuery(NAMESPACE, address);

    // Fetch initial data
    await Promise.all([
      client
        .getEntities(questEntityQuery.build())
        .then((result) =>
          onEntityUpdate({ data: result.items, error: undefined }),
        ),
      client
        .getEventMessages(questEventQuery.build())
        .then((result) =>
          onEntityUpdate({ data: result.items, error: undefined }),
        ),
      client
        .getEntities(playerEntityQuery.build())
        .then((result) =>
          onEntityUpdate({ data: result.items, error: undefined }),
        ),
    ]);

    // Subscribe to entity and event updates
    if (!creations.length) return;
    client
      .onEventMessageUpdated(playerEventQuery.build().clause, [], onQuestEvent)
      .then((response) => (eventSubscriptionRef.current = response));
    client
      .onEntityUpdated(playerEntityQuery.build().clause, [], onEntityUpdate)
      .then((response) => (entitySubscriptionRef.current = response));
  }, [NAMESPACE, client, address, onEntityUpdate, onQuestEvent, creations]);

  // Initial fetch and subscription setup
  useEffect(() => {
    if (entitySubscriptionRef.current || eventSubscriptionRef.current) return;
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
      if (entitySubscriptionRef.current) {
        entitySubscriptionRef.current.cancel();
      }
      if (eventSubscriptionRef.current) {
        eventSubscriptionRef.current.cancel();
      }
    };
  }, [refresh, client]);

  // Compute quests from the raw data
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
