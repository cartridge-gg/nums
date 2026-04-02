import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { GameIcon } from "@/components/elements/game-icon";
import { Link } from "@/lib/router";

export interface ActivityProps
  extends React.HTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof activityVariants> {
  gameId: string;
  payout: string;
  to: string;
  claimed: boolean;
  cells: (boolean | null)[];
}

const activityVariants = cva(
  "select-none flex gap-3 items-center overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "w-full bg-black-900 hover:bg-black-800 rounded-lg flex items-center gap-3 overflow-hidden h-auto p-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const Activity = ({
  gameId,
  payout,
  to,
  cells,
  claimed: _claimed,
  variant,
  className,
  ...props
}: ActivityProps) => {
  return (
    <Button
      variant="ghost"
      asChild
      className={cn(activityVariants({ variant, className }), "")}
    >
      <Link to={to} {...props}>
        {/* Game Id column */}
        <div className="min-w-0 flex items-center gap-2 text-left">
          <div className="min-w-0 h-10 flex items-center gap-2 rounded-lg px-3 py-2">
            <div className="flex-shrink-0 flex items-center justify-center">
              <GameIcon cells={cells} />
            </div>
            <span className="font-secondary text-base/3 leading-normal tracking-wider text-white-100 truncate font-thin">
              {gameId}
            </span>
          </div>
        </div>

        {/* Payout column */}
        <div className="ml-auto text-right pr-3">
          <span className="font-secondary text-base/3 leading-normal tracking-wider text-green-100 whitespace-nowrap font-thin">
            {payout}
          </span>
        </div>
      </Link>
    </Button>
  );
};
