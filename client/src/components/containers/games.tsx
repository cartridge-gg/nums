import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { GameRow, type GameRowProps } from "@/components/elements/game-row";

export interface GamesProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof gamesVariants> {
  games: Array<Pick<GameRowProps, "gameId" | "score" | "maxPayout" | "onPlay">>;
}

const gamesVariants = cva("select-none w-full flex flex-col gap-8", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const Games = ({ games, variant, className, ...props }: GamesProps) => {
  return (
    <div className={cn(gamesVariants({ variant, className }))} {...props}>
      {/* Title */}
      <h2
        className="font-primary text-[64px]/[44px] tracking-wider text-white-100 uppercase translate-y-1"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        Play Nums
      </h2>

      <div className="grow flex flex-col items-stretch gap-6 overflow-hidden">
        {/* Headers */}
        <div className="flex items-center gap-3 pr-[60px]">
          <div className="flex-[2] text-left">
            <span
              className="font-primary text-lg/3 tracking-wider align-middle text-mauve-100 translate-y-0.5 pl-2 whitespace-nowrap"
              style={{
                textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)",
              }}
            >
              Game Id
            </span>
          </div>
          <div className="flex-[1] text-left">
            <span
              className="font-primary text-lg/3 tracking-wider align-middle text-mauve-100 translate-y-0.5 whitespace-nowrap"
              style={{
                textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)",
              }}
            >
              Score
            </span>
          </div>
          <div className="flex-1 md:flex-[2] text-left">
            <span
              className="font-primary text-lg/3 tracking-wider align-middle text-mauve-100 translate-y-0.5 whitespace-nowrap"
              style={{
                textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)",
              }}
            >
              Max Payout
            </span>
          </div>
        </div>

        {/* Games list */}
        {games.length > 0 ? (
          <div
            className="flex flex-col gap-3 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {games.map((game, index) => (
              <GameRow key={index} {...game} />
            ))}
          </div>
        ) : (
          <div className="grow flex justify-center items-center border border-mauve-700 rounded-lg p-16">
            <p className="uppercase tracking-wider text-white-400 text-[22px]/[20px] text-center">
              You do not have any
              <br />
              nums tickets
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
