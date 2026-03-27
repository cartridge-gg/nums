import { Link } from "@/lib/router";
import { LogoIcon, QuoteIcon } from "@/components/icons/exotics";
import {
  ListIcon,
  GiftIcon,
  ShadowEffect,
  TrophyIcon,
  QuestIcon,
  LaurelIcon,
} from "@/components/icons";
import { Balance, Connect, NotificationPing } from "@/components/elements";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useId, useRef, useState } from "react";

export interface HeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof headerVariants> {
  balance?: number;
  faucetBalance?: number;
  onBalance?: () => void;
  onFaucet?: () => void;
  username?: string;
  onConnect: () => void;
  onQuests?: () => void;
  onAchievements?: () => void;
  onLeaderboard?: () => void;
  onSettings?: () => void;
  hasQuestNotification?: boolean;
  hasAchievementNotification?: boolean;
  hasSettingsNotification?: boolean;
  hasMerkledrop?: boolean;
  onMerkledrop?: () => void;
}

const headerVariants = cva(
  "w-full min-h-16 md:min-h-24 max-h-24 px-3 md:px-8 flex items-center justify-between border-b border-[rgba(0,0,0,0.24)] bg-[linear-gradient(0deg,rgba(0,0,0,0.24)_0%,rgba(0,0,0,0.16)_100%)]",
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

export const Header = ({
  balance,
  onBalance,
  username,
  onConnect,
  onQuests,
  onAchievements,
  onLeaderboard,
  onSettings,
  hasQuestNotification,
  hasAchievementNotification,
  hasSettingsNotification,
  faucetBalance,
  onFaucet,
  hasMerkledrop,
  onMerkledrop,
  variant,
  className,
  ...props
}: HeaderProps) => {
  const darkId = useId();
  const lightId = useId();

  const [faucetLoading, setFaucetLoading] = useState(false);
  const prevFaucetBalance = useRef(faucetBalance);

  useEffect(() => {
    if (faucetLoading && faucetBalance !== prevFaucetBalance.current) {
      setFaucetLoading(false);
    }
    prevFaucetBalance.current = faucetBalance;
  }, [faucetBalance, faucetLoading]);

  const handleFaucet = useCallback(() => {
    setFaucetLoading(true);
    onFaucet?.();
  }, [onFaucet]);

  return (
    <div className={cn(headerVariants({ variant, className }))} {...props}>
      <ShadowEffect filterId={darkId} opacity={0.95} />
      <ShadowEffect filterId={lightId} />
      <Link
        to="/"
        className="flex items-center justify-start gap-2 cursor-pointer select-none [&_svg]:size-10 md:[&_svg]:size-12"
        draggable={false}
      >
        <Button variant="ghost" className="p-0">
          <LogoIcon
            className="drop-shadow-[2px_2px_0px_rgba(0,0,0,0.25)] text-white"
            aria-hidden="true"
          />
          <h1
            className="text-[64px] leading-[48px] uppercase text-white translate-y-1 hidden md:block"
            style={{ textShadow: "3px 3px 0px rgba(0, 0, 0, 0.25)" }}
          >
            NUMS.GG
          </h1>
        </Button>
      </Link>
      <div className="flex items-center justify-start gap-2 md:gap-4">
        {hasMerkledrop && onMerkledrop && (
          <Button
            variant="muted"
            className="relative h-10 w-10 md:h-12 md:w-14 p-0 bg-green-700 hover:bg-green-500"
            onClick={onMerkledrop}
          >
            <GiftIcon
              size="md"
              className="md:size-lg text-green-100"
              style={{ filter: `url(#${lightId})` }}
            />
            <NotificationPing />
          </Button>
        )}
        {onLeaderboard && (
          <Button
            variant="muted"
            className="h-10 w-10 md:h-12 md:w-14 p-0 bg-primary-700 hover:bg-primary-500"
            onClick={onLeaderboard}
          >
            <TrophyIcon
              variant="solid"
              size="md"
              className="md:size-lg"
              style={{ filter: `url(#${lightId})` }}
            />
          </Button>
        )}
        {onQuests && (
          <Button
            variant="muted"
            className="relative h-10 w-10 md:h-12 md:w-14 p-0 bg-primary-700 hover:bg-primary-500 hidden md:flex"
            onClick={onQuests}
          >
            <QuestIcon
              size="md"
              className="md:size-lg"
              style={{ filter: `url(#${lightId})` }}
            />
            {hasQuestNotification && <NotificationPing />}
          </Button>
        )}
        {onAchievements && (
          <Button
            variant="muted"
            className="relative h-10 w-10 md:h-12 md:w-14 p-0 bg-primary-700 hover:bg-primary-500 hidden md:flex"
            onClick={onAchievements}
          >
            <LaurelIcon
              size="md"
              className="md:size-lg"
              style={{ filter: `url(#${lightId})` }}
            />
            {hasAchievementNotification && <NotificationPing />}
          </Button>
        )}
        {username && (
          <>
            {faucetBalance !== undefined && (
              <Balance
                balance={faucetBalance}
                loading={faucetLoading}
                onClick={handleFaucet}
                icon={
                  <>
                    <QuoteIcon
                      size="sm"
                      className="block md:hidden"
                      style={{ filter: `url(#${darkId})` }}
                    />
                    <QuoteIcon
                      size="md"
                      className="hidden md:block"
                      style={{ filter: `url(#${darkId})` }}
                    />
                  </>
                }
              />
            )}
            {balance !== undefined && (
              <Balance balance={balance} onClick={onBalance} />
            )}
          </>
        )}
        {onSettings && (
          <Button
            variant="muted"
            className="relative h-10 w-10 md:h-12 md:w-14 p-0 bg-primary-700 hover:bg-primary-500"
            onClick={onSettings}
          >
            <ListIcon
              size="md"
              className="md:size-lg"
              style={{ filter: `url(#${lightId})` }}
            />
            {hasSettingsNotification && <NotificationPing />}
          </Button>
        )}
        {!username && <Connect onClick={onConnect} />}
      </div>
    </div>
  );
};
