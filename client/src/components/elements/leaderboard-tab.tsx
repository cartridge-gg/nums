import { TabsTrigger } from "@/components/ui/tabs";
import * as icons from "@/components/icons";
import { useId } from "react";

export interface LeaderboardTabProps
  extends React.ComponentPropsWithoutRef<typeof TabsTrigger> {}

export const LeaderboardTab = ({
  value = "leaderboard",
  ...props
}: LeaderboardTabProps) => {
  const filterId = useId();
  return (
    <TabsTrigger value={value} {...props}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="2"
              dy="2"
              stdDeviation="0"
              floodColor="rgba(0, 0, 0, 0.25)"
            />
          </filter>
        </defs>
      </svg>
      <icons.TrophyIcon
        variant="solid"
        size="md"
        className="text-white-400 group-hover:text-white-200 group-data-[state=active]:text-white-100 transition-colors duration-150"
        style={{ filter: `url(#${filterId})` }}
      />
      <span
        className="hidden md:inline font-primary text-[28px]/[19px] tracking-wider text-white-400 group-hover:text-white-200 group-data-[state=active]:text-white-100 px-1 translate-y-0.5 transition-colors duration-150"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        Leaderboard
      </span>
    </TabsTrigger>
  );
};
