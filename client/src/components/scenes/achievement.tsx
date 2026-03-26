import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ShadowEffect } from "@/components/icons";
import {
  Achievements,
  type AchievementsProps,
} from "@/components/containers/achievements";
import { AchievementCount, Close } from "@/components/elements";
import { useId } from "react";

export interface AchievementSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof achievementSceneVariants> {
  achievementsProps: AchievementsProps;
  onClose?: () => void;
}

const achievementSceneVariants = cva(
  "select-none flex items-center justify-center gap-6 md:gap-10 px-1 py-2 xs:px-5 xs:py-6 md:py-[120px] overflow-hidden w-full",
  {
    variants: {
      variant: {
        default:
          "rounded-2xl md:rounded-3xl bg-black-200 backdrop-blur-[8px] border-[2px] border-black-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const AchievementScene = ({
  achievementsProps,
  onClose,
  variant,
  className,
  ...props
}: AchievementSceneProps) => {
  const filterId = useId();

  return (
    <div
      className={cn(achievementSceneVariants({ variant, className }))}
      {...props}
    >
      <ShadowEffect filterId={filterId} />

      {/* Mobile */}
      <div className="flex flex-col md:hidden gap-6 w-full h-full">
        <div className="flex items-center justify-between w-full px-1">
          <Title />
          {onClose && (
            <div className="flex justify-end flex-shrink-0">
              <Close size="md" onClick={onClose} />
            </div>
          )}
        </div>
        <AchievementCount
          count={
            achievementsProps.achievements.filter((a) => a.count >= a.total)
              .length
          }
          total={achievementsProps.achievements.length}
          className="w-full"
        />
        <Achievements {...achievementsProps} className="overflow-hidden" />
      </div>

      {/* Desktop */}
      <div className="hidden md:flex md:flex-col md:items-stretch overflow-hidden h-full w-full">
        {onClose && (
          <Close
            size="lg"
            onClick={onClose}
            className="absolute z-10 top-8 right-8"
          />
        )}
        <div className="h-full w-full max-w-[720px] self-center overflow-hidden flex flex-col gap-6 md:gap-8">
          <div className="flex items-center justify-between">
            <Title />
            <AchievementCount
              count={
                achievementsProps.achievements.filter((a) => a.count >= a.total)
                  .length
              }
              total={achievementsProps.achievements.length}
            />
          </div>
          <Achievements {...achievementsProps} />
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
      Achievements
    </h2>
  );
};
