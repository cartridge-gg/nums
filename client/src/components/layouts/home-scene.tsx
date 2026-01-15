import { useState } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Tabs, TabsList, TabsContent } from "@/components/ui/tabs";
import type * as TabsPrimitive from "@radix-ui/react-tabs";
import { QuestTab, LeaderboardTab } from "@/components/elements";
import { Info, Play, Highlight } from "@/components/elements";
import { Quests, type QuestsProps } from "@/components/containers/quests";
import {
  Leaderboard,
  type LeaderboardProps,
} from "@/components/containers/leaderboard";

export interface HomeSceneProps
  extends Omit<
      React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>,
      "value" | "onValueChange" | "defaultValue"
    >,
    VariantProps<typeof homeSceneVariants> {
  quests: QuestsProps["quests"];
  questsExpiration: QuestsProps["expiration"];
  leaderboardRows: LeaderboardProps["rows"];
  totalGames: string;
  avgScore: string;
}

const homeSceneVariants = cva(
  "select-none flex flex-col gap-4 md:gap-6 w-full h-full p-6 pb-8 md:p-0 md:pb-0",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const HomeScene = ({
  quests,
  questsExpiration,
  leaderboardRows,
  totalGames,
  avgScore,
  variant,
  className,
  ...props
}: HomeSceneProps) => {
  const [activeTab, setActiveTab] = useState<string>("quest");

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className={cn(homeSceneVariants({ variant, className }))}
      {...props}
    >
      {/* Header with tabs and buttons */}
      <div className="flex justify-between items-center gap-4">
        <TabsList className="gap-3 bg-transparent p-0">
          <QuestTab value="quest" />
          <LeaderboardTab value="leaderboard" />
        </TabsList>
        <div className="flex items-center gap-3">
          <Info />
          <Play className="hidden md:flex" />
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "quest" ? (
        <>
          {/* Highlights */}
          <div className="flex gap-4">
            <Highlight
              title="Total games"
              content={totalGames}
              className="flex-1"
            />
            <Highlight
              title="Avg. score"
              content={avgScore}
              className="flex-1"
            />
          </div>
          {/* Quests */}
          <TabsContent value="quest" className="mt-0 flex-1 min-h-0">
            <Quests
              quests={quests}
              expiration={questsExpiration}
              className="h-full"
            />
          </TabsContent>
        </>
      ) : (
        <TabsContent value="leaderboard" className="mt-0 flex-1 min-h-0">
          <Leaderboard rows={leaderboardRows} className="h-full" />
        </TabsContent>
      )}
      <Play className="md:hidden" />
    </Tabs>
  );
};
