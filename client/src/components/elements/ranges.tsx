import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  CalendarDayIcon,
  CalendarWeekIcon,
  TrophyIcon,
} from "@/components/icons";
import { useId } from "react";

export type RangeType = "1D" | "1W" | "All";

export interface RangesProps
  extends Omit<
      React.ComponentPropsWithoutRef<typeof ToggleGroup>,
      "type" | "value" | "onValueChange" | "defaultValue" | "variant" | "size"
    >,
    VariantProps<typeof rangesVariants> {
  value: RangeType;
  onValueChange: (value: RangeType) => void;
}

const rangesVariants = cva("", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const Ranges = ({
  value,
  onValueChange,
  variant,
  className,
  ...props
}: RangesProps) => {
  const filterId = useId();

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(newValue: string) => {
        if (newValue) {
          onValueChange(newValue as RangeType);
        }
      }}
      variant="default"
      size="default"
      className={cn(rangesVariants({ variant }), className, "h-10")}
      {...props}
    >
      {/* Filters */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="2"
              dy="2"
              stdDeviation="0"
              floodColor="rgba(0, 0, 0, 1)"
            />
          </filter>
        </defs>
      </svg>
      <ToggleGroupItem
        value="All"
        aria-label="All Time"
        className="h-10 flex-1 flex gap-0.5 py-2 px-3 rounded-l-lg min-w-auto"
      >
        <TrophyIcon
          size="md"
          variant="solid"
          className="min-w-6 min-h-6"
          style={{ filter: value === "All" ? `url(#${filterId})` : undefined }}
        />
        <span
          className="text-white-100 text-[22px]/[15px] tracking-wider translate-y-0.5 px-1"
          style={{
            textShadow:
              value === "All" ? "2px 2px 0px rgba(0, 0, 0, 1)" : undefined,
          }}
        >
          All
        </span>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="1W"
        aria-label="1 Week"
        className="h-10 flex-1 flex gap-0.5 py-2 px-3 min-w-auto"
      >
        <CalendarWeekIcon
          size="md"
          className="min-w-6 min-h-6"
          style={{ filter: value === "1W" ? `url(#${filterId})` : undefined }}
        />
        <span
          className="text-white-100 text-[22px]/[15px] tracking-wider translate-y-0.5 px-1"
          style={{
            textShadow:
              value === "1W" ? "2px 2px 0px rgba(0, 0, 0, 1)" : undefined,
          }}
        >
          1W
        </span>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="1D"
        aria-label="1 Day"
        className="h-10 flex-1 flex gap-0.5 py-2 px-3 rounded-r-lg min-w-auto"
      >
        <CalendarDayIcon
          size="md"
          className="min-w-6 min-h-6"
          style={{ filter: value === "1D" ? `url(#${filterId})` : undefined }}
        />
        <span
          className="text-white-100 text-[22px]/[15px] tracking-wider translate-y-0.5 px-1"
          style={{
            textShadow:
              value === "1D" ? "2px 2px 0px rgba(0, 0, 0, 1)" : undefined,
          }}
        >
          1D
        </span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
};
