import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { LockerIcon } from "@/components/icons";

const stakingStatusVariants = cva(
  "select-none flex items-center gap-3 rounded-lg bg-white-900 p-3",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface StakingStatusProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stakingStatusVariants> {}

export const StakingStatus = ({
  variant,
  className,
  ...props
}: StakingStatusProps) => {
  return (
    <div
      className={cn(stakingStatusVariants({ variant, className }))}
      {...props}
    >
      <div className="bg-white-900 rounded flex items-center justify-center w-5 h-5">
        <LockerIcon size="sm" className="text-red-100" />
      </div>
      <p className="font-sans text-base/5 text-red-100">Locked</p>
    </div>
  );
};
