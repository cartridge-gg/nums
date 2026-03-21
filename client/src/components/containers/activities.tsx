import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Activity, type ActivityProps } from "@/components/elements/activity";
import { ActivityTab } from "@/components/elements/activity-tab";
import { useMemo, useRef } from "react";

export type ActivityFilter = "all" | "mine";

export interface ActivitiesProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof activitiesVariants> {
  activities: Array<ActivityProps & { timestamp: number }>;
  filter?: ActivityFilter;
  onFilterChange?: (filter: ActivityFilter) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const activitiesVariants = cva(
  "select-none relative w-full flex flex-col gap-4 md:gap-6",
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

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month}-${day}, ${year}`;
};

const isToday = (timestamp: number): boolean => {
  const date = new Date(timestamp * 1000);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const isYesterday = (timestamp: number): boolean => {
  const date = new Date(timestamp * 1000);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};

type ActivityItem = ActivitiesProps["activities"][0];

type Section = {
  title?: string;
  activities: ActivityItem[];
};

export const Activities = ({
  activities,
  filter = "all",
  onFilterChange,
  onLoadMore,
  hasMore = false,
  variant,
  className,
  ...props
}: ActivitiesProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const element = scrollRef.current;
    if (!element || !hasMore || !onLoadMore) return;

    const distanceToBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;

    if (distanceToBottom <= 100) {
      onLoadMore();
    }
  };

  const sections = useMemo<Section[]>(() => {
    const today: ActivityItem[] = [];
    const yesterday: ActivityItem[] = [];
    const otherMap = new Map<string, ActivityItem[]>();

    activities.forEach((activity) => {
      if (isToday(activity.timestamp)) {
        today.push(activity);
      } else if (isYesterday(activity.timestamp)) {
        yesterday.push(activity);
      } else {
        const dateStr = formatDate(activity.timestamp);
        if (!otherMap.has(dateStr)) {
          otherMap.set(dateStr, []);
        }
        otherMap.get(dateStr)!.push(activity);
      }
    });

    const sections: Section[] = [];

    // Today section (no title)
    if (today.length > 0) {
      sections.push({ activities: today });
    }

    // Yesterday section
    if (yesterday.length > 0) {
      sections.push({ title: "Yesterday", activities: yesterday });
    }

    // Other dates sections
    const other = Array.from(otherMap.entries())
      .map(([date, activities]) => ({ date, activities }))
      .sort((a, b) => {
        // Sort by timestamp descending (most recent first)
        const aTimestamp = a.activities[0]?.timestamp || 0;
        const bTimestamp = b.activities[0]?.timestamp || 0;
        return bTimestamp - aTimestamp;
      });

    other.forEach(({ date, activities }) => {
      sections.push({ title: date, activities });
    });

    return sections;
  }, [activities]);

  return (
    <div
      className={cn(activitiesVariants({ variant, className }), "w-full")}
      {...props}
    >
      {/* Title */}
      <div className="min-h-8 flex justify-between items-center gap-6">
        <h2
          className="text-[28px]/[19px] md:text-[36px]/[24px] tracking-wider text-white-100 translate-y-0.5"
          style={{
            textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)",
          }}
        >
          Activity
        </h2>
        <div className="flex gap-3">
          <ActivityTab
            active={filter === "all"}
            onClick={() => onFilterChange?.("all")}
            className="flex-1"
          >
            <span className="hidden md:block px-1">All Games</span>
            <span className="block md:hidden px-1">All</span>
          </ActivityTab>
          <ActivityTab
            active={filter === "mine"}
            onClick={() => onFilterChange?.("mine")}
            className="flex-1"
          >
            <span className="hidden md:block px-1">My Games</span>
            <span className="block md:hidden px-1">My</span>
          </ActivityTab>
        </div>
      </div>

      {/* Activities list */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="grow bg-black-900 border-2 border-black-800 rounded-xl flex flex-col p-4 gap-4 overflow-x-hidden overflow-y-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {sections.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p
              className="text-mauve-100 text-[22px]/7 tracking-wider translate-y-0.5 text-center"
              style={{
                textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)",
              }}
            >
              You have not played
              <br />
              any games yet
            </p>
          </div>
        ) : (
          <>
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="flex flex-col gap-4">
                {section.title && (
                  <h3
                    className="text-[22px]/[15px] tracking-wider text-mauve-100 translate-y-0.5"
                    style={{
                      textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)",
                    }}
                  >
                    {section.title}
                  </h3>
                )}
                <div className="flex flex-col gap-3">
                  {section.activities.map((activity) => (
                    <Activity
                      key={activity.to}
                      gameId={activity.gameId}
                      score={activity.score}
                      payout={activity.payout}
                      to={activity.to}
                      claimed={activity.claimed}
                      cells={activity.cells}
                    />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
