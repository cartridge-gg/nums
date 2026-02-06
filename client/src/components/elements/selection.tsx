import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import type { Power } from "@/types/power";

export interface SelectionProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof selectionVariants> {
  power: Power;
  onClick: () => void;
  loading?: boolean;
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
  variant,
  className,
  ...props
}: SelectionProps) => {
  const Icon = power.icon();

  return (
    <div className={cn(selectionVariants({ variant, className }))} {...props}>
      <div className="w-full flex flex-col items-center gap-6">
        {/* Icon */}
        {Icon && <Icon size="3xl" className={power.color()} />}

        <div className="w-full flex flex-col gap-4">
          {/* Title */}
          <h3 className="font-primary text-[36px]/6 tracking-wider text-white-100 uppercase">
            {power.name()}
          </h3>

          {/* Description */}
          <p className="text-2xl/[18px] font-secondary tracking-wider">
            {power.description()}
          </p>
        </div>
      </div>

      {/* Take Button */}
      <Button
        variant="default"
        onClick={onClick}
        disabled={loading}
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
    </div>
  );
};
