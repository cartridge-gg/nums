import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { VTokenIcon } from "@/components/icons/exotics";

const stakingGoalVariants = cva(
  "select-none flex flex-col gap-4 rounded-xl bg-mauve-800 p-6 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.04)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
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

export interface StakingGoalProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stakingGoalVariants> {
  token?: string;
  totalStaked?: number;
  totalShares?: number;
}

export const StakingGoal = ({
  token = "NUMS",
  totalStaked = 0,
  totalShares = 0,
  variant,
  className,
  ...props
}: StakingGoalProps) => {
  const progress = totalShares
    ? Math.min((100 * totalStaked) / totalShares, 100)
    : 0;

  return (
    <div className={cn(stakingGoalVariants({ variant, className }))} {...props}>
      <span className="font-sans text-sm/[18px] text-white-400">
        Community Goal
      </span>

      <div className="flex flex-col gap-3">
        <div className="relative h-4 w-full overflow-hidden rounded-full bg-white-800 p-1">
          <div
            className="h-full rounded-full bg-[#FFDE66] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between items-center font-sans text-base/5 text-white-100 gap-6">
          <div className="flex items-center gap-2">
            <VTokenIcon size="sm" />
            <span className="text-[#FFDE66] font-primary text-[22px]/[15px] tracking-wider translate-y-px">
              {token}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm/[18px]">
            <span className="text-[#FFDE66]">
              {totalStaked.toLocaleString("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
            <span className="text-white-400">
              /{" "}
              {totalShares.toLocaleString("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
