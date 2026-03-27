import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { StakingAmount } from "@/components/elements/staking-amount";
import { StakingWarning } from "@/components/elements/staking-warning";
import { StakingInfo } from "@/components/elements/staking-info";
import type { StakingProps } from "./staking";

const stakingOnlyVariants = cva(
  "select-none flex flex-col p-6 gap-4 rounded-xl bg-primary-800 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.04)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
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

export const StakingOnly = ({
  depositProps,
  infoProps,
  onStake,
  variant,
  className,
  ...props
}: StakingProps) => {
  const hasAmount = (depositProps?.value ?? 0) > 0;
  const fee = infoProps?.fee;

  return (
    <div className={cn(stakingOnlyVariants({ variant, className }))} {...props}>
      <StakingAmount {...depositProps} action="stake" />

      <div className="flex flex-col gap-4">
        <StakingWarning message="NUMS Tokens contributed to the pool will be locked for 3 months, or until the community event's goal is reached." />
        <StakingInfo
          message={
            fee === 0
              ? "Withdrawal fee is currently 0%. This may be subject to change through a governance vote."
              : `Withdrawal fee of ${fee ?? 5}% will apply when unstaking (after the community pool is unlocked).`
          }
        />

        <Button
          variant={hasAmount ? "default" : "secondary"}
          onClick={onStake}
          disabled={!hasAmount}
          className="h-12 w-full duration-0"
        >
          <p
            className="px-1 text-[28px]/[19px] tracking-wide translate-y-0.5"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            {hasAmount ? "Stake" : "Enter Amount"}
          </p>
        </Button>
      </div>
    </div>
  );
};
