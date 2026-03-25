import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { LaurelIcon, QuestIcon, ShadowEffect } from "@/components/icons";
import {
  Achievements,
  type AchievementsProps,
} from "@/components/containers/achievements";
import { Quests, type QuestsProps } from "@/components/containers/quests";
import {
  AchievementCount,
  Close,
  NotificationPing,
} from "@/components/elements";
import { QuestCount } from "@/components/elements/quest-count";
import { QuestGift } from "@/components/elements/quest-gift";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useId, useState } from "react";

export type MissionTab = "quests" | "achievements";

export interface MissionSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof missionSceneVariants> {
  achievementsProps: AchievementsProps;
  questsProps: QuestsProps;
  defaultTab?: MissionTab;
  hasQuestNotification?: boolean;
  hasAchievementNotification?: boolean;
  newQuestIds?: Set<string>;
  newAchievementIds?: Set<string>;
  onClose?: () => void;
}

const missionSceneVariants = cva(
  "select-none flex items-center justify-center gap-6 md:gap-10 px-1 py-2 xs:px-5 xs:py-6 md:py-[120px] overflow-hidden w-full",
  {
    variants: {
      variant: {
        default:
          "rounded-2xl md:rounded-3xl bg-black-200 backdrop-blur-[8px] border-[2px] border-black-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const MissionScene = ({
  achievementsProps,
  questsProps,
  defaultTab = "quests",
  hasQuestNotification,
  hasAchievementNotification,
  newQuestIds,
  newAchievementIds,
  onClose,
  variant,
  className,
  ...props
}: MissionSceneProps) => {
  const filterId = useId();
  const [tab, setTab] = useState<MissionTab>(defaultTab);

  const questCount = questsProps.quests.filter(
    (q) => q.count >= q.total,
  ).length;
  const questTotal = questsProps.quests.length;
  const achievementCount = achievementsProps.achievements.filter(
    (a) => a.count >= a.total,
  ).length;
  const achievementTotal = achievementsProps.achievements.length;

  return (
    <div
      className={cn(missionSceneVariants({ variant, className }))}
      {...props}
    >
      <ShadowEffect filterId={filterId} />

      {/* Mobile */}
      <div className="flex flex-col md:hidden gap-6 w-full h-full">
        <div className="flex items-center justify-between w-full px-1">
          <Title />
          <div className="flex items-center gap-3">
            {tab === "quests" ? (
              <QuestCount count={questCount} total={questTotal} />
            ) : (
              <AchievementCount
                count={achievementCount}
                total={achievementTotal}
              />
            )}
            {onClose && <Close size="md" onClick={onClose} />}
          </div>
        </div>
        <MissionTabs
          value={tab}
          onValueChange={setTab}
          hasQuestNotification={hasQuestNotification && tab !== "quests"}
          hasAchievementNotification={
            hasAchievementNotification && tab !== "achievements"
          }
          className="w-full"
        />
        {tab === "quests" ? (
          <Quests
            {...questsProps}
            newQuestIds={newQuestIds}
            className="overflow-hidden"
          />
        ) : (
          <Achievements
            {...achievementsProps}
            newAchievementIds={newAchievementIds}
            className="overflow-hidden"
          />
        )}
      </div>

      {/* Desktop */}
      <div className="hidden md:flex md:flex-col md:items-stretch overflow-hidden h-full w-full">
        {onClose && (
          <Close
            size="lg"
            onClick={onClose}
            className="absolute z-10 top-8 right-8"
          />
        )}
        <div className="h-full w-full max-w-[720px] self-center overflow-hidden flex flex-col gap-6 md:gap-8">
          <div className="flex items-center justify-between">
            <Title />
            {tab === "quests" ? (
              <div className="flex items-center gap-2">
                {questCount < questTotal && <QuestGift direction="right" />}
                <QuestCount count={questCount} total={questTotal} />
              </div>
            ) : (
              <AchievementCount
                count={achievementCount}
                total={achievementTotal}
              />
            )}
          </div>
          <MissionTabs
            value={tab}
            onValueChange={setTab}
            hasQuestNotification={hasQuestNotification && tab !== "quests"}
            hasAchievementNotification={
              hasAchievementNotification && tab !== "achievements"
            }
            className="w-full"
          />
          {tab === "quests" ? (
            <Quests {...questsProps} newQuestIds={newQuestIds} />
          ) : (
            <Achievements
              {...achievementsProps}
              newAchievementIds={newAchievementIds}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const Title = () => {
  return (
    <h2
      className="text-[36px]/6 md:text-[64px]/[44px] text-white-100 uppercase tracking-wider translate-y-0.5"
      style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
    >
      Missions
    </h2>
  );
};

const MissionTabs = ({
  value,
  onValueChange,
  hasQuestNotification,
  hasAchievementNotification,
  className,
}: {
  value: MissionTab;
  onValueChange: (value: MissionTab) => void;
  hasQuestNotification?: boolean;
  hasAchievementNotification?: boolean;
  className?: string;
}) => {
  const filterId = useId();

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(newValue: string) => {
        if (newValue) {
          onValueChange(newValue as MissionTab);
        }
      }}
      variant="default"
      size="default"
      className={cn("h-10", className)}
    >
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="2"
              dy="2"
              stdDeviation="0"
              floodColor="rgba(0, 0, 0, 1)"
            />
          </filter>
        </defs>
      </svg>
      <ToggleGroupItem
        value="quests"
        aria-label="Quests"
        className="relative h-10 flex-1 flex gap-0.5 py-2 px-3 rounded-l-lg min-w-auto"
      >
        {hasQuestNotification && <NotificationPing />}
        <QuestIcon
          size="md"
          className="min-w-6 min-h-6"
          style={{
            filter: value === "quests" ? `url(#${filterId})` : undefined,
          }}
        />
        <span
          className="text-white-100 text-[22px]/[15px] tracking-wider translate-y-0.5 px-1"
          style={{
            textShadow:
              value === "quests" ? "2px 2px 0px rgba(0, 0, 0, 1)" : undefined,
          }}
        >
          Quests
        </span>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="achievements"
        aria-label="Achievements"
        className="relative h-10 flex-1 flex gap-0.5 py-2 px-3 rounded-r-lg min-w-auto"
      >
        {hasAchievementNotification && <NotificationPing />}
        <LaurelIcon
          size="md"
          className="min-w-6 min-h-6"
          style={{
            filter: value === "achievements" ? `url(#${filterId})` : undefined,
          }}
        />
        <span
          className="text-white-100 text-[22px]/[15px] tracking-wider translate-y-0.5 px-1"
          style={{
            textShadow:
              value === "achievements"
                ? "2px 2px 0px rgba(0, 0, 0, 1)"
                : undefined,
          }}
        >
          Achievements
        </span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
};
