import { useMemo } from "react";
import { useAchievements } from "@/context/achievements";
import type { AchievementsProps } from "@/components/containers/achievements";
import type { AchievementCardProps } from "@/components/elements";

export function useAchievementScene(): AchievementsProps {
  const { achievements } = useAchievements();

  const achievementCards: (AchievementCardProps & { id: string })[] =
    useMemo(() => {
      return achievements
        .map((achievement) => ({
          id: achievement.id,
          icon: achievement.icon,
          title: achievement.title,
          description: achievement.description,
          count: achievement.count,
          total: achievement.total,
          hidden: achievement.hidden,
        }))
        .sort((a, b) => a.id.localeCompare(b.id))
        .sort((a, b) => (a.hidden === b.hidden ? 0 : a.hidden ? 1 : -1))
        .sort((a, b) => {
          const progressA = a.total > 0 ? a.count / a.total : 0;
          const progressB = b.total > 0 ? b.count / b.total : 0;
          return progressB - progressA;
        });
    }, [achievements]);

  return {
    achievements: achievementCards,
  };
}
