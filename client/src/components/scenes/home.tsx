import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Banners,
  Games,
  Activities,
  type GamesProps,
  type ActivitiesProps,
} from "../containers";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { AddIcon, ShadowEffect } from "../icons";
import { useId } from "react";

export interface HomeSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof homeSceneVariants> {
  gameId?: number;
  gamesProps: GamesProps;
  activitiesProps: ActivitiesProps;
  onPractice?: () => void;
  onPurchase?: () => void;
}

const homeSceneVariants = cva(
  "select-none flex flex-col gap-4 md:gap-6 h-full w-full max-w-[800px] p-2 py-4 md:p-0 md:py-0 overflow-hidden",
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

export const HomeScene = ({
  gameId,
  gamesProps,
  activitiesProps,
  onPractice,
  onPurchase,
  variant,
  className,
  ...props
}: HomeSceneProps) => {
  const filterId = useId();

  return (
    <div className={cn(homeSceneVariants({ variant, className }))} {...props}>
      <ShadowEffect filterId={filterId} />
      <Banners />
      <Games {...gamesProps} />
      <Activities {...activitiesProps} className="grow overflow-hidden px-2" />
      <div className="flex flex-col md:flex-row gap-3 md:gap-6 px-2">
        <Button
          variant="secondary"
          className="h-12 w-full"
          onClick={onPractice}
        >
          <span className="text-[28px]/[19px] tracking-wider translate-y-0.5">
            Practice
          </span>
        </Button>
        {!gameId ? (
          <NewGame filterId={filterId} onClick={onPurchase || (() => {})} />
        ) : (
          <Button
            variant="default"
            className="h-12 w-full bg-green-100 hover:bg-green-200 rounded-b-[32px] md:rounded-b-lg"
          >
            <Link
              to={`/game?id=${gameId}`}
              className="w-full h-full flex items-center justify-center"
            >
              <span className="text-[28px]/[19px] tracking-wider translate-y-0.5">
                Continue
              </span>
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export const NewGame = ({
  filterId,
  onClick,
  className,
}: {
  filterId: string;
  onClick: () => void;
  className?: string;
}) => {
  return (
    <Button
      variant="default"
      className={cn(
        "h-12 w-full rounded-b-[32px] md:rounded-b-lg gap-1",
        className,
      )}
      onClick={onClick}
    >
      <AddIcon size="lg" style={{ filter: `url(#${filterId})` }} />
      <p
        className="px-1 text-[28px]/[19px] tracking-wide translate-y-0.5"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        New Game
      </p>
    </Button>
  );
};
