import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { PowerUp, type PowerUpProps } from "@/components/elements";
import type { TutorialAnchor } from "@/models/tutorial";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export interface PowerUpsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof powerUpsVariants> {
  powers: PowerUpProps[];
  tutorialAnchor?: TutorialAnchor;
  tutorialOverlay?: ReactNode;
}

const powerUpsVariants = cva(
  "select-none relative flex flex-col justify-between items-center gap-2",
  {
    variants: {
      variant: {
        default: "",
      },
      size: {
        md: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export const PowerUps = ({
  powers,
  tutorialAnchor,
  tutorialOverlay,
  variant,
  size,
  className,
  ...props
}: PowerUpsProps) => {
  return (
    <div
      className={cn(powerUpsVariants({ variant, size, className }))}
      {...props}
    >
      <p className="w-full text-mauve-100 text-lg/6 uppercase tracking-wider">
        Power Ups
      </p>
      <ul className="flex justify-center gap-3 w-full">
        {powers.map((powerProps, index) => {
          const isAnchor =
            tutorialAnchor?.type === "power" &&
            (tutorialAnchor as { type: "power"; index: number }).index ===
              index;
          const powerEl = (
            <PowerUp
              {...powerProps}
              className={cn(
                "w-full md:w-auto",
                index === 0 && "rounded-bl-4xl md:rounded-bl-lg",
                index === powers.length - 1 &&
                  "rounded-br-4xl md:rounded-br-lg",
                powerProps.className,
              )}
            />
          );
          return (
            <li key={`${index}`} className="w-full md:w-auto">
              {isAnchor && tutorialOverlay ? (
                <Tooltip open>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <svg
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          className="w-full h-full fill-none stroke-[2] stroke-yellow-100 animate-[marching-ants_0.5s_linear_infinite]"
                          rx="8"
                          ry="8"
                          strokeDasharray="8,8"
                        />
                      </svg>
                      {powerEl}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    align="start"
                    sideOffset={8}
                    collisionPadding={8}
                    className="bg-transparent p-0 border-none shadow-none max-w-[calc(100vw-16px)]"
                  >
                    {tutorialOverlay}
                  </TooltipContent>
                </Tooltip>
              ) : (
                powerEl
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
