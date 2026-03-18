import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

export interface AchievementProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof achievementProgressVariants> {
  count: number;
  total: number;
}

const achievementProgressVariants = cva("p-1 bg-white-900 rounded-lg", {
  variants: {
    variant: {
      default: "",
      complete: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const achievementProgressBarVariants = cva("h-2 rounded", {
  variants: {
    variant: {
      default: "bg-mauve-100",
      complete: "bg-green-100",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const AchievementProgress = ({
  count,
  total,
  variant,
  className,
  ...props
}: AchievementProgressProps) => {
  const progress = total > 0 ? Math.min((count / total) * 100, 100) : 0;

  return (
    <div
      className={cn(achievementProgressVariants({ variant, className }))}
      {...props}
    >
      <div
        className={achievementProgressBarVariants({ variant })}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
