import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import {
  CheckIcon,
  CheckboxCheckedIcon,
  CheckboxUncheckedIcon,
} from "@/components/icons";
import { Formatter } from "@/helpers";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { QuestReward } from "@/models/quest";

export interface QuestProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof questVariants> {
  title: string;
  task: string;
  count: number;
  total: number;
  expiration?: number;
  claimed: boolean;
  rewards?: QuestReward[];
  onClaim?: () => void;
}

const questVariants = cva("select-none flex flex-col gap-3 rounded-lg p-4", {
  variants: {
    variant: {
      default:
        "bg-white-900 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.12)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

// Initialize countdown immediately
const getCountdown = (exp: number) => {
  if (!exp) return Formatter.countdown(0);
  const now = new Date();
  const diff = exp * 1000 - now.getTime();
  return Formatter.countdown(diff);
};

export const Quest = ({
  title,
  task,
  count,
  total,
  expiration = 0,
  claimed,
  rewards = [],
  onClaim,
  variant,
  className,
  ...props
}: QuestProps) => {
  const isCompleted = count >= total;
  const progress = Math.min((count / total) * 100, 100);

  return (
    <div className={cn(questVariants({ variant, className }))} {...props}>
      {/* Top section: left (title/task) and right (claim button) */}
      <div className="flex justify-between items-start gap-4">
        {/* Left: title and task with checkbox */}
        <div className="flex flex-col gap-3">
          <h3
            className="font-primary text-[22px]/[15px] md:text-[28px]/[19px] tracking-wider text-white-100 uppercase translate-y-0.5"
            style={{
              textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)",
            }}
          >
            {title}
          </h3>
          <div
            className={cn(
              "flex items-center gap-2",
              claimed ? "text-white-400" : "text-white-100",
            )}
          >
            {claimed ? (
              <CheckboxCheckedIcon size="sm" />
            ) : (
              <CheckboxUncheckedIcon size="sm" />
            )}
            <span className="text-[14px]/[18px] tracking-normal font-sans">
              {task}
            </span>
          </div>
        </div>

        {/* Right: claim button (desktop only) */}
        <Claim
          claimed={claimed}
          isCompleted={isCompleted}
          onClaim={onClaim}
          expiration={expiration}
          className="hidden md:flex"
        />
      </div>

      {/* Bottom section: progress bar and count */}
      <div className="flex items-center gap-3 h-5">
        {/* Progress bar */}
        <div className="flex-1 h-4 p-1 bg-black-800 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full",
              claimed ? "bg-mauve-100" : "bg-green-100",
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
          />
        </div>

        {/* Count display */}
        <p
          className="flex items-center gap-2 text-[14px] leading-[100%] tracking-normal text-white-100 font-sans"
          style={{ fontWeight: 450 }}
        >
          {isCompleted && <CheckIcon className="w-4 h-4" size="sm" />}
          <span>
            {count} of {total}
          </span>
        </p>
      </div>

      {/* Reward section */}
      {rewards.map((reward) => (
        <div className="flex items-center rounded-full w-full bg-white-900 p-1">
          <img
            src={
              reward.description.includes("NUMS")
                ? "/assets/token.png"
                : reward.icon
            }
            alt={reward.name}
            className="w-6 h-6 rounded-full"
          />
          <p className="text-base font-sans px-2">{reward.description}</p>
        </div>
      ))}

      {/* Mobile: claim button */}
      <Claim
        claimed={claimed}
        isCompleted={isCompleted}
        onClaim={onClaim}
        expiration={expiration}
        className="w-full md:hidden"
      />
    </div>
  );
};

export const Claim = ({
  claimed,
  isCompleted,
  onClaim,
  expiration,
  className = "",
  variant = "default",
}: {
  claimed: boolean;
  isCompleted: boolean;
  onClaim?: () => void;
  expiration: number;
  variant?: "default" | "secondary";
  className?: string;
}) => {
  const [countdown, setCountdown] = useState<string>(() =>
    getCountdown(expiration),
  );

  useEffect(() => {
    setCountdown(getCountdown(expiration));
    if (!expiration) return;
    const interval = setInterval(() => {
      const now = new Date();
      const diff = expiration * 1000 - now.getTime();
      setCountdown(Formatter.countdown(diff));
    }, 1000);
    return () => clearInterval(interval);
  }, [expiration]);

  if (claimed)
    return (
      <div className={className}>
        <div
          className={cn(
            "px-5 py-1 bg-black-800 rounded-lg h-10 flex items-center justify-center",
            className,
          )}
        >
          <p
            className="text-[22px]/[15px] tracking-wider text-white-100 translate-y-0.5"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
          >
            Claimed
          </p>
        </div>
      </div>
    );

  if (isCompleted && onClaim)
    return (
      <Button
        variant="default"
        onClick={onClaim}
        className={cn("bg-green-100 hover:bg-green-300", className)}
        style={{
          textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)",
        }}
      >
        <p className="text-[28px] translate-y-0.5">Claim</p>
      </Button>
    );

  if (variant === "secondary") {
    return (
      <div className={className}>
        <div
          className={cn(
            "select-none h-10 flex items-center justify-center",
            className,
          )}
        >
          <p
            className="text-[22px]/[15px] tracking-wider text-white-100 translate-y-0.5"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
          >
            New Quests in: {countdown}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        className={cn(
          "select-none px-5 py-1 bg-black-800 rounded-lg h-10 flex items-center justify-center",
          className,
        )}
      >
        <p
          className="text-[22px]/[15px] tracking-wider text-white-100 translate-y-0.5"
          style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
        >
          {countdown}
        </p>
      </div>
    </div>
  );
};
