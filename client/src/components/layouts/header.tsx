import { Link } from "react-router-dom";
import { LogoIcon } from "@/components/icons/exotics";
import { Sound, Balance, Profile, Connect } from "@/components/elements";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

export interface HeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof headerVariants> {
  isMainnet: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  balance?: string;
  onBalance?: () => void;
  username?: string;
  onConnect: () => void;
  onProfile: () => void;
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
  isMuted,
  onToggleMute,
  balance,
  onBalance,
  username,
  onConnect,
  onProfile,
  variant,
  className,
  ...props
}: HeaderProps) => {
  return (
    <div className={cn(headerVariants({ variant, className }))} {...props}>
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
        <Sound isMuted={isMuted} onClick={onToggleMute} />
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
