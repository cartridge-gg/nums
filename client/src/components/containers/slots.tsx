import { useMemo, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot, type SlotProps } from "@/components/elements";
import { Grid } from "@/helpers";
import { DraggerIcon } from "../icons";
import type { TutorialAnchor } from "@/models/tutorial";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export interface SlotsProps
  extends React.HTMLAttributes<HTMLUListElement>,
    VariantProps<typeof slotsVariants> {
  number: number;
  min: number;
  max: number;
  slots: Array<SlotProps>;
  tutorialAnchor?: TutorialAnchor;
  tutorialOverlay?: ReactNode;
}

const slotsVariants = cva(
  "select-none relative rounded grid grid-flow-col grid-rows-10 xs:grid-rows-7 md:grid-rows-5 gap-3 md:gap-4 w-full",
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

export const Slots = ({
  number,
  min,
  max,
  slots,
  tutorialAnchor,
  tutorialOverlay,
  variant,
  className,
  ...props
}: SlotsProps) => {
  const allowedIndexes = useMemo(
    () =>
      Grid.alloweds(
        slots.map((slot) => slot.value || 0),
        number,
      ),
    [slots, number],
  );
  const [closestLower, closestHigher] = useMemo(
    () =>
      Grid.closests(
        slots.map((slot) => slot.value || 0),
        number,
      ),
    [slots, number],
  );

  const invalidIndexes = useMemo(() => {
    const invalid = new Set<number>();

    if (allowedIndexes.length === 0) {
      // Mark the 2 closest non-empty slots as invalid
      if (closestLower !== -1) invalid.add(closestLower);
      if (closestHigher !== -1) invalid.add(closestHigher);
      // Also mark all empty slots as invalid
      slots.forEach((slot, index) => {
        if (!slot.value) {
          invalid.add(index);
        }
      });
    } else {
      // Mark empty slots that are not allowed as invalid
      slots.forEach((slot, index) => {
        if (!slot.value && !allowedIndexes.includes(index)) {
          invalid.add(index);
        }
      });
    }

    return invalid;
  }, [slots, allowedIndexes, closestLower, closestHigher]);

  return (
    <ul className={cn(slotsVariants({ variant, className }))} {...props}>
      <DraggerIcon className="absolute top-0 left-1/4 -translate-x-2/3 h-full w-auto text-black-700 hidden md:block" />
      <DraggerIcon className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-auto text-black-700 hidden md:block" />
      <DraggerIcon className="absolute top-0 right-1/4 translate-x-2/3 h-full w-auto text-black-700 hidden md:block" />
      <li className="flex justify-center">
        <Slot variant="locked" label={min} />
      </li>
      {slots.map((slot, index) => {
        const isAnchor =
          tutorialAnchor?.type === "slot" &&
          (tutorialAnchor as { type: "slot"; index: number }).index === index;
        return (
          <li key={`${index}-${slot}`} className="flex justify-center min-h-10">
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
                    <Slot
                      {...slot}
                      label={slot.label || index + 2}
                      value={slot.value || 0}
                      invalid={slot.invalid || invalidIndexes.has(index)}
                    />
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
              <Slot
                {...slot}
                label={slot.label || index + 2}
                value={slot.value || 0}
                invalid={slot.invalid || invalidIndexes.has(index)}
              />
            )}
          </li>
        );
      })}
      <li className="flex justify-center">
        <Slot variant="locked" label={max} />
      </li>
      <li className="justify-center hidden xs:flex md:hidden">
        <Slot variant="placeholder" />
      </li>
    </ul>
  );
};
