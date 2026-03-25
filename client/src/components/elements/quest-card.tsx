import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  CheckIcon,
  CheckboxCheckedIcon,
  CheckboxUncheckedIcon,
} from "@/components/icons";
import { AchievementIcon } from "./achievement-icon";
import { AchievementProgress } from "./achievement-progress";
import { NotificationPing } from "./notification-ping";

export interface QuestCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof questCardVariants> {
  icon: string;
  title: string;
  description: string;
  count: number;
  total: number;
  isNew?: boolean;
}

const questCardVariants = cva("select-none flex flex-col w-full", {
  variants: {
    variant: {
      default:
        "gap-2 px-4 py-3 md:px-6 md:py-6 rounded-lg bg-white-900 shadow-[inset_1px_1px_0px_rgba(255,255,255,0.04),1px_1px_0px_rgba(0,0,0,0.12)]",
      complete:
        "gap-2 px-4 py-3 md:px-6 md:py-6 rounded-lg bg-green-900 shadow-[inset_1px_1px_0px_rgba(255,255,255,0.04),1px_1px_0px_rgba(0,0,0,0.12)]",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const QuestCard = ({
  icon,
  title,
  description,
  count,
  total,
  isNew,
  variant,
  className,
  ...props
}: QuestCardProps) => {
  const isComplete = count >= total;

  return (
    <div
      className={cn("relative", questCardVariants({ variant, className }))}
      {...props}
    >
      {isNew && <NotificationPing />}
      <div className="flex gap-2 items-center">
        <AchievementIcon
          icon={icon}
          size="lg"
          className={isComplete ? "text-white-500" : "text-white-100"}
        />

        <div className="flex flex-col gap-1 flex-1 overflow-hidden">
          <p
            className={cn(
              "font-primary text-[28px]/5 tracking-[0.03em] translate-y-0.5 whitespace-nowrap truncate",
              isComplete ? "text-white-400" : "text-white-100",
            )}
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
          >
            {title}
          </p>

          <div className="flex gap-1 items-center">
            {isComplete ? (
              <CheckboxCheckedIcon size="sm" className="text-white-400" />
            ) : (
              <CheckboxUncheckedIcon size="sm" className="text-white-400" />
            )}
            <span
              className={cn(
                "text-sm/[18px] font-sans flex-1 whitespace-nowrap truncate",
                isComplete ? "text-white-400 line-through" : "text-white-100",
              )}
            >
              {description}
            </span>
          </div>
        </div>
      </div>

      <div className="h-5 flex gap-3 items-center">
        <AchievementProgress
          count={count}
          total={total}
          variant={isComplete ? "complete" : "default"}
          className="flex-1"
        />

        <div className="flex gap-1 items-center">
          <CheckIcon
            size="sm"
            className={isComplete ? "text-green-100" : "hidden"}
          />
          <span
            className={cn(
              "text-sm/[18px] font-sans",
              isComplete ? "text-green-100" : "text-white-100",
            )}
          >
            {count.toLocaleString("en-US")} of {total.toLocaleString("en-US")}
          </span>
        </div>
      </div>
    </div>
  );
};
