import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  ReferralPayment,
  type ReferralPaymentProps,
} from "@/components/elements/referral-payment";

export interface ReferralPaymentsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof referralPaymentsVariants> {
  payments: ReferralPaymentProps[];
}

const referralPaymentsVariants = cva(
  "select-none w-full flex flex-col rounded-xl p-4 gap-3 overflow-y-auto",
  {
    variants: {
      variant: {
        default: "bg-black-900 border-2 border-white-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const ReferralPayments = ({
  payments,
  variant,
  className,
  ...props
}: ReferralPaymentsProps) => {
  return (
    <div
      className={cn(referralPaymentsVariants({ variant, className }))}
      style={{ scrollbarWidth: "none" }}
      {...props}
    >
      {payments.length === 0 ? (
        <div className="h-full flex items-center justify-center py-8">
          <p className="text-mauve-100 text-[22px]/[20px] tracking-wider translate-y-0.5 text-center">
            <span>You have not made</span>
            <br />
            <span>any referrals yet</span>
          </p>
        </div>
      ) : (
        payments.map((payment, index) => (
          <ReferralPayment key={index} {...payment} />
        ))
      )}
    </div>
  );
};
