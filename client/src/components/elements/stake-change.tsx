import { AddIcon, SubIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const stakeChangeVariants = cva(
  "shadow-[1px_1px_0px_0px_rgba(255,255,255,0.12)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
  {
    variants: {
      variant: {
        default:
          "h-10 w-10 md:h-12 md:w-12 bg-white-900 hover:bg-white-800 text-white-100 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface StakeAddProps
  extends Omit<ButtonProps, "variant">,
    VariantProps<typeof stakeChangeVariants> {}

export const StakeAdd = ({ className, variant, ...props }: StakeAddProps) => {
  return (
    <Button
      className={cn(stakeChangeVariants({ variant, className }))}
      {...props}
    >
      <AddIcon size="sm" />
    </Button>
  );
};

export interface StakeSubProps
  extends Omit<ButtonProps, "variant">,
    VariantProps<typeof stakeChangeVariants> {}

export const StakeSub = ({ className, variant, ...props }: StakeSubProps) => {
  return (
    <Button
      className={cn(stakeChangeVariants({ variant, className }))}
      {...props}
    >
      <SubIcon size="sm" />
    </Button>
  );
};
