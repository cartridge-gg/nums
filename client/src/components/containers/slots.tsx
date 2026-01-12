import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@/components/elements";
import { Grid } from "@/helpers";

export interface SlotsProps
  extends React.HTMLAttributes<HTMLUListElement>,
    VariantProps<typeof slotsVariants> {
  number: number;
  slots: Array<number>;
}

const slotsVariants = cva(
  "select-none relative rounded grid grid-flow-col grid-rows-10 xs:grid-rows-7 md:grid-rows-5 gap-3 md:gap-4 w-full",
  {
    variants: {
      variant: {
        default: "md:p-3",
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
}: SlotsProps) => {
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
    <ul className={cn(slotsVariants({ variant, className }))} {...props}>
      {slots.map((slot, index) => (
        <li key={`${index}-${slot}`} className="flex justify-center min-h-10">
          <Slot
            label={index + 1}
            value={slot}
            invalid={invalidIndexes.has(index)}
            onSlotClick={() => {}}
          />
        </li>
      ))}
      <li className="justify-center hidden xs:flex md:hidden">
        <Slot variant="placeholder" />
      </li>
    </ul>
  );
};
