import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { useEffect, useState } from "react";
import { Formatter } from "@/helpers";

export interface QuestRefreshProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof questRefreshVariants> {
  expiration: number;
}

const questRefreshVariants = cva(
  "select-none flex items-center justify-center px-3 py-2.5 gap-2 h-10 self-stretch",
  {
    variants: {
      variant: {
        default: "bg-purple-900 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const getCountdown = (exp: number) => {
  if (!exp) return Formatter.countdown(0);
  const now = new Date();
  const diff = exp * 1000 - now.getTime();
  return Formatter.countdown(diff);
};

export const QuestRefresh = ({
  expiration,
  variant,
  className,
  ...props
}: QuestRefreshProps) => {
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

  return (
    <div
      className={cn(questRefreshVariants({ variant, className }))}
      {...props}
    >
      <p
        className="font-primary text-[22px]/[25px] tracking-[0.03em] text-white-500 translate-y-0.5"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
      >
        New Quests in: {countdown}
      </p>
    </div>
  );
};
