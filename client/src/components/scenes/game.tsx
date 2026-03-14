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
  type ShareProps,
  Reward,
  Multiplier,
} from "@/components/elements";
import { Slots, Stages, PowerUps } from "@/components/containers";
import type { Game as GameModel } from "@/models/game";
import { Verifier } from "@/helpers/verifier";

export interface GameSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameSceneVariants> {
  game: GameModel;
  powers: PowerUpProps[];
  slots: Array<SlotProps>;
  stages: Array<StageState>;
  share?: ShareProps;
  onGameInfo?: () => void;
  onInstruction?: () => void;
  recommendedSlot?: number | null;
  tutorialGuidedSlot?: number | null;
  tutorialInstructionOverride?: { content: string; onClick: () => void };
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
  share,
  onGameInfo,
  onInstruction,
  recommendedSlot,
  tutorialGuidedSlot,
  tutorialInstructionOverride,
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

  const isSelectable = useMemo(() => {
    return game.selectable_powers.length > 0;
  }, [game]);

  return (
    <div
      className={cn(gameSceneVariants({ variant, size, className }))}
      style={{ scrollbarWidth: "none", ...style }}
      {...props}
    >
      <div className="flex justify-between items-stretch gap-2 xs:gap-3 md:gap-8 w-full">
        <div className="flex justify-between items-center h-full gap-2 xs:gap-3 md:gap-6">
          <Num value={game.number} invalid={isOver} sound data-tutorial="current-number" />
          <div className="flex flex-col justify-between items-start h-full gap-2">
            <p className="text-mauve-100 text-base xs:text-lg leading-4 xs:leading-5 md:leading-6 uppercase tracking-wider">
              Up next
            </p>
            <Num variant="secondary" value={game.next_number} data-tutorial="next-number" />
          </div>
        </div>
        <PowerUps powers={powers} className="hidden md:flex" data-tutorial="power-ups" />
        <Reward
          reward={game.reward}
          className="md:hidden"
          data-tutorial="reward"
        />
      </div>
      <div className="flex flex-col items-center gap-3 w-full">
        <div className="flex justify-between items-center gap-4 w-full">
          <Multiplier multiplier={game.multiplier} className="md:hidden" data-tutorial="multiplier" />
          <Instruction
            content={
              tutorialInstructionOverride
                ? tutorialInstructionOverride.content
                : isSelectable
                  ? "Take Power Up"
                  : isOver && isRescuable
                    ? "Use Power up"
                    : isOver
                      ? "Game Over"
                      : "Set Tile"
            }
            variant={isOver && !isRescuable && !tutorialInstructionOverride ? "destructive" : "default"}
            onClick={tutorialInstructionOverride ? tutorialInstructionOverride.onClick : onInstruction}
            {...(tutorialInstructionOverride ? { "data-tutorial-guided-instruction": "" } : {})}
          />
          {share && <Share {...share} />}
          {onGameInfo && (
            <GameInfo onClick={onGameInfo} disabled={!onGameInfo} />
          )}
        </div>
        <Stages
          states={stages}
          className="w-full md:hidden"
          data-tutorial="stages"
        />
      </div>
      <div
        className="overflow-y-auto w-full p-3"
        style={{ scrollbarWidth: "none" }}
        data-tutorial="slots"
      >
        <Slots
          number={game.number}
          min={game.slot_min}
          max={game.slot_max}
          slots={slots}
          recommendedSlot={recommendedSlot}
          tutorialGuidedSlot={tutorialGuidedSlot}
        />
      </div>
      <div className="hidden md:flex items-stretch justify-center gap-6 w-full">
        <Multiplier multiplier={game.multiplier} data-tutorial="multiplier" />
        <Stages states={stages} className="flex-1" data-tutorial="stages" />
        <Reward reward={game.reward} data-tutorial="reward" />
      </div>
      <PowerUps powers={powers} className="w-full md:hidden" data-tutorial="power-ups" />
    </div>
  );
};
