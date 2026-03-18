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
  AchievementDefinition,
  AchievementCompletion,
  AchievementAdvancement,
  AchievementCreation,
  AchievementCompleted,
  type RawAchievementDefinition,
  type RawAchievementCompletion,
  type RawAchievementAdvancement,
  type RawAchievementCreation,
  type RawAchievementCompleted,
} from "@/models";
import { getChecksumAddress } from "starknet";
import { useAccount } from "@starknet-react/core";
import { useEntities } from "./entities";
import { NAMESPACE } from "@/constants";

export type Achievement = {
  id: string;
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

const getAchievementEntityQuery = (NAMESPACE: string) => {
  const definition: `${string}-${string}` = `${NAMESPACE}-${AchievementDefinition.getModelName()}`;
  const clauses = new ClauseBuilder().keys(
    [definition],
    [undefined],
    "FixedLen",
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
};

const getAchievementCreationEventQuery = (NAMESPACE: string) => {
  const creation: `${string}-${string}` = `${NAMESPACE}-${AchievementCreation.getModelName()}`;
  const clauses = new ClauseBuilder().keys([creation], [undefined], "FixedLen");
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
};

const getPlayerEntityQuery = (NAMESPACE: string, playerId: string) => {
  const completion: `${string}-${string}` = `${NAMESPACE}-${AchievementCompletion.getModelName()}`;
  const advancement: `${string}-${string}` = `${NAMESPACE}-${AchievementAdvancement.getModelName()}`;
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
  const entitySubscriptionRef = useRef<torii.Subscription | null>(null);
  const completedSubscriptionRef = useRef<torii.Subscription | null>(null);
  const [definitions, setDefinitions] = useState<AchievementDefinition[]>([]);
  const [creations, setCreations] = useState<Map<string, AchievementCreation>>(
    new Map(),
  );
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

  const onEntityUpdate = useCallback(
    (data: SubscriptionCallbackArgs<torii.Entity[], Error>) => {
      if (!data || data.error) return;
      (data.data || [data] || []).forEach((entity) => {
        if (
          entity.models[`${NAMESPACE}-${AchievementDefinition.getModelName()}`]
        ) {
          const model = entity.models[
            `${NAMESPACE}-${AchievementDefinition.getModelName()}`
          ] as unknown as RawAchievementDefinition;
          setDefinitions((prev) =>
            AchievementDefinition.deduplicate([
              AchievementDefinition.parse(model),
              ...prev,
            ]),
          );
        }
        if (
          entity.models[`${NAMESPACE}-${AchievementCompletion.getModelName()}`]
        ) {
          const model = entity.models[
            `${NAMESPACE}-${AchievementCompletion.getModelName()}`
          ] as unknown as RawAchievementCompletion;
          setCompletions((prev) =>
            AchievementCompletion.deduplicate([
              AchievementCompletion.parse(model),
              ...prev,
            ]),
          );
        }
        if (
          entity.models[`${NAMESPACE}-${AchievementAdvancement.getModelName()}`]
        ) {
          const model = entity.models[
            `${NAMESPACE}-${AchievementAdvancement.getModelName()}`
          ] as unknown as RawAchievementAdvancement;
          setAdvancements((prev) =>
            AchievementAdvancement.deduplicate([
              AchievementAdvancement.parse(model),
              ...prev,
            ]),
          );
        }
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
            setCompleteds((prev) =>
              [{ event, achievement }, ...prev].filter(
                (item) => !item.event.hasExpired(),
              ),
            );
          }
        }
      });
    },
    [NAMESPACE, creations],
  );

  const refresh = useCallback(async () => {
    if (!NAMESPACE || !client || !address) return;

    if (entitySubscriptionRef.current) {
      entitySubscriptionRef.current = null;
    }
    if (completedSubscriptionRef.current) {
      completedSubscriptionRef.current = null;
    }

    const achievementEntityQuery = getAchievementEntityQuery(NAMESPACE);
    const creationEventQuery = getAchievementCreationEventQuery(NAMESPACE);
    const playerEntityQuery = getPlayerEntityQuery(NAMESPACE, address);
    const completedEventQuery = getPlayerCompletedEventQuery(
      NAMESPACE,
      address,
    );

    await Promise.all([
      client
        .getEntities(achievementEntityQuery.build())
        .then((result) =>
          onEntityUpdate({ data: result.items, error: undefined }),
        ),
      client
        .getEventMessages(creationEventQuery.build())
        .then((result) =>
          onEntityUpdate({ data: result.items, error: undefined }),
        ),
      client
        .getEntities(playerEntityQuery.build())
        .then((result) =>
          onEntityUpdate({ data: result.items, error: undefined }),
        ),
    ]);

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

    client
      .onEntityUpdated(playerEntityQuery.build().clause, [], onEntityUpdate)
      .then((response) => (entitySubscriptionRef.current = response))
      .catch((error) => {
        console.error("Error subscribing to entity updates:", error);
      });
  }, [NAMESPACE, client, address, onEntityUpdate, onCompletedEvent]);

  useEffect(() => {
    if (entitySubscriptionRef.current || completedSubscriptionRef.current) {
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
      if (entitySubscriptionRef.current) {
        entitySubscriptionRef.current.cancel();
      }
      if (completedSubscriptionRef.current) {
        completedSubscriptionRef.current.cancel();
      }
    };
  }, [refresh]);

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
