import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import type { Trap } from "@/types/trap";

export interface PlaceProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof placeVariants> {
  trap: Trap;
  onClick: () => void;
}

const placeVariants = cva(
  "select-none flex flex-col items-center gap-6 rounded-lg p-6 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.04)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
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

export const Place = ({
  trap,
  onClick,
  variant,
  className,
  ...props
}: PlaceProps) => {
  const Icon = trap.icon("shadow");

  return (
    <div className={cn(placeVariants({ variant, className }))} {...props}>
      <div className="w-full flex flex-col items-center gap-6">
        {/* Icon */}
        {Icon && <Icon size="3xl" className={trap.color()} />}

        <div className="w-full flex flex-col gap-4">
          {/* Title */}
          <h3 className="font-primary text-[36px]/6 tracking-wider text-white-100 uppercase">
            {trap.name()}
          </h3>

          {/* Description */}
          <p className="text-2xl/[18px] font-secondary tracking-wider">
            {trap.description()}
          </p>
        </div>
      </div>

      {/* Set Button */}
      <Button
        variant="default"
        onClick={onClick}
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
