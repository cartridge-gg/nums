import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { BrandIcon } from "@/components/icons/regulars";
import { LiveIcon } from "@/components/icons/exotics";
import { useEffect, useId, useState } from "react";
import { PlusIcon } from "@/components/icons";
import { Formatter } from "@/helpers";

const ONE_DAY = 24 * 60 * 60 * 1000;

export interface GameProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameVariants> {
  gameId?: number;
  score?: number;
  breakEven?: string | number;
  expiration?: number;
  payout?: string | number;
  onPlay?: () => void;
}

const gameVariants = cva(
  "select-none flex gap-3 md:gap-6 items-stretch overflow-hidden p-2.5 md:px-[14px] md:py-3 rounded-xl",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-black-600 to-black-700 border-2 border-green-100 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)]",
        new: "bg-gradient-to-r from-black-600 to-black-700 border-2 border-yellow-100 border-dashed shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const Game = ({
  gameId,
  score,
  expiration,
  payout,
  onPlay,
  variant,
  className,
  ...props
}: GameProps) => {
  const filterId = useId();

  const Icon = variant === "new" ? PlusIcon : BrandIcon;
  const [expiresIn, setExpiresIn] = useState<string | undefined>(
    Formatter.countdown(expiration ?? ONE_DAY),
  );

  useEffect(() => {
    if (!expiration) return;
    const timer = setInterval(() => {
      const timedelta = expiration * 1000 - Date.now();
      if (timedelta < 0) {
        setExpiresIn(undefined);
        return;
      }
      setExpiresIn(Formatter.countdown(timedelta));
    }, 1000);
    return () => clearInterval(timer);
  }, [expiration]);

  return (
    <div className={cn(gameVariants({ variant, className }))} {...props}>
      <div className="min-w-10 min-h-10 grow flex items-center justify-center bg-white-900 rounded">
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow
                dx="2"
                dy="2"
                stdDeviation="0"
                floodColor="rgba(0, 0, 0, 0.25)"
              />
            </filter>
          </defs>
        </svg>
        <Icon
          className={cn(
            variant === "new" ? "text-white-100" : "text-green-100",
          )}
          size={variant === "new" ? "md" : "lg"}
          style={{ filter: `url(#${filterId})` }}
        />
      </div>
      <div className="w-full grid grid-cols-2 md:flex gap-2">
        {/* Game Id column */}
        <div className="flex-1 flex flex-col gap-2">
          <Content
            title="Game Id"
            value={gameId ? `#${gameId}` : undefined}
            icon={!!gameId && !!score}
          />
        </div>

        {/* Score column */}
        <div className="flex-1 flex flex-col gap-2">
          <Content title="Score" value={score} />
        </div>

        {/* Expires in column */}
        <div className="flex-1 flex flex-col gap-2">
          <Content title="Expires in" value={expiresIn} />
        </div>

        {/* Payout column */}
        <div className="flex-1 flex flex-col gap-2">
          <Content title="Max Payout" value={payout} />
        </div>
      </div>
    </div>
  );
};

const Content = ({
  title,
  value,
  icon,
}: {
  title: string;
  value?: string | number;
  icon?: boolean;
}) => {
  const filterId = useId();

  return (
    <div className="flex-1 flex flex-col gap-2 h-10 overflow-hidden">
      <span
        className="font-primary text-lg/3 tracking-wider align-middle text-mauve-100 translate-y-0.5 whitespace-nowrap"
        style={{
          textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)",
        }}
      >
        {title}
      </span>
      <div className="flex items-center gap-1">
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow
                dx="2"
                dy="2"
                stdDeviation="0"
                floodColor="rgba(0, 0, 0, 0.25)"
              />
            </filter>
          </defs>
        </svg>
        <div
          className={cn(
            "w-5 flex items-center justify-center",
            !icon && "hidden",
          )}
        >
          <LiveIcon
            size="2xs"
            className="animate-pulse"
            style={{ filter: `url(#${filterId})` }}
          />
        </div>
        <span
          className={cn(
            "font-secondary text-2xl/[20px] tracking-wider translate-y-0.5 whitespace-nowrap",
            value ? "text-white-100" : "text-white-700",
          )}
        >
          {value ?? "---"}
        </span>
      </div>
    </div>
  );
};
