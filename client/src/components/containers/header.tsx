import { Link } from "@/lib/router";
import { LogoIcon } from "@/components/icons/exotics";
import {
  QuestIcon,
  ShadowEffect,
  SparklesIcon,
  TrophyIcon,
} from "@/components/icons";
import {
  SoundControls,
  Balance,
  Profile,
  Connect,
} from "@/components/elements";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { useId } from "react";

export interface HeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof headerVariants> {
  isMainnet: boolean;
  balance?: string;
  onBalance?: () => void;
  username?: string;
  onConnect: () => void;
  onProfile: () => void;
  onQuests?: () => void;
  onLeaderboard?: () => void;
  onMint?: () => void;
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
  isMainnet,
  balance,
  onBalance,
  username,
  onConnect,
  onProfile,
  onQuests,
  onLeaderboard,
  onMint,
  variant,
  className,
  ...props
}: HeaderProps) => {
  const filterId = useId();
  return (
    <div className={cn(headerVariants({ variant, className }))} {...props}>
      <ShadowEffect filterId={filterId} opacity={0.95} />
      <Link
        to="/"
        className="flex items-center justify-start gap-2 cursor-pointer select-none [&_svg]:size-10 md:[&_svg]:size-12"
        draggable={false}
      >
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
      </Link>
      <div className="flex items-center justify-start gap-2 md:gap-4">
        <SoundControls className="z-[60]" />
        {onQuests && (
          <Button
            variant="muted"
            className="h-10 w-10 md:h-12 md:w-14 p-0 bg-mauve-700 hover:bg-mauve-500"
            onClick={onQuests}
          >
            <QuestIcon
              size="md"
              className="md:size-lg"
              style={{ filter: `url(#${filterId})` }}
            />
          </Button>
        )}
        {onLeaderboard && (
          <Button
            variant="muted"
            className="h-10 w-10 md:h-12 md:w-14 p-0 bg-mauve-700 hover:bg-mauve-500"
            onClick={onLeaderboard}
          >
            <TrophyIcon
              variant="solid"
              size="md"
              className="md:size-lg"
              style={{ filter: `url(#${filterId})` }}
            />
          </Button>
        )}
        {onMint && (
          <Button
            variant="muted"
            className="h-10 w-10 md:h-12 md:w-14 p-0 bg-mauve-700 hover:bg-mauve-500"
            onClick={onMint}
          >
            <SparklesIcon
              size="md"
              className="md:size-lg"
              style={{ filter: `url(#${filterId})` }}
            />
          </Button>
        )}
        {username ? (
          <>
            {isMainnet ? (
              <Link
                to="https://app.ekubo.org/starknet/?outputCurrency=NUMS&amount=-2000&inputCurrency=USDC"
                target="_blank"
                draggable={false}
              >
                <Balance balance={balance ?? "0"} />
              </Link>
            ) : (
              balance !== undefined && (
                <Balance
                  balance={balance}
                  onClick={isMainnet ? undefined : onBalance}
                />
              )
            )}
            <Profile username={username} onClick={onProfile} />
          </>
        ) : (
          <Connect onClick={onConnect} />
        )}
      </div>
    </div>
  );
};
