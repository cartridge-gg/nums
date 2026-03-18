import { useMemo } from "react";
import { useQuests } from "@/context/quests";
import type { QuestsProps } from "@/components/containers/quests";

export function useQuestScene(): QuestsProps {
  const { quests } = useQuests();

  return useMemo(() => {
    const activeQuests = quests.filter(
      (quest) => !quest.locked && quest.end > 0 && quest.name !== "Compliance",
    );

    const questProps = activeQuests.map((quest) => {
      const totalCount = quest.tasks.reduce(
        (acc, task) => acc + Number(task.count),
        0,
      );
      const totalTotal = quest.tasks.reduce(
        (acc, task) => acc + Number(task.total),
        0,
      );

      return {
        id: quest.id,
        icon: quest.icon,
        title: quest.name,
        description: quest.tasks[0]?.description || quest.description,
        count: totalCount,
        total: totalTotal,
      };
    });

    const expiration = activeQuests.length > 0 ? activeQuests[0].end : 0;

    return {
      quests: questProps,
      expiration,
    };
  }, [quests]);
}
