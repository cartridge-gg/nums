import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { YieldIcon } from "@/components/icons";

const stakingYieldVariants = cva(
  "select-none flex items-center gap-3 rounded-lg bg-white-900 p-3",
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

export interface StakingYieldProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stakingYieldVariants> {
  /** APR yield value (e.g. 12.5 for 12.5%), undefined displays TBD */
  value?: number;
}

export const StakingYield = ({
  value,
  variant,
  className,
  ...props
}: StakingYieldProps) => {
  return (
    <div
      className={cn(stakingYieldVariants({ variant, className }))}
      {...props}
    >
      <div className="bg-white-900 rounded flex items-center justify-center w-5 h-5">
        <YieldIcon size="sm" />
      </div>
      <p className="flex gap-2 items-center font-sans text-base/5">
        <span className="text-white-100">
          {value !== undefined ? `${value.toFixed(1)}%` : "TBD"}
        </span>
        <span className="text-white-400">APR</span>
      </p>
    </div>
  );
};
