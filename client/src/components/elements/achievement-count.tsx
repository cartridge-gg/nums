import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { LaurelIcon } from "@/components/icons";

export interface AchievementCountProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof achievementCountVariants> {
  count: number;
  total: number;
}

const achievementCountVariants = cva(
  "flex justify-center items-center p-2.5 gap-2 bg-white-900 rounded-lg",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const AchievementCount = ({
  count,
  total,
  variant,
  className,
  ...props
}: AchievementCountProps) => {
  return (
    <div
      className={cn(achievementCountVariants({ variant, className }))}
      {...props}
    >
      <LaurelIcon size="sm" className="text-green-100" />
      <div className="flex items-center gap-1 font-sans text-base/5">
        <span className="text-green-100">{count}</span>
        <span className="text-white-400">/</span>
        <span className="text-white-100">{total}</span>
      </div>
    </div>
  );
};
