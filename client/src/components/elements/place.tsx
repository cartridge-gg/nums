import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import type { Trap } from "@/types/trap";

export interface PlaceProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof placeVariants> {
  trap: Trap;
  onClick: () => void;
  loading?: boolean;
}

const placeVariants = cva(
  "select-none flex flex-col items-center gap-4 md:gap-6 rounded-lg p-4 md:p-6 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.04)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
  {
    variants: {
      variant: {
        default: "bg-primary-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const Place = ({
  trap,
  onClick,
  loading = false,
  variant,
  className,
  ...props
}: PlaceProps) => {
  const Icon = trap.icon("shadow");

  return (
    <div className={cn(placeVariants({ variant, className }))} {...props}>
      <div className="w-full flex md:flex-col md:items-center gap-4 md:gap-6">
        {/* Icon */}
        {Icon && (
          <Icon
            className={cn(
              "min-w-12 w-12 md:min-w-16 md:w-16 min-h-12 h-12 md:min-h-16 md:h-16",
              trap.color(),
            )}
          />
        )}

        <div className="w-full flex flex-col gap-3 md:gap-4">
          {/* Title */}
          <h3 className="font-primary text-[36px]/6 tracking-wider text-white-100 uppercase">
            {trap.name()}
          </h3>

          {/* Description */}
          <p className="text-lg/5 font-secondary tracking-wider">
            {trap.description()}
          </p>
        </div>
      </div>

      {/* Set Button */}
      <Button
        id="tutorial-set"
        variant="default"
        onClick={onClick}
        disabled={loading}
        loading={loading}
        className={cn("w-full", trap.buttonColor())}
      >
        <p
          className="text-[28px]/[15px] tracking-wide translate-y-0.5"
          style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
        >
          Set
        </p>
      </Button>
    </div>
  );
};
