import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { QuoteIcon } from "@/components/icons/exotics";

const stakingClaimedVariants = cva(
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

export interface StakingClaimedProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stakingClaimedVariants> {
  /** Claimed USDC amount */
  amount?: number;
  /** Price per USDC in USD */
  price?: number;
  /** Timestamp (s) of the claim */
  timestamp?: number;
}

export const StakingClaimed = ({
  amount = 0,
  price = 1,
  timestamp,
  variant,
  className,
  ...props
}: StakingClaimedProps) => {
  const usdValue = amount * price;

  const dateLabel = timestamp
    ? new Date(timestamp * 1000).toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      })
    : "—";

  return (
    <div
      className={cn(stakingClaimedVariants({ variant, className }))}
      {...props}
    >
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="font-sans text-base/[18px] text-white-400">
            Recently Claimed
          </span>
        </div>

        <div className="flex justify-between items-center font-sans text-base/5 text-white-100 gap-6">
          <span className="font-sans text-base/5 text-white-100">
            {dateLabel}
          </span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <QuoteIcon size="sm" />
              <span>
                {`${amount.toLocaleString("en-US", {
                  minimumFractionDigits: 4,
                  maximumFractionDigits: 4,
                })} USDC`}
              </span>
            </div>
            <span className="text-white-400">
              $
              {usdValue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
