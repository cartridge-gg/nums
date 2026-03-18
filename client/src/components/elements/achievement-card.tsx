import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  CheckIcon,
  CheckboxCheckedIcon,
  CheckboxUncheckedIcon,
} from "@/components/icons";
import { AchievementIcon } from "./achievement-icon";
import { AchievementProgress } from "./achievement-progress";

export interface AchievementCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof achievementCardVariants> {
  icon: string;
  title: string;
  description: string;
  count: number;
  total: number;
  hidden?: boolean;
}

const achievementCardVariants = cva(
  "select-none flex flex-col w-full overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "gap-2 px-4 py-3 md:px-6 md:py-6 rounded-lg bg-white-900 shadow-[inset_1px_1px_0px_rgba(255,255,255,0.04),1px_1px_0px_rgba(0,0,0,0.12)]",
        complete:
          "gap-2 px-4 py-3 md:px-6 md:py-6 rounded-lg bg-green-800 shadow-[inset_1px_1px_0px_rgba(255,255,255,0.04),1px_1px_0px_rgba(0,0,0,0.12)]",
        float:
          "gap-2 p-6 rounded-xl bg-black-200 border-2 border-black-100 shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[12px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const AchievementCard = ({
  icon,
  title,
  description,
  count,
  total,
  variant,
  className,
  ...props
}: AchievementCardProps) => {
  const isComplete = count >= total;

  return (
    <div
      className={cn(achievementCardVariants({ variant, className }))}
      {...props}
    >
      <div className="flex gap-2 items-center">
        <AchievementIcon
          icon={icon}
          size="lg"
          className={isComplete ? "text-green-100" : "text-white-500"}
        />

        <div className="flex flex-col gap-1 flex-1 overflow-hidden">
          <p
            className={cn(
              "font-primary text-[28px]/5 tracking-[0.03em] translate-y-0.5 whitespace-nowrap truncate",
              isComplete ? "text-green-100" : "text-white-100",
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
          {isComplete ? (
            <>
              <CheckIcon size="sm" className="text-green-100" />
              <span className="text-sm/[18px] font-sans text-green-100">
                {total !== 1 ? count.toLocaleString("en-US") : "Completed"}
              </span>
            </>
          ) : (
            <span className="text-sm/[18px] font-sans text-white-100">
              {count.toLocaleString("en-US")} of {total.toLocaleString("en-US")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
