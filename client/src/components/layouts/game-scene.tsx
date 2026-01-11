import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Power, PowerIconStatus } from "@/types/power";
import {
  StageState,
  Number,
  Instruction,
  StageInfo,
} from "@/components/elements";
import { Slots, Stages, PowerUps } from "@/components/containers";
import { Grid } from "@/helpers";

export interface GameSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameSceneVariants> {
  currentNumber: number;
  nextNumber: number;
  powers: Array<{ power?: Power; status?: PowerIconStatus }>;
  slots: Array<number>;
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
        md: "h-full max-w-[720px] mx-auto",
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
    const allowedIndexes = Grid.alloweds(slots, currentNumber);
    return allowedIndexes.length === 0;
  }, [slots, currentNumber]);

  const isRescuable = useMemo(() => {
    return powers.some((power) => !!power.power && !power.status);
  }, [powers]);

  return (
    <div
      className={cn(gameSceneVariants({ variant, size, className }))}
      style={{ scrollbarWidth: "none", ...style }}
      {...props}
    >
      <div className="flex justify-between items-end md:gap-8 w-full">
        <div className="flex justify-between items-center gap-6">
          <Number value={currentNumber} invalid={isOver} />
          <div className="flex flex-col justify-between items-start gap-2">
            <p className="text-mauve-100 text-lg leading-5 md:leading-6 uppercase tracking-wider">
              Up next
            </p>
            <Number variant="secondary" value={nextNumber} />
          </div>
        </div>
        <PowerUps
          powers={powers}
          onInfoClick={() => {}}
          className="hidden md:flex"
        />
        <StageInfo className="md:hidden" />
      </div>
      <div className="flex flex-col items-center gap-3 w-full">
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
        <Stages states={stages} className="w-full md:hidden" />
      </div>
      <div
        className="overflow-y-auto w-full"
        style={{ scrollbarWidth: "none" }}
      >
        <Slots number={currentNumber} slots={slots} className="md:px-9" />
      </div>
      <div className="hidden md:flex justify-between items-center gap-6 w-full">
        <Stages states={stages} className="grow" />
        <StageInfo className="hidden md:block" />
      </div>
      <PowerUps
        powers={powers}
        onInfoClick={() => {}}
        className="w-full md:hidden"
      />
    </div>
  );
};
