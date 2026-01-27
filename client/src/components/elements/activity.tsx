import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { BrandIcon, EyeIcon } from "@/components/icons";
import { useId } from "react";
import { Link } from "react-router-dom";

export interface ActivityProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof activityVariants> {
  gameId: number;
  score: number;
  payout: string;
  to: string;
}

const activityVariants = cva("select-none flex gap-3 items-center", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const Activity = ({
  gameId,
  score,
  payout,
  to,
  variant,
  className,
  ...props
}: ActivityProps) => {
  const filterId = useId();

  return (
    <div className={cn(activityVariants({ variant, className }))} {...props}>
      <div className="grow bg-black-900 rounded-lg flex items-center gap-3">
        {/* Game Id column */}
        <div className="flex-[5] flex items-center gap-2 text-left">
          <div className="h-10 flex items-center gap-2 rounded-lg px-3 py-2">
            <div className="w-5 flex items-center justify-center">
              <BrandIcon size="sm" />
            </div>
            <span className="font-secondary text-2xl/3 leading-normal tracking-wider text-white-100 translate-y-0.5 whitespace-nowrap font-thin">
              #{gameId}
            </span>
          </div>
        </div>

        {/* Score column */}
        <div className="flex-[3] text-left translate-y-0.5">
          <span className="font-secondary text-2xl/3 leading-normal tracking-wider text-white-100 whitespace-nowrap font-thin">
            {score}
          </span>
        </div>

        {/* Payout column */}
        <div className="flex-[5] text-left translate-y-0.5">
          <span className="font-secondary text-2xl/3 leading-normal tracking-wider text-green-100 whitespace-nowrap font-thin">
            {payout}
          </span>
        </div>
      </div>

      <Button
        variant="muted"
        asChild
        className="px-3 bg-black-900 hover:bg-black-800"
      >
        <Link to={to}>
          <svg width="0" height="0" style={{ position: "absolute" }}>
            <defs>
              <filter
                id={filterId}
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feDropShadow
                  dx="2"
                  dy="2"
                  stdDeviation="0"
                  floodColor="rgba(0, 0, 0, 0.24)"
                />
              </filter>
            </defs>
          </svg>
          <EyeIcon size="md" style={{ filter: `url(#${filterId})` }} />
        </Link>
      </Button>
    </div>
  );
};
