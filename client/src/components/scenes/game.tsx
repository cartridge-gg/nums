import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  type StageState,
  Num,
  Instruction,
  GameInfo,
  type SlotProps,
  type PowerUpProps,
  Share,
  Reward,
} from "@/components/elements";
import { Slots, Stages, PowerUps } from "@/components/containers";
import { Game as GameModel } from "@/models/game";
import { Verifier } from "@/helpers/verifier";

export interface GameSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameSceneVariants> {
  game: GameModel;
  powers: PowerUpProps[];
  slots: Array<SlotProps>;
  stages: Array<StageState>;
  onGameInfoClick?: () => void;
}

const gameSceneVariants = cva(
  "select-none relative flex flex-col justify-between items-center gap-4 md:gap-8",
  {
    variants: {
      variant: {
        default: "",
      },
      size: {
        md: "h-full md:w-[720px] md:mx-auto",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export const GameScene = ({
  game,
  powers,
  slots,
  stages,
  onGameInfoClick,
  variant,
  size,
  className,
  style,
  ...props
}: GameSceneProps) => {
  const isOver = useMemo(() => {
    return Verifier.isOver(
      game.number,
      game.level,
      game.slot_count,
      game.slots,
    );
  }, [game]);

  const isRescuable = useMemo(() => {
    return game.enabled_powers.some((enabled) => enabled);
  }, [game]);

  return (
    <div
      className={cn(gameSceneVariants({ variant, size, className }))}
      style={{ scrollbarWidth: "none", ...style }}
      {...props}
    >
      <div className="flex justify-between items-stretch gap-2 xs:gap-3 md:gap-8 w-full">
        <div className="flex justify-between items-center h-full gap-2 xs:gap-3 md:gap-6">
          <Num value={game.number} invalid={isOver} />
          <div className="flex flex-col justify-between items-start h-full gap-2">
            <p className="text-mauve-100 text-base xs:text-lg leading-4 xs:leading-5 md:leading-6 uppercase tracking-wider">
              Up next
            </p>
            <Num variant="secondary" value={game.next_number} />
          </div>
        </div>
        <PowerUps powers={powers} className="hidden md:flex" />
        <Reward reward={game.reward} className="md:hidden" />
      </div>
      <div className="flex flex-col items-center gap-3 w-full">
        <div className="flex justify-between items-center gap-4 w-full">
          <Instruction
            content={
              isOver && isRescuable
                ? "Use Power up"
                : isOver
                  ? "Game Over"
                  : "Set Tile"
            }
            variant={isOver && !isRescuable ? "destructive" : "default"}
          />
          <Share disabled />
          <GameInfo onClick={onGameInfoClick} disabled={!onGameInfoClick} />
        </div>
        <Stages states={stages} className="w-full md:hidden" />
      </div>
      <div
        className="overflow-y-auto w-full p-3"
        style={{ scrollbarWidth: "none" }}
      >
        <Slots
          number={game.number}
          min={game.slot_min}
          max={game.slot_max}
          slots={slots}
        />
      </div>
      <div className="hidden md:flex items-stretch justify-center gap-6 w-full">
        <Stages states={stages} className="flex-1" />
        <Reward reward={game.reward} />
      </div>
      <PowerUps powers={powers} className="w-full md:hidden" />
    </div>
  );
};
