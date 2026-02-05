import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { useId, useMemo, useState, useEffect } from "react";
import { BrandIcon, ShadowEffect } from "@/components/icons";

export interface RewardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof rewardVariants> {
  reward: number;
}

const rewardVariants = cva(
  "select-none relative rounded-lg px-4 py-3 md:px-3 flex flex-col md:flex-row justify-center items-center gap-1",
  {
    variants: {
      variant: {
        default: "w-20 md:w-[136px] bg-black-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const formatMobileReward = (num: number): string => {
  if (isNaN(num) || num < 0) {
    return "0";
  }

  if (num >= 1000000000) {
    // Billions - try to keep 3 characters
    const billions = num / 1000000000;
    if (billions >= 100) {
      return `${Math.floor(billions)}B`;
    }
    if (billions >= 10) {
      return `${billions.toFixed(1).replace(/\.0$/, "")}B`;
    }
    return `${billions.toFixed(1)}B`;
  }

  if (num >= 1000000) {
    // Millions - try to keep 3 characters
    const millions = num / 1000000;
    if (millions >= 100) {
      return `${Math.floor(millions)}M`;
    }
    if (millions >= 10) {
      return `${millions.toFixed(1).replace(/\.0$/, "")}M`;
    }
    return `${millions.toFixed(1)}M`;
  }

  if (num >= 1000) {
    // Thousands - try to keep 3 characters
    const thousands = num / 1000;
    if (thousands >= 100) {
      return `${Math.floor(thousands)}K`;
    }
    if (thousands >= 10) {
      return `${thousands.toFixed(1).replace(/\.0$/, "")}K`;
    }
    return `${thousands.toFixed(1)}K`;
  }

  // For numbers < 1000, return as integer (max 3 digits)
  return Math.floor(num).toString();
};

export const Reward = ({
  reward,
  variant,
  className,
  ...props
}: RewardProps) => {
  const filterId = useId();
  const [previousReward, setPreviousReward] = useState<number>(reward);
  const [difference, setDifference] = useState<number | null>(null);
  const [showDifference, setShowDifference] = useState(false);
  const [animationKey, setAnimationKey] = useState<number>(0);

  useEffect(() => {
    if (reward !== previousReward) {
      const diff = reward - previousReward;
      if (diff !== 0) {
        setDifference(diff);
        setShowDifference(true);
        setPreviousReward(reward);
        // Force re-render of animation by changing key
        setAnimationKey((prev) => prev + 1);

        // Hide after animation completes (2 seconds)
        const timer = setTimeout(() => {
          setShowDifference(false);
          setDifference(null);
        }, 2000);

        return () => clearTimeout(timer);
      }
    }
  }, [reward, previousReward]);

  const formattedDesktop = useMemo(() => {
    if (isNaN(reward)) return "0";
    return reward.toLocaleString();
  }, [reward]);

  const formattedMobile = useMemo(() => {
    return formatMobileReward(reward);
  }, [reward]);

  const formatDifference = (diff: number): string => {
    const sign = diff > 0 ? "+" : "";
    return `${sign}${diff.toLocaleString()}`;
  };

  return (
    <div className={cn(rewardVariants({ variant, className }))} {...props}>
      <ShadowEffect filterId={filterId} />
      <BrandIcon style={{ filter: `url(#${filterId})` }} />
      <div
        className="text-[28px]/[19px] tracking-wider"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        <span className="block md:hidden px-1 translate-y-1">
          {formattedMobile}
        </span>
        <span className="hidden md:flex px-1 translate-y-0.5">
          {formattedDesktop}
        </span>
      </div>
      {showDifference && difference !== null && (
        <span
          key={animationKey}
          className={cn(
            "absolute left-1/2 -translate-x-1/2 top-1/3 whitespace-nowrap text-[28px]/[19px] tracking-wider animate-reward-diff",
            difference > 0 ? "text-green-100" : "text-red-100",
          )}
          style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
        >
          {formatDifference(difference)}
        </span>
      )}
    </div>
  );
};
