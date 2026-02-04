import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  type StageState,
  Num,
  Instruction,
  StageInfo,
  type SlotProps,
  type PowerUpProps,
  Share,
} from "@/components/elements";
import { Slots, Stages, PowerUps } from "@/components/containers";
import { Grid } from "@/helpers";

export interface GameSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameSceneVariants> {
  currentNumber: number;
  nextNumber: number;
  powers: PowerUpProps[];
  slots: Array<SlotProps>;
  stages: Array<StageState>;
}

const gameSceneVariants = cva(
  "select-none relative flex flex-col justify-between items-center gap-4 md:gap-8",
  {
    variants: {
      variant: {
        default: "",
      },
      size: {
        md: "h-full md:w-[720px] mx-auto",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export const GameScene = ({
  currentNumber,
  nextNumber,
  powers,
  slots,
  stages,
  variant,
  size,
  className,
  style,
  ...props
}: GameSceneProps) => {
  const isOver = useMemo(() => {
    const allowedIndexes = Grid.alloweds(
      slots.map((slot) => slot.value || 0),
      currentNumber,
    );
    return allowedIndexes.length === 0;
  }, [slots, currentNumber]);

  const isRescuable = useMemo(() => {
    return powers.some(
      (powerProps) => !!powerProps.power && !powerProps.status,
    );
  }, [powers]);

  return (
    <div
      className={cn(gameSceneVariants({ variant, size, className }))}
      style={{ scrollbarWidth: "none", ...style }}
      {...props}
    >
      <div className="flex justify-between items-end md:gap-8 w-full">
        <div className="flex justify-between items-center h-full gap-2 xs:gap-6">
          <Num value={currentNumber} invalid={isOver} />
          <div className="flex flex-col justify-between items-start h-full gap-2">
            <p className="text-mauve-100 text-base xs:text-lg leading-4 xs:leading-5 md:leading-6 uppercase tracking-wider">
              Up next
            </p>
            <Num variant="secondary" value={nextNumber} />
          </div>
        </div>
        <PowerUps
          powers={powers}
          onInfoClick={() => {}}
          className="hidden md:flex"
        />
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
          <StageInfo disabled />
        </div>
        <Stages states={stages} className="w-full md:hidden" />
      </div>
      <div
        className="overflow-y-auto w-full p-3 px-6"
        style={{ scrollbarWidth: "none" }}
      >
        <Slots number={currentNumber} slots={slots} />
      </div>
      <Stages states={stages} className="w-full hidden md:grid" />
      <PowerUps
        powers={powers}
        onInfoClick={() => {}}
        className="w-full md:hidden"
      />
    </div>
  );
};
