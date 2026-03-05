import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { VTokenIcon } from "@/components/icons/exotics";

const stakingBalanceVariants = cva(
  "select-none flex flex-col gap-6 rounded-xl bg-mauve-800 p-6 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.04)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
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

export interface StakingBalanceProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stakingBalanceVariants> {
  /** Staked amount */
  stakedAmount?: number;
  /** Total share in the vault */
  totalShare?: number;
}

export const StakingBalance = ({
  stakedAmount = 0,
  totalShare = 0,
  variant,
  className,
  ...props
}: StakingBalanceProps) => {
  const ownership = totalShare ? (100 * stakedAmount) / totalShare : 0;

  return (
    <div
      className={cn(stakingBalanceVariants({ variant, className }))}
      {...props}
    >
      <div className="flex flex-col gap-3">
        <span className="font-sans text-base/[18px] text-white-400">
          Staked
        </span>

        <div className="flex justify-between items-center font-sans text-base/5 text-white-100 gap-6">
          <div className="flex items-center gap-2">
            <VTokenIcon size="sm" />
            <span className="text-[#FFDE66] font-primary text-[22px]/[15px] tracking-wider translate-y-px">
              vNUMS
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>
              {stakedAmount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-white-400">
              {ownership.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              %
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
