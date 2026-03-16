import { Link } from "@/lib/router";
import { LogoIcon, QuoteIcon } from "@/components/icons/exotics";
import { GearIcon, ShadowEffect } from "@/components/icons";
import { Balance, Profile, Connect } from "@/components/elements";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { useId } from "react";

export interface HeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof headerVariants> {
  balance?: number;
  onBalance?: () => void;
  username?: string;
  onConnect: () => void;
  onProfile: () => void;
  onSettings?: () => void;
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
  balance,
  onBalance,
  username,
  onConnect,
  onProfile,
  onSettings,
  onMint,
  variant,
  className,
  ...props
}: HeaderProps) => {
  const darkId = useId();
  const lightId = useId();
  return (
    <div className={cn(headerVariants({ variant, className }))} {...props}>
      <ShadowEffect filterId={darkId} opacity={0.95} />
      <ShadowEffect filterId={lightId} />
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
        {onMint && (
          <Button
            variant="muted"
            className="h-10 w-10 md:h-12 md:w-14 p-0 bg-mauve-700 hover:bg-mauve-500"
            onClick={onMint}
          >
            <QuoteIcon
              size="md"
              className="md:size-lg"
              style={{ filter: `url(#${darkId})` }}
            />
          </Button>
        )}
        {username ? (
          <>
            {balance !== undefined && (
              <Balance balance={balance} onClick={onBalance} />
            )}
            {onSettings && (
              <Button
                variant="muted"
                className="h-10 w-10 md:h-12 md:w-14 p-0 bg-mauve-700 hover:bg-mauve-500"
                onClick={onSettings}
              >
                <GearIcon
                  size="md"
                  className="md:size-lg"
                  style={{ filter: `url(#${lightId})` }}
                />
              </Button>
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
