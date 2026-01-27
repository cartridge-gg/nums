import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Separator } from "../ui/separator";

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
      <ToggleGroupItem value="1D" aria-label="1 Day" className="h-10 flex-1">
        <span className="text-white-100 text-sm tracking-wider translate-y-px px-2">
          1D
        </span>
      </ToggleGroupItem>
      <Separator orientation="vertical" className="h-10 w-px bg-white-900" />
      <ToggleGroupItem value="1W" aria-label="1 Week" className="h-10 flex-1">
        <span className="text-white-100 text-sm tracking-wider translate-y-px px-2">
          1W
        </span>
      </ToggleGroupItem>
      <Separator orientation="vertical" className="h-10 w-px bg-white-900" />
      <ToggleGroupItem
        value="All"
        aria-label="All Time"
        className="h-10 flex-1"
      >
        <span className="text-white-100 text-sm tracking-wider translate-y-px px-2">
          All
        </span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
};
