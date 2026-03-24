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
  disabled?: boolean;
  buttonId?: string;
}

const selectionVariants = cva(
  "select-none flex flex-col justify-between items-center gap-4 md:gap-6 rounded-lg p-4 md:p-6 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.04)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
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
  buttonId,
  variant,
  className,
  ...props
}: SelectionProps) => {
  const Icon = power.icon();

  return (
    <div className={cn(selectionVariants({ variant, className }))} {...props}>
      <div className="w-full flex md:flex-col md:items-center gap-4 md:gap-6">
        {Icon && (
          <Icon
            className={cn(
              "min-w-12 w-12 md:min-w-16 md:w-16 min-h-12 h-12 md:min-h-16 md:h-16",
              power.color(),
            )}
          />
        )}
        <div className="w-full flex flex-col gap-3 md:gap-4">
          <h3 className="font-primary text-[36px]/6 tracking-wider text-white-100 uppercase">
            {power.name()}
          </h3>
          <p className="text-2xl/[18px] font-secondary tracking-wider">
            {power.description()}
          </p>
        </div>
      </div>
      <Button
        id={buttonId}
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
    </div>
  );
};
