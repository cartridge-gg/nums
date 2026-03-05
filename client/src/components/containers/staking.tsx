import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { FlowIcon } from "@/components/icons";
import {
  StakingAmount,
  type StakingAmountProps,
} from "@/components/elements/staking-amount";
import {
  StakingInfo,
  type StakingInfoProps,
} from "@/components/elements/staking-info";

type StakingTab = "stake" | "unstake";

const stakingVariants = cva(
  "select-none flex flex-col p-6 gap-4 rounded-xl bg-mauve-800 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.04)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
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

export interface StakingProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stakingVariants> {
  /** Top input in Stake tab — user edits this, triggers fetch for mint */
  depositProps?: StakingAmountProps;
  /** Bottom input in Stake tab — fetched result, can also be edited to trigger fetch for deposit */
  mintProps?: StakingAmountProps;
  /** Top input in Unstake tab — user edits this, triggers fetch for redeem */
  withdrawProps?: StakingAmountProps;
  /** Bottom input in Unstake tab — fetched result, can also be edited to trigger fetch for withdraw */
  redeemProps?: StakingAmountProps;
  /** Props forwarded to StakingInfo */
  infoProps?: StakingInfoProps;
  /** When true, all inputs are read-only and the submit button is disabled */
  locked?: boolean;
  /** Callback when staking */
  onStake?: () => void;
  /** Callback when unstaking */
  onUnstake?: () => void;
}

export const Staking = ({
  depositProps,
  mintProps,
  withdrawProps,
  redeemProps,
  infoProps,
  locked,
  onStake,
  onUnstake,
  variant,
  className,
  ...props
}: StakingProps) => {
  const filterId = useId();
  const [tab, setTab] = useState<StakingTab>("stake");

  const handleTabChange = (value: string) => {
    if (!value) return;
    setTab(value as StakingTab);
  };

  const handleSubmit = () => {
    if (tab === "stake") onStake?.();
    else onUnstake?.();
  };

  const isStake = tab === "stake";
  const topValue = isStake ? depositProps?.value : withdrawProps?.value;
  const bottomValue = isStake ? mintProps?.value : redeemProps?.value;
  const hasAmount = (topValue ?? 0) > 0 || (bottomValue ?? 0) > 0;

  // When locked, strip onValueChange so all inputs become read-only
  const topProps = isStake ? depositProps : withdrawProps;
  const bottomProps = isStake ? mintProps : redeemProps;
  const resolvedTopProps = locked
    ? { ...topProps, onValueChange: undefined }
    : topProps;
  const resolvedBottomProps = locked
    ? { ...bottomProps, onValueChange: undefined }
    : bottomProps;

  return (
    <div className={cn(stakingVariants({ variant, className }))} {...props}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="2"
              dy="2"
              stdDeviation="0"
              floodColor="rgba(0, 0, 0, 1)"
            />
          </filter>
        </defs>
      </svg>

      <ToggleGroup
        type="single"
        value={tab}
        onValueChange={handleTabChange}
        variant="default"
        size="default"
        className="h-10 gap-0.5"
      >
        <ToggleGroupItem
          value="stake"
          aria-label="Stake"
          className="h-10 flex-1 py-2 px-3 rounded-l-lg min-w-auto"
        >
          <span
            className="text-white-100 text-[22px]/[15px] tracking-wider translate-y-0.5 px-1"
            style={{
              textShadow: isStake ? "2px 2px 0px rgba(0, 0, 0, 1)" : undefined,
            }}
          >
            Stake
          </span>
        </ToggleGroupItem>
        <ToggleGroupItem
          value="unstake"
          aria-label="Unstake"
          className="h-10 flex-1 py-2 px-3 rounded-r-lg min-w-auto"
        >
          <span
            className="text-white-100 text-[22px]/[15px] tracking-wider translate-y-0.5 px-1"
            style={{
              textShadow: !isStake ? "2px 2px 0px rgba(0, 0, 0, 1)" : undefined,
            }}
          >
            Unstake
          </span>
        </ToggleGroupItem>
      </ToggleGroup>

      <div className="h-full flex flex-col gap-4 justify-between">
        <div className="flex flex-col gap-2">
          <StakingAmount
            {...resolvedTopProps}
            action={tab}
            className={cn(resolvedTopProps?.className, locked && "opacity-50")}
          />

          <FlowIcon size="md" className="self-center text-white-100" />

          <StakingAmount
            {...resolvedBottomProps}
            action={tab === "stake" ? "unstake" : "stake"}
            className={cn(
              resolvedBottomProps?.className,
              locked && "opacity-50",
            )}
          />
        </div>
        <div className="flex flex-col gap-4">
          <StakingInfo {...infoProps} />

          <Button
            variant={hasAmount && !locked ? "default" : "secondary"}
            onClick={handleSubmit}
            disabled={!hasAmount || !!locked}
            className={cn(
              "w-full duration-0",
              locked && "text-red-100 bg-red-700",
            )}
          >
            <p
              className="px-1 text-[28px]/[19px] tracking-wide translate-y-0.5"
              style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              {locked ? "Locked" : hasAmount ? tab : "Enter Amount"}
            </p>
          </Button>
        </div>
      </div>
    </div>
  );
};
