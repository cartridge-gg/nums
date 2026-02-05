import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import type { Power, PowerIconStatus } from "@/types/power";
import { DiamondIcon } from "@/components/icons";
import { useMemo } from "react";

export interface PowerUpProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof powerUpVariants> {
  power?: Power;
  status?: PowerIconStatus;
  disabled?: boolean;
}

const powerUpVariants = cva(
  "select-none relative rounded-lg flex items-center justify-between",
  {
    variants: {
      variant: {
        default: "bg-black-800",
      },
      size: {
        md: "min-h-[56px] min-w-[56px] md:min-h-[68px] md:min-w-[68px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export const PowerUp = ({
  power,
  status,
  variant,
  size,
  disabled,
  className,
  ...props
}: PowerUpProps) => {
  const Icon = power?.icon(status);

  const isDisabled = useMemo(() => {
    return !!status || !power || power.isNone() || disabled;
  }, [status, power, disabled]);

  return (
    <Button
      disabled={isDisabled}
      variant="muted"
      className={cn(
        powerUpVariants({ variant, size, className }),
        "p-3 md:p-4 disabled:opacity-100",
        power
          ? "bg-mauve-700 hover:bg-mauve-500 disabled:bg-mauve-800 disabled:shadow-none"
          : "bg-black-800 shadow-none",
      )}
      {...props}
    >
      {Icon && power ? (
        <Icon
          className={cn(
            status === "used" ? "text-white-400" : power.color(),
            "h-full w-full",
          )}
        />
      ) : (
        <DiamondIcon className="text-mauve-100 h-full w-full" />
      )}
    </Button>
  );
};
