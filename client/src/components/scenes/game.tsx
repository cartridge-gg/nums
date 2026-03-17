import { useMemo, type ReactNode } from "react";
import { useMediaQuery } from "usehooks-ts";
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
import type { TutorialAnchor } from "@/models/tutorial";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export interface GameSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameSceneVariants> {
  game: GameModel;
  powers: PowerUpProps[];
  slots: Array<SlotProps>;
  stages: Array<StageState>;
  share?: ShareProps;
  tutorialAnchor?: TutorialAnchor;
  tutorialOverlay?: ReactNode;
  onGameInfo?: () => void;
  onInstruction?: () => void;
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

const TutorialAnchorWrapper = ({
  active,
  overlay,
  className,
  children,
}: {
  active: boolean;
  overlay?: ReactNode;
  className?: string;
  children: ReactNode;
}) => {
  if (!active || !overlay) return <>{children}</>;
  return (
    <Tooltip open>
      <TooltipTrigger asChild>
        <div className={cn("relative", className)}>
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              className="w-full h-full fill-none stroke-[2] stroke-yellow-100 animate-[marching-ants_0.5s_linear_infinite]"
              rx="8"
              ry="8"
              strokeDasharray="8,8"
            />
          </svg>
          {children}
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="start"
        sideOffset={8}
        collisionPadding={8}
        className="bg-transparent p-0 border-none shadow-none max-w-[calc(100vw-16px)]"
      >
        {overlay}
      </TooltipContent>
    </Tooltip>
  );
};

export const GameScene = ({
  game,
  powers,
  slots,
  stages,
  share,
  tutorialAnchor,
  tutorialOverlay,
  onGameInfo,
  onInstruction,
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

  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div
      className={cn(gameSceneVariants({ variant, size, className }))}
      style={{ scrollbarWidth: "none", ...style }}
      {...props}
    >
      <div className="flex justify-between items-stretch gap-2 xs:gap-3 md:gap-8 w-full">
        <div className="flex justify-between items-center h-full gap-2 xs:gap-3 md:gap-6">
          <TutorialAnchorWrapper
            active={tutorialAnchor?.type === "num"}
            overlay={tutorialOverlay}
          >
            <Num value={game.number} invalid={isOver} sound />
          </TutorialAnchorWrapper>
          <div className="flex flex-col justify-between items-start h-full gap-2">
            <p className="text-mauve-100 text-base xs:text-lg leading-4 xs:leading-5 md:leading-6 uppercase tracking-wider">
              Up next
            </p>
            <TutorialAnchorWrapper
              active={tutorialAnchor?.type === "next_num"}
              overlay={tutorialOverlay}
            >
              <Num variant="secondary" value={game.next_number} />
            </TutorialAnchorWrapper>
          </div>
        </div>
        <PowerUps
          powers={powers}
          tutorialAnchor={isDesktop ? tutorialAnchor : undefined}
          tutorialOverlay={isDesktop ? tutorialOverlay : undefined}
          className="hidden md:flex"
        />
        <TutorialAnchorWrapper
          active={!isDesktop && tutorialAnchor?.type === "reward"}
          overlay={tutorialOverlay}
        >
          <Reward reward={game.reward} className="md:hidden" />
        </TutorialAnchorWrapper>
      </div>
      <div className="flex flex-col items-center gap-3 w-full">
        <div className="flex justify-between items-center gap-4 w-full">
          <TutorialAnchorWrapper
            active={!isDesktop && tutorialAnchor?.type === "multiplier"}
            overlay={tutorialOverlay}
          >
            <Multiplier multiplier={game.multiplier} className="md:hidden" />
          </TutorialAnchorWrapper>
          <Instruction
            content={
              isSelectable
                ? "Take Power Up"
                : isOver && isRescuable
                  ? "Use Power up"
                  : isOver
                    ? "Game Over"
                    : "Set Tile"
            }
            variant={isOver && !isRescuable ? "destructive" : "default"}
            onClick={onInstruction}
          />
          {share && <Share {...share} />}
          {onGameInfo && (
            <GameInfo onClick={onGameInfo} disabled={!onGameInfo} />
          )}
        </div>
        <TutorialAnchorWrapper
          active={!isDesktop && tutorialAnchor?.type === "stages"}
          overlay={tutorialOverlay}
          className="w-full"
        >
          <Stages states={stages} className="w-full md:hidden" />
        </TutorialAnchorWrapper>
      </div>
      <div
        className="overflow-y-auto w-full p-3"
        style={{ scrollbarWidth: "none" }}
      >
        <TutorialAnchorWrapper
          active={tutorialAnchor?.type === "slots"}
          overlay={tutorialOverlay}
        >
          <Slots
            number={game.number}
            min={game.slot_min}
            max={game.slot_max}
            slots={slots}
            tutorialAnchor={tutorialAnchor}
            tutorialOverlay={tutorialOverlay}
          />
        </TutorialAnchorWrapper>
      </div>
      <div className="hidden md:flex items-stretch justify-center gap-6 w-full">
        <TutorialAnchorWrapper
          active={isDesktop && tutorialAnchor?.type === "multiplier"}
          overlay={tutorialOverlay}
        >
          <Multiplier multiplier={game.multiplier} />
        </TutorialAnchorWrapper>
        <TutorialAnchorWrapper
          active={isDesktop && tutorialAnchor?.type === "stages"}
          overlay={tutorialOverlay}
          className="flex-1"
        >
          <Stages states={stages} className="flex-1" />
        </TutorialAnchorWrapper>
        <TutorialAnchorWrapper
          active={isDesktop && tutorialAnchor?.type === "reward"}
          overlay={tutorialOverlay}
        >
          <Reward reward={game.reward} />
        </TutorialAnchorWrapper>
      </div>
      <PowerUps
        powers={powers}
        tutorialAnchor={!isDesktop ? tutorialAnchor : undefined}
        tutorialOverlay={!isDesktop ? tutorialOverlay : undefined}
        className="w-full md:hidden"
      />
    </div>
  );
};
