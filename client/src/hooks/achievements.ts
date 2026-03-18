import { useMemo } from "react";
import { useAchievements } from "@/context/achievements";
import type { AchievementsProps } from "@/components/containers/achievements";
import type { AchievementCardProps } from "@/components/elements";

export function useAchievementScene(): AchievementsProps {
  const { achievements } = useAchievements();

  const achievementCards: (AchievementCardProps & { id: string })[] =
    useMemo(() => {
      return achievements.map((achievement) => ({
        id: achievement.id,
        icon: achievement.icon,
        title: achievement.title,
        description: achievement.description,
        count: achievement.count,
        total: achievement.total,
        hidden: achievement.hidden,
      }));
    }, [achievements]);

  return {
    achievements: achievementCards,
  };
}
