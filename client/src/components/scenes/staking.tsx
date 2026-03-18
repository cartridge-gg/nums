import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ShadowEffect, ExternalLinkIcon } from "@/components/icons";
import { Close } from "@/components/elements";
import { Staking, type StakingProps } from "@/components/containers/staking";
import { StakingOnly } from "@/components/containers/staking-only";
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
import {
  StakingGoal,
  type StakingGoalProps,
} from "@/components/elements/staking-goal";
import {
  StakingVault,
  type StakingVaultProps,
} from "@/components/elements/staking-vault";
import {
  StakingSupply,
  type StakingSupplyProps,
} from "@/components/elements/staking-supply";
import { Link } from "@/lib/router";

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
  stakingProps?: StakingProps;
  balanceProps?: StakingBalanceProps;
  rewardProps?: StakingRewardProps;
  claimedProps?: StakingClaimedProps;
  yieldProps?: StakingYieldProps;
  ratioProps?: StakingRatioProps;
  goalProps?: StakingGoalProps;
  vaultProps?: StakingVaultProps;
  supplyProps?: StakingSupplyProps;
  locked?: boolean;
  onClose?: () => void;
}

export const StakingScene = ({
  stakingProps,
  balanceProps,
  rewardProps,
  claimedProps,
  yieldProps,
  ratioProps,
  goalProps,
  vaultProps,
  supplyProps,
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

      {effectiveLocked ? (
        <>
          {/* Mobile — Locked */}
          <div
            className="flex flex-col md:hidden gap-6 w-full h-full pb-2"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="flex items-center justify-between w-full">
              <Title content="Flip the Switch" />
              <Close size="md" onClick={onClose} />
            </div>

            <div
              className="grow overflow-y-auto flex flex-col gap-6"
              style={{ scrollbarWidth: "none" }}
            >
              <Disclaimer />
              <ReadMore to="https://nums-docs.preview.cartridge.gg/staking" />
              <StakingSupply {...supplyProps} />
              <StakingOnly {...stakingProps} />
              <StakingBalance
                {...balanceProps}
                title="You have contributed"
                token="NUMS"
              />
              <StakingGoal {...goalProps} />
              <StakingVault {...vaultProps} />
            </div>
          </div>

          {/* Desktop — Locked */}
          <div className="hidden md:flex md:flex-col md:items-stretch overflow-hidden h-full w-full">
            <Close
              size="lg"
              onClick={onClose}
              className="absolute z-10 top-8 right-8"
            />

            <div className="h-full w-full max-w-[856px] self-center overflow-hidden flex flex-col justify-center gap-6">
              <div className="flex items-center justify-between">
                <div onClick={() => setBypass(!bypass)}>
                  <Title content="Flip the Switch" />
                </div>
                <StakingSupply {...supplyProps} />
              </div>

              <div className="flex flex-row gap-6">
                <div className="flex flex-col gap-6 flex-1">
                  <StakingOnly {...stakingProps} />
                  <StakingBalance
                    {...balanceProps}
                    title="You have contributed"
                    token="NUMS"
                  />
                </div>
                <div className="flex flex-col gap-6 flex-1">
                  <Disclaimer />
                  <ReadMore to="https://nums-docs.preview.cartridge.gg/staking" />
                  <StakingGoal {...goalProps} />
                  <StakingVault {...vaultProps} />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Mobile — Unlocked */}
          <div
            className="flex flex-col md:hidden gap-6 w-full h-full pb-2"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="flex items-center justify-between w-full">
              <Title content="Staking" />
              <Close size="md" onClick={onClose} />
            </div>

            <div
              className="grow overflow-y-auto flex flex-col gap-6 md:gap-6"
              style={{ scrollbarWidth: "none" }}
            >
              <Subtitle />
              <ReadMore to="https://nums-docs.preview.cartridge.gg/staking" />
              <div className="flex gap-3">
                {!!ratioProps && (
                  <StakingRatio {...ratioProps} className="hidden md:block" />
                )}
                <StakingYield {...yieldProps} />
              </div>
              <Staking {...stakingProps} />
              <div className="flex flex-col gap-6">
                <StakingBalance {...balanceProps} />
                <StakingClaimed {...claimedProps} />
                <StakingReward {...rewardProps} />
              </div>
            </div>
          </div>

          {/* Desktop — Unlocked */}
          <div className="hidden md:flex md:flex-col md:items-stretch overflow-hidden h-full w-full">
            <Close
              size="lg"
              onClick={onClose}
              className="absolute z-10 top-8 right-8"
            />

            <div className="h-full w-full max-w-[856px] self-center overflow-hidden flex flex-col justify-center gap-6">
              <div className="flex items-center justify-between gap-6">
                <div onClick={() => setBypass(!bypass)}>
                  <Title content="Staking" />
                </div>
                <div className="flex gap-3 shrink-0">
                  {!!ratioProps && <StakingRatio {...ratioProps} />}
                  <StakingYield {...yieldProps} />
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-1">
                  <Staking {...stakingProps} />
                </div>
                <div className="flex flex-col gap-6 flex-1">
                  <Subtitle />
                  <ReadMore to="https://nums-docs.preview.cartridge.gg/staking" />
                  <StakingBalance {...balanceProps} />
                  {!!claimedProps?.amount && (
                    <StakingClaimed {...claimedProps} />
                  )}
                  <StakingReward {...rewardProps} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const Title = ({ content = "Staking" }: { content?: string }) => (
  <h2
    className="text-[36px]/6 md:text-[64px]/[44px] text-white-100 uppercase translate-y-0.5"
    style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
  >
    {content}
  </h2>
);

const Subtitle = () => (
  <p className="font-sans text-base/5 text-white-100">
    For every game of NUMS a portion of the entry fee is redirected to NUMS
    stakers
  </p>
);

const Disclaimer = () => (
  <p className="font-sans text-base/5 text-white-100">
    Participate in the Flip the Switch event by staking NUMS, once the event
    goal is met Cartridge will no longer be the majority contributor and a DAO
    will be established.
  </p>
);

const ReadMore = ({
  to = "https://www.cartridge.gg/flip-the-switch",
}: {
  to?: string;
}) => {
  return (
    <Link to={to} target="_blank" className="flex">
      <div className="px-1 flex items-center gap-0.5 h-6 bg-white-900 hover:bg-white-800 rounded transition-colors duration-150">
        <p className="font-sans text-sm/5 text-white-100 px-0.5">Read More</p>
        <ExternalLinkIcon size="xs" />
      </div>
    </Link>
  );
};
