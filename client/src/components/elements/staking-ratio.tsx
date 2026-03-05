import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { AngleIcon } from "@/components/icons";

const stakingRatioVariants = cva(
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

export interface StakingRatioProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stakingRatioVariants> {
  /** Ratio value (e.g. 1.05 means 1 NUMS = 1.05 vNUMS), undefined displays TBD */
  value?: number;
}

export const StakingRatio = ({
  value,
  variant,
  className,
  ...props
}: StakingRatioProps) => {
  return (
    <div
      className={cn(stakingRatioVariants({ variant, className }))}
      {...props}
    >
      <div className="bg-white-900 rounded flex items-center justify-center w-5 h-5">
        <AngleIcon size="sm" />
      </div>
      <p className="flex gap-2 items-center font-sans text-base/5">
        <span className="text-white-100">
          {value !== undefined ? `1 NUMS = ${value.toFixed(2)} vNUMS` : "TBD"}
        </span>
      </p>
    </div>
  );
};
