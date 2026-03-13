import { useCallback, useId, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { ShadowEffect, CloseIcon, AsteriskIcon } from "@/components/icons";
import { ReferralLink } from "@/components/elements/referral-link";
import { ReferralPayments } from "@/components/containers/referral-payments";
import type { Referral } from "@/hooks/referral";

const referralSceneVariants = cva(
  "select-none flex flex-col md:flex-row gap-6 md:gap-10 p-6",
  {
    variants: {
      variant: {
        default:
          "rounded-t-2xl rounded-b-4xl md:rounded-3xl bg-black-300 backdrop-blur-[8px] border-[2px] border-black-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]",
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
  const [copied, setCopied] = useState(false);

  const { players, games, total } = useMemo(() => {
    const total = payments.reduce((acc, payment) => acc + payment.amount, 0);
    return {
      players: new Set(payments.map((payment) => payment.username)).size,
      games: payments.length,
      total: total,
    };
  }, [payments]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [link]);

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
          <Button
            variant="ghost"
            className="bg-white-800 h-10 w-10 p-0 text-white-100 hover:text-white-400 hover:bg-white-900 rounded"
            onClick={onClose}
          >
            <CloseIcon size="md" style={{ filter: `url(#${filterId})` }} />
          </Button>
        </div>

        <div
          className="grow overflow-y-auto flex flex-col gap-6"
          style={{ scrollbarWidth: "none" }}
        >
          <Subtitle />
          <ReferralLink link={link} />
          <div className="flex flex-col gap-6">
            <div className="flex gap-3">
              <Count label="Players" count={players} className="flex-1" />
              <Count label="Games" count={games} className="flex-1" />
            </div>
            <Total value={total} />
            <ReferralPayments
              payments={payments.map(toPaymentProps)}
              className="max-h-[220px]"
            />
            <Disclaimer />
            <CopyButton copied={copied} onClick={handleCopy} />
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex md:flex-col md:items-stretch overflow-hidden h-full w-full">
        <Button
          variant="ghost"
          className="absolute z-10 top-8 right-8 bg-white-800 h-12 w-[56px] p-0 text-white-100 hover:text-white-400 hover:bg-white-900 rounded-lg"
          onClick={onClose}
        >
          <CloseIcon size="lg" style={{ filter: `url(#${filterId})` }} />
        </Button>

        <div className="h-full w-full max-w-[752px] self-center overflow-hidden flex flex-col justify-center gap-6">
          <div className="flex items-center justify-between gap-4">
            <Title />
            <ReferralLink link={link} />
          </div>

          <div className="flex flex-col md:flex-row gap-8 max-h-[480px]">
            <div className="flex flex-col gap-6 flex-1">
              <Subtitle />
              <div className="flex gap-3">
                <Count label="Players" count={players} className="flex-1" />
                <Count label="Games" count={games} className="flex-1" />
              </div>
              <Total value={total} />
              <Disclaimer />
            </div>

            <div className="flex flex-col gap-6">
              <ReferralPayments
                payments={payments.map(toPaymentProps)}
                className="flex-1"
              />

              <CopyButton copied={copied} onClick={handleCopy} />
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
  count,
  className,
}: {
  label: string;
  count: number;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "rounded-xl px-4 py-6 flex flex-col items-center gap-3 bg-mauve-800 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.04)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
        className,
      )}
    >
      <p className="text-lg/3 tracking-wide translate-y-0.5 text-white-400">
        {label}
      </p>
      <p
        className="text-[48px]/[33px] tracking-wide translate-y-1 text-white-100 font-thin"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        {count.toLocaleString()}
      </p>
    </div>
  );
};

const Total = ({ value, className }: { value: number; className?: string }) => {
  return (
    <div
      className={cn(
        "rounded-xl px-4 py-6 flex flex-col items-center gap-3 bg-mauve-800 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.04)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
        className,
      )}
    >
      <p
        className={cn("text-lg/3 tracking-wide translate-y-0.5 text-green-400")}
      >
        Total Earned
      </p>
      <p
        className={cn(
          "text-[48px]/[33px] tracking-wide translate-y-1 text-green-100 font-thin relative",
          "before:content-['~'] before:absolute before:right-full before:mr-2 before:leading-[inherit] before:text-green-400",
        )}
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        {`$${value.toFixed(2).toLocaleString()}`}
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

const CopyButton = ({
  copied,
  onClick,
}: {
  copied: boolean;
  onClick: () => void;
}) => (
  <Button className="w-full" onClick={onClick}>
    <p
      className="px-1 text-[28px]/[19px] tracking-wide translate-y-0.5"
      style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
    >
      {copied ? "Copied!" : "Copy Referral Link"}
    </p>
  </Button>
);
