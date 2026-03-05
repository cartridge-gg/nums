import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { ShadowEffect, CloseIcon } from "@/components/icons";
import { Staking, type StakingProps } from "@/components/containers/staking";
import {
  StakingBalance,
  type StakingBalanceProps,
} from "@/components/elements/staking-balance";
import {
  StakingReward,
  type StakingRewardProps,
} from "@/components/elements/staking-reward";
import {
  StakingClaimed,
  type StakingClaimedProps,
} from "@/components/elements/staking-claimed";
import {
  StakingYield,
  type StakingYieldProps,
} from "@/components/elements/staking-yield";
import {
  StakingRatio,
  type StakingRatioProps,
} from "@/components/elements/staking-ratio";
import { StakingStatus } from "@/components/elements/staking-status";

const stakingSceneVariants = cva(
  "select-none flex flex-col md:flex-row gap-6 md:gap-10 p-6",
  {
    variants: {
      variant: {
        default:
          "rounded-t-2xl rounded-b-4xl md:rounded-3xl bg-black-300 backdrop-blur-[8px] border-[2px] border-black-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface StakingSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stakingSceneVariants> {
  /** Props forwarded to the Staking container */
  stakingProps?: StakingProps;
  /** Props forwarded to StakingBalance */
  balanceProps?: StakingBalanceProps;
  /** Props forwarded to StakingReward */
  rewardProps?: StakingRewardProps;
  /** Props forwarded to StakingClaimed */
  claimedProps?: StakingClaimedProps;
  /** Props forwarded to StakingYield */
  yieldProps?: StakingYieldProps;
  /** Props forwarded to StakingRatio */
  ratioProps?: StakingRatioProps;
  /** Whether to show the locked status badge */
  locked?: boolean;
  /** Close button callback */
  onClose?: () => void;
}

export const StakingScene = ({
  stakingProps,
  balanceProps,
  rewardProps,
  claimedProps,
  yieldProps,
  ratioProps,
  locked,
  onClose,
  variant,
  className,
  ...props
}: StakingSceneProps) => {
  const filterId = useId();
  const [bypass, setBypass] = useState(false);
  const effectiveLocked = locked && !bypass;

  return (
    <div
      className={cn(stakingSceneVariants({ variant, className }))}
      {...props}
    >
      <ShadowEffect filterId={filterId} />

      {/* Mobile */}
      <div
        className="flex flex-col md:hidden gap-6 w-full h-full pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="flex items-center justify-between w-full">
          <Title onBypass={() => setBypass((p) => !p)} />
          <Button
            variant="ghost"
            className="bg-white-800 h-10 w-10 p-0 text-white-100 hover:text-white-400 hover:bg-white-900 rounded"
            onClick={onClose}
          >
            <CloseIcon size="md" style={{ filter: `url(#${filterId})` }} />
          </Button>
        </div>

        <div
          className="grow overflow-y-auto flex flex-col gap-6 md:gap-8"
          style={{ scrollbarWidth: "none" }}
        >
          <Subtitle />
          <div className="flex gap-3">
            {effectiveLocked && <StakingStatus className="hidden md:block" />}
            {!!ratioProps && (
              <StakingRatio {...ratioProps} className="hidden md:block" />
            )}
            <StakingYield {...yieldProps} />
          </div>
          <Staking {...stakingProps} locked={effectiveLocked} />
          <div className="flex flex-col gap-6">
            <StakingBalance {...balanceProps} />
            <StakingClaimed {...claimedProps} />
            <StakingReward {...rewardProps} />
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex md:flex-col md:items-stretch overflow-hidden h-full w-full">
        <Button
          variant="ghost"
          className="absolute z-10 top-8 right-8 bg-white-800 h-12 w-[56px] p-0 text-white-100 hover:text-white-400 hover:bg-white-900 rounded-lg"
          onClick={onClose}
        >
          <CloseIcon size="lg" style={{ filter: `url(#${filterId})` }} />
        </Button>

        <div className="h-full w-full max-w-[752px] self-center overflow-hidden flex flex-col justify-center gap-6">
          <div className="flex items-center justify-between gap-4">
            <Title onBypass={() => setBypass((p) => !p)} />
            <div className="flex gap-3 shrink-0">
              {effectiveLocked && <StakingStatus />}
              {!!ratioProps && <StakingRatio {...ratioProps} />}
              <StakingYield {...yieldProps} />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <Staking
              {...stakingProps}
              locked={effectiveLocked}
              className="flex-1"
            />
            <div className="flex flex-col gap-6 flex-1">
              <Subtitle />
              <StakingBalance {...balanceProps} />
              {!!claimedProps?.amount && <StakingClaimed {...claimedProps} />}
              <StakingReward {...rewardProps} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Title = ({ onBypass }: { onBypass: () => void }) => (
  <h2
    className="text-[36px]/6 md:text-[64px]/[44px] text-white-100 uppercase tracking-wider translate-y-0.5"
    style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
  >
    {"Sta"}
    <span onClick={onBypass} className="select-none">
      {"k"}
    </span>
    {"ing"}
  </h2>
);

const Subtitle = () => (
  <p className="font-sans text-base/5 text-white-400">
    For every game of NUMS a portion of the entry fee is redirected to NUMS
    stakers
  </p>
);
