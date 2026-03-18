import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ShadowEffect } from "../icons";
import { useId } from "react";

export interface AchievementIconProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof achievementIconVariants> {
  icon: string;
}

const achievementIconVariants = cva("flex items-center justify-center", {
  variants: {
    size: {
      md: "w-10 h-10 min-w-10 min-h-10 p-1",
      lg: "w-12 h-12 min-w-12 min-h-12 p-1.5",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export const AchievementIcon = ({
  icon,
  size,
  className,
  ...props
}: AchievementIconProps) => {
  const filterId = useId();

  return (
    <div
      className={cn(achievementIconVariants({ size, className }))}
      {...props}
    >
      <ShadowEffect filterId={filterId} />
      <i
        className={cn("h-full w-full fa-solid", icon)}
        style={{ filter: `url(#${filterId})` }}
      />
    </div>
  );
};
