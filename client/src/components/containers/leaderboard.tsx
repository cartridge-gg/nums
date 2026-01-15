import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  LeaderboardRow,
  type LeaderboardRowProps,
} from "@/components/elements/leaderboard-row";

export interface LeaderboardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof leaderboardVariants> {
  rows: LeaderboardRowProps[];
}

const leaderboardVariants = cva(
  "select-none overflow-hidden w-full flex flex-col gap-6 px-4 py-6 md:px-6 pb-0 rounded-lg shadow-[1px_1px_0px_0px_rgba(255,255,255,0.12)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
  {
    variants: {
      variant: {
        default: "bg-black-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const Leaderboard = ({
  rows,
  variant,
  className,
  ...props
}: LeaderboardProps) => {
  return (
    <div className={cn(leaderboardVariants({ variant, className }))} {...props}>
      {/* Headers */}
      <div className="flex items-center gap-4 h-3">
        <div className="flex-1 text-left">
          <span
            className="font-primary text-lg/3 tracking-wider align-middle text-mauve-100 translate-y-0.5 pl-4"
            style={{
              textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)",
            }}
          >
            <span className="hidden md:inline">Rank</span>
            <span className="inline md:hidden">#</span>
          </span>
        </div>
        <div className="flex-[3] min-w-0 text-left">
          <span
            className="font-primary text-lg/3 tracking-wider align-middle text-mauve-100 translate-y-0.5"
            style={{
              textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)",
            }}
          >
            Player
          </span>
        </div>
        <div className="flex-[2] text-left">
          <span
            className="font-primary text-lg/3 tracking-wider align-middle text-mauve-100 translate-y-0.5"
            style={{
              textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)",
            }}
          >
            <span className="hidden md:inline">Total Games</span>
            <span className="inline md:hidden">Games</span>
          </span>
        </div>
        <div className="flex-[2] text-left">
          <span
            className="font-primary text-lg/3 tracking-wider align-middle text-mauve-100 translate-y-0.5"
            style={{
              textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)",
            }}
          >
            <span className="hidden md:inline">Avg. Score</span>
            <span className="inline md:hidden">Score</span>
          </span>
        </div>
      </div>

      {/* Rows or Empty state */}
      {rows.length === 0 ? (
        <div className="bg-black-900 border border-white-800 rounded-lg py-12 mb-6 flex items-center justify-center grow">
          <p
            className="text-white-300 text-lg/6 tracking-wider translate-y-0.5 w-1/2 text-center"
            style={{
              textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)",
            }}
          >
            No games have been played yet
          </p>
        </div>
      ) : (
        <div
          className="flex flex-col gap-2 overflow-y-auto pb-6"
          style={{ scrollbarWidth: "none" }}
        >
          {rows.map((row, index) => (
            <LeaderboardRow key={index} {...row} />
          ))}
        </div>
      )}
    </div>
  );
};
