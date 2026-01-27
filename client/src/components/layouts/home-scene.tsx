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

export interface HomeSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof homeSceneVariants> {
  gameId?: number;
  activeGamesProps: GamesProps;
  activitiesProps: ActivitiesProps;
  onPracticeClick?: () => void;
  onPurchaseClick?: () => void;
}

const homeSceneVariants = cva(
  "select-none flex flex-col gap-4 md:gap-6 h-full w-full max-w-[800px] p-6 pb-8 md:p-0 md:pb-0 overflow-hidden",
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
  activeGamesProps,
  activitiesProps,
  onPracticeClick,
  onPurchaseClick,
  variant,
  className,
  ...props
}: HomeSceneProps) => {
  return (
    <div className={cn(homeSceneVariants({ variant, className }))} {...props}>
      <Banners />
      <Games {...activeGamesProps} />
      <Activities {...activitiesProps} className="grow overflow-hidden" />
      <div className="flex flex-col md:flex-row gap-3 md:gap-6">
        <Button
          variant="secondary"
          onClick={onPracticeClick}
          className="w-full"
          disabled
        >
          <span className="text-[28px]/[19px] tracking-wider translate-y-0.5">
            Practice
          </span>
        </Button>
        {!gameId ? (
          <Button
            variant="default"
            onClick={onPurchaseClick}
            className="w-full"
          >
            <span className="text-[28px]/[19px] tracking-wider translate-y-0.5">
              New Game
            </span>
          </Button>
        ) : (
          <Button
            variant="default"
            className="w-full bg-green-100 hover:bg-green-200"
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
