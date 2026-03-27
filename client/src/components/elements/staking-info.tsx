import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { AsteriskIcon } from "@/components/icons";

const stakingInfoVariants = cva(
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

export interface StakingInfoProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stakingInfoVariants> {
  message?: string;
  fee?: number;
}

export const StakingInfo = ({
  message,
  fee,
  variant,
  className,
  ...props
}: StakingInfoProps) => {
  const displayMessage =
    message ??
    (fee === 0
      ? "Withdrawal fee is currently 0%. This may be subject to change through a governance vote."
      : `Withdrawal fee of ${fee ?? 5}% when unstaking. Fees are redistributed to all stakers.`);
  return (
    <div className={cn(stakingInfoVariants({ variant, className }))} {...props}>
      <div className="bg-white-900 rounded flex items-center justify-center w-5 h-5">
        <AsteriskIcon size="xs" />
      </div>
      <span className="font-sans text-xs/[15px]">{displayMessage}</span>
    </div>
  );
};
