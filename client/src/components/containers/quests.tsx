import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Quest, type QuestProps } from "@/components/elements/quest";
import { Formatter } from "@/helpers";
import { useEffect, useState } from "react";

export interface QuestsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof questsVariants> {
  quests: QuestProps[];
  expiration: number;
}

const questsVariants = cva(
  "w-full flex flex-col gap-4 md:gap-6 p-4 md:p-6 pb-0 md:pb-0 rounded-lg overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-black-900 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.12)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

// Helper function to get countdown
const getCountdown = (exp: number) => {
  if (!exp) return Formatter.countdown(0);
  const now = new Date();
  const diff = exp * 1000 - now.getTime();
  return Formatter.countdown(diff);
};

export const Quests = ({
  quests,
  expiration,
  variant,
  className,
  ...props
}: QuestsProps) => {
  const allCompleted = quests.every((quest) => quest.count >= quest.total);

  const [countdown, setCountdown] = useState<string>(() =>
    getCountdown(expiration),
  );

  useEffect(() => {
    setCountdown(getCountdown(expiration));
    if (!expiration) return;
    const interval = setInterval(() => {
      const now = new Date();
      const diff = expiration * 1000 - now.getTime();
      setCountdown(Formatter.countdown(diff));
    }, 1000);
    return () => clearInterval(interval);
  }, [expiration]);

  return (
    <div className={cn(questsVariants({ variant, className }))} {...props}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2
          className="font-primary text-[36px]/[24px] tracking-wider text-mauve-100 uppercase translate-y-0.5"
          style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
        >
          DailyQuest
        </h2>
        {allCompleted && (
          <p
            className="text-[22px]/[15px] tracking-wider text-mauve-300 translate-y-0.5"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
          >
            {`Refresh in ${countdown}`}
          </p>
        )}
      </div>

      {/* Quests list */}
      <div
        className="flex flex-col gap-4 overflow-y-auto pb-4 md:pb-6"
        style={{ scrollbarWidth: "none" }}
      >
        {quests.map((quest, index) => (
          <Quest key={index} {...quest} />
        ))}
      </div>
    </div>
  );
};
