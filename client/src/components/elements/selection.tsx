import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import type { Power } from "@/types/power";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export interface SelectionProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof selectionVariants> {
  power: Power;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  highlighted?: boolean;
  tutorialOverlay?: ReactNode;
}

const selectionVariants = cva(
  "select-none flex flex-col justify-between items-center gap-6 rounded-lg p-6 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.04)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
  {
    variants: {
      variant: {
        default: "bg-mauve-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const Selection = ({
  power,
  content = "Take",
  onClick,
  loading = false,
  disabled = false,
  highlighted = false,
  tutorialOverlay,
  variant,
  className,
  ...props
}: SelectionProps) => {
  const Icon = power.icon();

  const takeButton = (
    <Button
      variant="default"
      onClick={onClick}
      disabled={loading || disabled}
      loading={loading}
      className={cn("w-full", power.buttonColor())}
    >
      <p
        className="text-[28px]/[15px] tracking-wide translate-y-0.5"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
      >
        {content}
      </p>
    </Button>
  );

  return (
    <div className={cn(selectionVariants({ variant, className }))} {...props}>
      <div className="w-full flex flex-col items-center gap-6">
        {Icon && <Icon size="3xl" className={power.color()} />}
        <div className="w-full flex flex-col gap-4">
          <h3 className="font-primary text-[36px]/6 tracking-wider text-white-100 uppercase">
            {power.name()}
          </h3>
          <p className="text-2xl/[18px] font-secondary tracking-wider">
            {power.description()}
          </p>
        </div>
      </div>
      {highlighted && tutorialOverlay ? (
        <Tooltip open>
          <TooltipTrigger asChild>
            <div className="relative w-full">
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  className="w-full h-full fill-none stroke-[2] stroke-yellow-100 animate-[marching-ants_0.5s_linear_infinite]"
                  rx="8"
                  ry="8"
                  strokeDasharray="8,8"
                />
              </svg>
              {takeButton}
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            align="center"
            sideOffset={8}
            collisionPadding={8}
            className="bg-transparent p-0 border-none shadow-none max-w-[calc(100vw-16px)]"
          >
            {tutorialOverlay}
          </TooltipContent>
        </Tooltip>
      ) : (
        takeButton
      )}
    </div>
  );
};
