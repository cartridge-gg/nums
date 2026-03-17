import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { VTokenIcon } from "@/components/icons/exotics";

const stakingSupplyVariants = cva(
  "select-none flex items-center gap-2 rounded-lg p-3 bg-white-900",
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

export interface StakingSupplyProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stakingSupplyVariants> {
  /** Label displayed before the value */
  title?: string;
  /** Total shares — shows "TBD" when undefined */
  totalShares?: number;
}

export const StakingSupply = ({
  title = "Total Supply",
  totalShares,
  variant,
  className,
  ...props
}: StakingSupplyProps) => {
  return (
    <div
      className={cn(stakingSupplyVariants({ variant, className }))}
      {...props}
    >
      <span className="font-sans text-sm/[18px] text-white-400">{title}</span>
      <VTokenIcon size="sm" />
      <span className="font-sans text-base/5 text-white-100">
        {totalShares !== undefined
          ? totalShares.toLocaleString("en-US", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })
          : "TBD"}
      </span>
    </div>
  );
};
