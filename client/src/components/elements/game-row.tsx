import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, BrandIcon } from "@/components/icons/regulars";
import { LiveIcon } from "@/components/icons/exotics";
import { useId } from "react";

export interface GameRowProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameRowVariants> {
  gameId: string | number;
  score?: number;
  maxPayout: string | number;
  onPlay?: () => void;
}

const gameRowVariants = cva("select-none flex gap-3 items-center", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const GameRow = ({
  gameId,
  score,
  maxPayout,
  onPlay,
  variant,
  className,
  ...props
}: GameRowProps) => {
  const filterId = useId();
  const Icon = score !== undefined ? LiveIcon : BrandIcon;
  const buttonVariant = score !== undefined ? "default" : "secondary";

  return (
    <div className={cn(gameRowVariants({ variant, className }))} {...props}>
      <div className="grow bg-white-900 border border-white-900 rounded-lg flex items-center gap-3">
        {/* Game Id column */}
        <div className="flex-[2] flex items-center gap-2 text-left">
          <div className="h-10 flex items-center gap-2 rounded-lg px-3 py-2">
            <div className="w-5 flex items-center justify-center">
              <Icon
                size={score !== undefined ? "2xs" : "sm"}
                className={cn(score !== undefined ? "animate-pulse" : "")}
              />
            </div>
            <span className="font-secondary text-2xl/3 leading-normal tracking-wider text-white-100 translate-y-0.5 whitespace-nowrap">
              #{gameId}
            </span>
          </div>
        </div>

        {/* Score column */}
        <div className="flex-1 text-left translate-y-0.5">
          {score !== undefined ? (
            <span className="font-secondary text-2xl/3 leading-normal tracking-wider text-white-100 whitespace-nowrap">
              {score}
            </span>
          ) : (
            <span className="font-secondary text-2xl/3 leading-normal tracking-wider text-white-700 whitespace-nowrap">
              ---
            </span>
          )}
        </div>

        {/* Max Payout column */}
        <div className="flex-1 md:flex-[2] text-left translate-y-0.5">
          <span className="font-secondary text-2xl/3 leading-normal tracking-wider text-white-100 whitespace-nowrap">
            {maxPayout}
          </span>
        </div>
      </div>

      <Button variant={buttonVariant} onClick={onPlay} className="px-3">
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow
                dx="2"
                dy="2"
                stdDeviation="0"
                floodColor="rgba(0, 0, 0, 0.24)"
              />
            </filter>
          </defs>
        </svg>
        <ArrowRightIcon size="md" style={{ filter: `url(#${filterId})` }} />
      </Button>
    </div>
  );
};
