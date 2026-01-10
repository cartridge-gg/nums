import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { BrandIcon } from "@/components/icons";

export interface SlotProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof slotVariants> {
  label?: number;
  value?: number;
  invalid?: boolean;
  onSlotClick?: () => void;
}

const slotVariants = cva(
  "select-none relative rounded-lg flex items-center justify-between",
  {
    variants: {
      variant: {
        default: "bg-black-800",
        placeholder: "border border-black-800 justify-center text-mauve-100",
      },
      size: {
        md: "h-10 w-[100px] md:w-[120px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export const Slot = ({
  label,
  value = 0,
  invalid = false,
  variant,
  size,
  className,
  onSlotClick,
  ...props
}: SlotProps) => {
  if (variant === "placeholder") {
    return (
      <div
        className={cn(slotVariants({ variant, size, className }))}
        {...props}
      >
        <BrandIcon />
      </div>
    );
  }

  return (
    <div className={cn(slotVariants({ variant, size, className }))} {...props}>
      <p className="w-1/3 text-[22px] text-mauve-100 font-secondary tracking-wide font-bold text-center">
        {label}
      </p>
      <Button
        variant="muted"
        className={cn(
          "h-10 w-2/3 rounded-lg",
          !!value && !invalid && "bg-mauve-100 hover:bg-mauve-100",
          (!!value || invalid) && "pointer-events-none cursor-default",
        )}
        disabled={!value && invalid}
        onClick={onSlotClick}
      >
        <p
          className={cn(
            "text-2xl font-secondary tracking-wide font-bold",
            invalid && !!value && "text-red-100",
          )}
          style={{
            textShadow: "2px 1px 0px rgba(0, 0, 0, 0.85)",
            transform: "translateY(2px)",
          }}
        >
          {value || "Set"}
        </p>
      </Button>
    </div>
  );
};
