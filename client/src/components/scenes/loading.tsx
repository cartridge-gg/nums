import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Countdown } from "@/components/animations";

export interface LoadingSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingSceneVariants> {
  title?: string;
  description?: string;
}

const loadingSceneVariants = cva(
  "select-none flex flex-col gap-6 items-center justify-center h-full w-full px-6 text-center",
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
  title,
  description,
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
      {(title || description) && (
        <div className="flex max-w-[360px] flex-col items-center gap-3">
          {title && (
            <h2
              className="text-[36px]/[24px] tracking-wider text-white-100 translate-y-0.5"
              style={{
                textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)",
              }}
            >
              {title}
            </h2>
          )}
          {description && (
            <p className="font-sans text-sm leading-5 text-primary-100">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
