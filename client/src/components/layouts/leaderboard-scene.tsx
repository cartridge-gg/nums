import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/icons/transparents";
import { Leaderboard } from "@/components/containers/leaderboard";
import type { LeaderboardRowData } from "@/hooks/leaderboard";
import { Ranges, type RangeType } from "@/components/elements/ranges";
import { LeaderboardRowProps } from "../elements";
import { useMemo, useState } from "react";

export interface LeaderboardSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof leaderboardSceneVariants> {
  rows: LeaderboardRowData[];
  currentUserAddress?: string;
  onClose?: () => void;
}

const leaderboardSceneVariants = cva(
  "select-none flex items-center justify-center gap-6 md:gap-10 p-2 xs:p-6 rounded-xl overflow-hidden w-full",
  {
    variants: {
      variant: {
        default:
          "bg-black-300 backdrop-blur-[8px] border-[2px] border-black-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const LeaderboardScene = ({
  rows,
  currentUserAddress,
  onClose,
  variant,
  className,
  ...props
}: LeaderboardSceneProps) => {
  const [range, setRange] = useState<RangeType>("All");

  // Transform and filter rows based on range
  const transformedRows = useMemo(() => {
    // Transform data to LeaderboardRowProps with variant based on current user
    const transformed = rows.map((row) => {
      const isCurrentUser =
        BigInt(row.player) === BigInt(currentUserAddress ?? "0x0");

      // Select the appropriate fields based on range
      let total: number;
      let score: number;

      switch (range) {
        case "1D":
          total = row.games_played_day ?? 0;
          score = row.average_score_day ?? 0;
          break;
        case "1W":
          total = row.games_played_week ?? 0;
          score = row.average_score_week ?? 0;
          break;
        case "All":
        default:
          total = row.games_played;
          score = row.average_score;
          break;
      }

      return {
        username: row.username,
        total,
        score,
        variant: (isCurrentUser ? "primary" : "default") as
          | "primary"
          | "default",
      };
    });

    // Filter out rows with 0 games for day/week ranges and sort by score
    const filtered =
      range === "All"
        ? transformed
        : transformed
            .filter((row) => row.total > 0)
            .sort((a, b) => b.score - a.score);

    // Add rank and sort by score for All range
    const sorted =
      range === "All" ? filtered.sort((a, b) => b.score - a.score) : filtered;

    return sorted.map((row, index) => ({
      ...row,
      rank: index + 1,
    })) satisfies LeaderboardRowProps[];
  }, [rows, range, currentUserAddress]);

  return (
    <div
      className={cn(leaderboardSceneVariants({ variant, className }))}
      {...props}
    >
      {/* Mobile */}
      <div
        className="flex flex-col md:hidden gap-6 w-full h-full overflow-y-auto pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Mobile header with close button */}
        <div className="flex items-center justify-between w-full">
          <Title />
          {onClose && (
            <div className="flex justify-end flex-shrink-0">
              <Button
                variant="ghost"
                className="bg-white-800 h-10 w-10 p-0 text-white-100 hover:text-white-400 hover:bg-white-900 rounded-lg"
                onClick={onClose}
              >
                <CloseIcon size="md" />
              </Button>
            </div>
          )}
        </div>
        <Ranges value={range} onValueChange={setRange} className="w-full" />
        <Leaderboard
          rows={transformedRows}
          currentUserAddress={currentUserAddress}
        />
      </div>

      {/* Desktop */}
      <div className="hidden md:flex md:flex-col md:items-stretch overflow-hidden h-full w-full md:max-h-[581px]">
        {/* Close button */}
        {onClose && (
          <Button
            variant="ghost"
            className="absolute z-10 top-8 right-8 bg-white-800 h-12 w-[56px] p-0 text-white-100 hover:text-white-400 hover:bg-white-900 rounded-lg"
            onClick={onClose}
          >
            <CloseIcon size="lg" />
          </Button>
        )}
        <div className="h-full w-full max-w-[720px] self-center overflow-hidden flex flex-col gap-6 md:gap-8">
          <div className="flex items-center justify-between">
            <Title />
            <Ranges value={range} onValueChange={setRange} />
          </div>
          <Leaderboard
            rows={transformedRows}
            currentUserAddress={currentUserAddress}
          />
        </div>
      </div>
    </div>
  );
};

const Title = () => {
  return (
    <h2
      className="text-[36px]/6 md:text-[64px]/[44px] text-white-100 uppercase tracking-wider translate-y-0.5"
      style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
    >
      Leaderboard
    </h2>
  );
};
