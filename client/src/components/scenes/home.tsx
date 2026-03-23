import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Banners,
  Games,
  Activities,
  type GamesProps,
  type ActivitiesProps,
  type ActivityFilter,
} from "../containers";
import { Button } from "../ui/button";
import { ShadowEffect } from "../icons";
import { useId, useState } from "react";

export interface HomeSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof homeSceneVariants> {
  gameId?: number;
  gamesProps?: GamesProps;
  allActivities: ActivitiesProps;
  myActivities: ActivitiesProps;
  isConnected: boolean;
  onConnect: () => void;
  onPractice?: () => void;
  onContinue?: () => void;
}

const homeSceneVariants = cva(
  "select-none flex flex-col gap-4 md:gap-6 p-2 py-4 md:p-0 md:py-0 overflow-hidden",
  {
    variants: {
      variant: {
        default: "",
      },
      size: {
        md: "h-full w-full max-w-[720px]",
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
  allActivities,
  myActivities,
  isConnected,
  onConnect,
  onPractice,
  onContinue,
  variant,
  className,
  ...props
}: HomeSceneProps) => {
  const filterId = useId();
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>(
    myActivities.activities.length > 0 ? "mine" : "all",
  );

  const activities =
    activityFilter === "all" ? allActivities : myActivities;

  return (
    <div className={cn(homeSceneVariants({ variant, className }))} {...props}>
      <ShadowEffect filterId={filterId} />
      <Banners />
      {gamesProps && <Games {...gamesProps} />}
      <Activities
        {...activities}
        filter={activityFilter}
        onFilterChange={setActivityFilter}
        className="grow overflow-hidden px-2"
      />
      <div className="flex flex-col md:flex-row gap-3 md:gap-6 px-2">
        {isConnected ? (
          <>
            <Button
              variant="secondary"
              className="h-12 w-full"
              onClick={onPractice}
            >
              <span className="text-[28px]/[19px] tracking-wider translate-y-0.5">
                New Game
              </span>
            </Button>
            {gameId && (
              <Button
                variant="default"
                className="h-12 w-full bg-green-100 hover:bg-green-200 rounded-b-[32px] md:rounded-b-lg"
                onClick={onContinue}
              >
                <span className="text-[28px]/[19px] tracking-wider translate-y-0.5">
                  Continue
                </span>
              </Button>
            )}
          </>
        ) : (
          <Button
            variant="default"
            className="h-12 w-full rounded-b-[32px] md:rounded-b-lg"
            onClick={onConnect}
          >
            <span className="text-[28px]/[19px] tracking-wider translate-y-0.5">
              Log In
            </span>
          </Button>
        )}
      </div>
    </div>
  );
};
