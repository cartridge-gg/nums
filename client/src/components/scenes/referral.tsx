import { useId, useMemo } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ShadowEffect, AsteriskIcon } from "@/components/icons";
import { ReferralLink } from "@/components/elements/referral-link";
import { Close } from "@/components/elements";
import { ReferralPayments } from "@/components/containers/referral-payments";
import type { Referral } from "@/hooks/referral";

const referralSceneVariants = cva(
  "select-none flex flex-col md:flex-row gap-6 md:gap-10 p-6 md:py-[120px]",
  {
    variants: {
      variant: {
        default:
          "rounded-2xl md:rounded-3xl bg-black-300 backdrop-blur-[8px] border-[2px] border-black-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ReferralSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof referralSceneVariants> {
  payments: Referral[];
  link: string;
  onClose?: () => void;
}

const toPaymentProps = (referral: Referral) => ({
  username: referral.username,
  amount: `${referral.amount.toFixed(2)} USDC`,
  timestamp: Math.floor(new Date(referral.executed_at).getTime() / 1000),
});

export const ReferralScene = ({
  payments,
  link,
  onClose,
  variant,
  className,
  ...props
}: ReferralSceneProps) => {
  const filterId = useId();

  const { players, games, total } = useMemo(() => {
    const total = payments.reduce((acc, payment) => acc + payment.amount, 0);
    return {
      players: new Set(payments.map((payment) => payment.username)).size,
      games: payments.length,
      total: total,
    };
  }, [payments]);

  return (
    <div
      className={cn(referralSceneVariants({ variant, className }))}
      {...props}
    >
      <ShadowEffect filterId={filterId} />

      {/* Mobile */}
      <div
        className="flex flex-col md:hidden gap-6 w-full h-full pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="flex items-center justify-between w-full">
          <Title />
          <Close size="md" onClick={onClose} />
        </div>

        <div
          className="flex-1 flex flex-col gap-6 overflow-hidden"
          style={{ scrollbarWidth: "none" }}
        >
          <Subtitle />
          <ReferralLink link={link} />
          <div className="flex flex-col gap-6 flex-1 overflow-hidden">
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <Count
                  label="Players"
                  value={`${players.toLocaleString()}`}
                  className="flex-1"
                />
                <Count
                  label="Games"
                  value={`${games.toLocaleString()}`}
                  className="flex-1"
                />
              </div>
              <Count
                label="Total Earned"
                value={`$${total.toFixed(2)}`}
                highlight
              />
            </div>
            <div
              className="flex-1 overflow-y-auto rounded-xl"
              style={{ scrollbarWidth: "none" }}
            >
              <ReferralPayments payments={payments.map(toPaymentProps)} />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex md:flex-col md:items-stretch overflow-hidden h-full w-full">
        <Close
          size="lg"
          onClick={onClose}
          className="absolute z-10 top-8 right-8"
        />

        <div className="h-full w-full max-w-[752px] self-center overflow-hidden flex flex-col justify-center gap-6">
          <div className="flex items-center justify-between gap-4">
            <Title />
            <ReferralLink link={link} />
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col gap-6 w-1/2 max-w-1/2">
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <Count
                    label="Players"
                    value={`${players.toLocaleString()}`}
                    className="flex-1"
                  />
                  <Count
                    label="Games"
                    value={`${games.toLocaleString()}`}
                    className="flex-1"
                  />
                </div>
                <Count label="Total Earned" value={`$${total.toFixed(2)}`} />
              </div>
              <Disclaimer />
            </div>

            <div className="flex flex-col gap-6 w-1/2 max-w-1/2">
              <Subtitle />
              <ReferralPayments
                payments={payments.map(toPaymentProps)}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Title = () => (
  <h2
    className="text-[36px]/6 md:text-[64px]/[44px] text-white-100 uppercase tracking-wider translate-y-0.5"
    style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
  >
    Referrals
  </h2>
);

const Subtitle = () => (
  <p className="font-sans text-base/5 text-white-400">
    Invite new players with your referral link and earn a referral fee for each
    NUMS game that they play.
  </p>
);

const Count = ({
  label,
  value,
  highlight = false,
  className,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "rounded-xl p-4 md:py-6 flex flex-col items-center gap-2 md:gap-3 bg-mauve-800 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.04)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
        highlight && "gap-3",
        className,
      )}
    >
      <p className="text-lg/3 tracking-wide translate-y-0.5 text-white-400">
        {label}
      </p>
      <p
        className={cn(
          "text-[36px]/[24px] md:text-[48px]/[33px] tracking-wide translate-y-1 text-white-100 font-thin",
          highlight && "text-[48px]/[33px]",
        )}
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        {value}
      </p>
    </div>
  );
};

const Disclaimer = () => {
  return (
    <div className="flex bg-white-900 rounded-lg p-3 gap-2">
      <div className="flex items-center justify-center min-w-5 h-5 bg-white-900 rounded">
        <AsteriskIcon size="2xs" />
      </div>
      <p className="font-sans text-sm leading-normal text-white-100">
        You can not use your own referral link
      </p>
    </div>
  );
};
