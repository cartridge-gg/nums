import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@/components/elements";

export interface StageProps
  extends React.HTMLAttributes<HTMLUListElement>,
    VariantProps<typeof stageVariants> {
  number: number;
  slots: Array<number>;
}

const stageVariants = cva(
  "select-none relative rounded grid grid-flow-col grid-rows-7 md:grid-rows-5 gap-4 overflow-y-auto",
  {
    variants: {
      variant: {
        default: "p-3",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const closests = (slots: Array<number>, number: number): [number, number] => {
  // Return 2 indexes closest lower and higher to the number
  let closest_lower = -1;
  let closest_higher = -1;
  for (let idx = 0; idx < slots.length; idx++) {
    const slot = slots[idx];
    if (slot < number && slot !== 0) {
      closest_lower = idx;
    }
    if (slot > number && slot !== 0) {
      closest_higher = idx;
      break;
    }
  }
  return [closest_lower, closest_higher];
};

const alloweds = (slots: Array<number>, number: number): number[] => {
  // Return the indexes of the slots that are allowed to be set based on the number
  const [low, high] = closests(slots, number);
  if (high === -1 && low === -1)
    return Array.from({ length: slots.length }, (_, idx) => idx);
  if (high === low) return [];
  if (low === -1) return Array.from({ length: high }, (_, idx) => idx);
  if (high === -1)
    return Array.from(
      { length: slots.length - low - 1 },
      (_, idx) => low + idx + 1,
    );
  return Array.from({ length: high - low - 1 }, (_, idx) => low + idx + 1);
};

export const Slots = ({
  number,
  slots,
  variant,
  className,
  style,
  ...props
}: StageProps) => {
  const allowedIndexes = useMemo(
    () => alloweds(slots, number),
    [slots, number],
  );
  const [closestLower, closestHigher] = useMemo(
    () => closests(slots, number),
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
    <ul
      className={cn(stageVariants({ variant, className }))}
      style={{ scrollbarWidth: "none", ...style }}
      {...props}
    >
      {slots.map((slot, index) => (
        <li key={`${index}-${slot}`}>
          <Slot
            label={index + 1}
            value={slot}
            invalid={invalidIndexes.has(index)}
            onSlotClick={() => {}}
          />
        </li>
      ))}
      <li>
        <Slot variant="placeholder" className="md:hidden" />
      </li>
    </ul>
  );
};
