import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { QuoteIcon } from "@/components/icons/exotics";
import { Button } from "../ui/button";

const stakingRewardVariants = cva(
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

export interface StakingRewardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stakingRewardVariants> {
  /** Reward amount */
  rewardAmount?: number;
  /** Price per token in USD */
  usdcPrice?: number;
  /** Callback when claiming rewards, if undefined the button is disabled */
  onClaim?: () => void;
}

export const StakingReward = ({
  rewardAmount = 0,
  usdcPrice = 1,
  onClaim,
  variant,
  className,
  ...props
}: StakingRewardProps) => {
  const usdValue = rewardAmount * usdcPrice;

  return (
    <div
      className={cn(stakingRewardVariants({ variant, className }))}
      {...props}
    >
      <div className="flex flex-col gap-3">
        <span className="font-sans text-base/[18px] text-white-400">
          Rewards
        </span>

        <div className="flex justify-between items-center font-sans text-base/5 text-white-100 gap-6">
          <div className="flex items-center gap-2">
            <QuoteIcon size="sm" />
            <span className="text-white-100 font-primary text-[22px]/[15px] tracking-wider translate-y-px">
              USDC
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>
              {rewardAmount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
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

      {!!onClaim && (
        <Button onClick={onClaim}>
          <p
            className="px-1 text-[28px]/[19px] tracking-wide translate-y-0.5"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            Claim
          </p>
        </Button>
      )}
    </div>
  );
};
