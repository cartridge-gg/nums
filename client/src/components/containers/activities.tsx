import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Activity, ActivityProps } from "@/components/elements/activity";
import { useMemo } from "react";

export interface ActivitiesProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof activitiesVariants> {
  activities: Array<ActivityProps & { timestamp: number }>;
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
  variant,
  className,
  ...props
}: ActivitiesProps) => {
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
      <div className="min-h-8 flex items-center">
        <h2
          className="text-[28px]/[19px] md:text-[36px]/[24px] tracking-wider text-white-100 translate-y-0.5"
          style={{
            textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)",
          }}
        >
          Activity
        </h2>
      </div>

      {/* Activities list */}
      <div
        className="grow bg-black-900 border-2 border-black-800 rounded-lg flex flex-col p-4 gap-4 overflow-y-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {sections.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p
              className="text-white-300 text-lg/6 tracking-wider translate-y-0.5 w-1/2 text-center"
              style={{
                textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)",
              }}
            >
              No activities available yet
            </p>
          </div>
        ) : (
          sections.map((section, sectionIndex) => (
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
                    key={activity.gameId}
                    gameId={activity.gameId}
                    score={activity.score}
                    payout={activity.payout}
                    to={activity.to}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
