import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Countdown } from "@/components/animations";

export interface LoadingSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingSceneVariants> {}

const loadingSceneVariants = cva(
  "select-none flex items-center justify-center h-full w-full",
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

export const LoadingScene = ({
  variant,
  className,
  ...props
}: LoadingSceneProps) => {
  return (
    <div
      className={cn(loadingSceneVariants({ variant, className }))}
      {...props}
    >
      <Countdown size="5xl" />
    </div>
  );
};
