import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { QuoteIcon, ArrowDownIcon } from "@/components/icons";
import { Formatter } from "@/helpers";
import { NotificationPing } from "./notification-ping";

export interface ReferralPaymentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof referralPaymentVariants> {
  username: string;
  amount: string;
  timestamp: number;
  isNew?: boolean;
}

const referralPaymentVariants = cva(
  "flex justify-between items-center gap-2 h-11 min-h-11 rounded-lg p-3",
  {
    variants: {
      variant: {
        default: "bg-white-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const ReferralPayment = ({
  username,
  amount,
  timestamp,
  isNew,
  variant,
  className,
  ...props
}: ReferralPaymentProps) => {
  const timedelta = Date.now() - timestamp * 1000;
  return (
    <div
      className={cn(
        "relative",
        referralPaymentVariants({ variant, className }),
      )}
      {...props}
    >
      {isNew && <NotificationPing />}
      <div className="flex items-center gap-2 overflow-hidden">
        <ArrowDownIcon size="md" className="min-w-6 min-h-6" />

        <div className="flex items-center gap-1.5 overflow-hidden">
          <div className="flex items-center gap-0.5 bg-white-900 rounded p-0.5">
            <div className="flex justify-center items-center p-0.5">
              <QuoteIcon size="xs" />
            </div>
            <span className="text-sm font-sans text-white-100 px-0.5 whitespace-nowrap">
              {amount}
            </span>
          </div>
          <span className="text-sm font-sans text-white-500">from</span>
          <div className="flex items-center gap-0.5 bg-white-900 rounded px-1 py-0.5 overflow-hidden">
            <span className="text-sm font-sans text-white-100 truncate">
              {username}
            </span>
          </div>
        </div>
      </div>

      <div className="w-10 text-right">
        <span className={cn("text-sm font-sans text-white-500")}>
          {Formatter.short(timedelta)}
        </span>
      </div>
    </div>
  );
};
