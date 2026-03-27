import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { LockerIcon } from "@/components/icons";

const stakingWarningVariants = cva(
  "select-none flex items-start gap-3 rounded-lg p-3",
  {
    variants: {
      variant: {
        default: "bg-white-900 text-white-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface StakingWarningProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stakingWarningVariants> {
  message?: string;
  fee?: number;
}

export const StakingWarning = ({
  message,
  fee,
  variant,
  className,
  ...props
}: StakingWarningProps) => {
  const displayMessage =
    message ??
    (fee === 0
      ? "Withdrawal fee is currently 0%. This may be subject to change through a governance vote."
      : `Withdrawal fee of ${fee ?? 5}% when unstaking. Fees are redistributed to all stakers.`);
  return (
    <div
      className={cn(stakingWarningVariants({ variant, className }))}
      {...props}
    >
      <div className="bg-white-900 rounded flex items-center justify-center w-5 h-5">
        <LockerIcon size="xs" />
      </div>
      <span className="font-sans text-xs/[15px]">{displayMessage}</span>
    </div>
  );
};
