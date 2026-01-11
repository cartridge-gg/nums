import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@/components/elements";
import { Grid } from "@/helpers";

export interface StageProps
  extends React.HTMLAttributes<HTMLUListElement>,
    VariantProps<typeof stageVariants> {
  number: number;
  slots: Array<number>;
}

const stageVariants = cva(
  "select-none relative rounded flex flex-col flex-wrap space-between items-center gap-3 md:gap-4 w-full",
  {
    variants: {
      variant: {
        default: "md:p-3 max-h-[352px] md:max-h-[288px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const Slots = ({
  number,
  slots,
  variant,
  className,
  ...props
}: StageProps) => {
  const allowedIndexes = useMemo(
    () => Grid.alloweds(slots, number),
    [slots, number],
  );
  const [closestLower, closestHigher] = useMemo(
    () => Grid.closests(slots, number),
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
        if (slot === 0) {
          invalid.add(index);
        }
      });
    } else {
      // Mark empty slots that are not allowed as invalid
      slots.forEach((slot, index) => {
        if (slot === 0 && !allowedIndexes.includes(index)) {
          invalid.add(index);
        }
      });
    }

    return invalid;
  }, [slots, allowedIndexes, closestLower, closestHigher]);

  return (
    <ul className={cn(stageVariants({ variant, className }))} {...props}>
      {slots.map((slot, index) => (
        <li key={`${index}-${slot}`} className="flex justify-center">
          <Slot
            label={index + 1}
            value={slot}
            invalid={invalidIndexes.has(index)}
            onSlotClick={() => {}}
          />
        </li>
      ))}
      <li className="flex justify-center md:hidden">
        <Slot variant="placeholder" />
      </li>
    </ul>
  );
};
