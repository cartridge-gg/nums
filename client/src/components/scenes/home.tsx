import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Banners,
  Activities,
  type ActivitiesProps,
} from "../containers";
import { Button } from "../ui/button";
import { ShadowEffect } from "../icons";
import { useId } from "react";

export interface HomeSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof homeSceneVariants> {
  activitiesProps: ActivitiesProps;
  isConnected: boolean;
  onConnect: () => void;
  onPractice?: () => void;
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
  activitiesProps,
  isConnected,
  onConnect,
  onPractice,
  variant,
  className,
  ...props
}: HomeSceneProps) => {
  const filterId = useId();

  return (
    <div className={cn(homeSceneVariants({ variant, className }))} {...props}>
      <ShadowEffect filterId={filterId} />
      <Banners />
      <Activities {...activitiesProps} className="grow overflow-hidden px-2" />
      <div className="flex flex-col gap-3 px-2">
        {isConnected ? (
          <Button
            variant="secondary"
            className="h-12 w-full"
            onClick={onPractice}
          >
            <span className="text-[28px]/[19px] tracking-wider translate-y-0.5">
              Practice
            </span>
          </Button>
        ) : (
          <Button
            variant="default"
            className="h-12 w-full rounded-b-[32px] md:rounded-b-lg"
            onClick={onConnect}
          >
            <span className="text-[28px]/[19px] tracking-wider translate-y-0.5">
              Connect
            </span>
          </Button>
        )}
      </div>
    </div>
  );
};
