import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

export interface LeaderboardRowProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof leaderboardRowVariants> {
  rank: number;
  username: string;
  total: number;
  score: number;
}

const leaderboardRowVariants = cva(
  "flex items-center gap-3 md:gap-4 h-11 rounded-lg py-3 px-4 border",
  {
    variants: {
      variant: {
        default: "border-white-900",
        primary:
          "bg-white-900 border-transparent shadow-[1px_1px_0px_0px_rgba(255,255,255,0.12)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const LeaderboardRow = ({
  rank,
  username,
  total,
  score,
  variant,
  className,
  ...props
}: LeaderboardRowProps) => {
  return (
    <div
      className={cn(leaderboardRowVariants({ variant, className }))}
      {...props}
    >
      {/* Rank */}
      <div className="flex-1 text-left">
        <span
          className={cn(
            "text-base/5 tracking-normal align-middle font-sans",
            variant === "primary" ? "text-yellow-100" : "text-white-100",
          )}
          style={{ fontWeight: 450 }}
        >
          {rank}
        </span>
      </div>

      {/* Player */}
      <div className="flex-[3] min-w-0 text-left">
        <span
          className={cn(
            "text-base/5 tracking-normal align-middle font-sans truncate block",
            variant === "primary" ? "text-yellow-100" : "text-white-100",
          )}
        >
          {username}
        </span>
      </div>

      {/* Total games */}
      <div className="flex-[2] text-left">
        <span
          className={cn(
            "text-base/5 tracking-normal align-middle font-sans",
            variant === "primary" ? "text-yellow-100" : "text-white-100",
          )}
        >
          {total}
        </span>
      </div>

      {/* Avg. score */}
      <div className="flex-[2] text-left">
        <span
          className={cn(
            "text-base/5 tracking-normal align-middle font-sans",
            variant === "primary" ? "text-yellow-100" : "text-white-100",
          )}
        >
          {score.toFixed(1)}
        </span>
      </div>
    </div>
  );
};
