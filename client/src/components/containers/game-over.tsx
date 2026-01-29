import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { CrownIcon, EyeIcon, RefreshIcon } from "@/components/icons";
import { useId, useState, useEffect } from "react";
import Confetti from "react-confetti";
import { Link } from "react-router-dom";

export interface GameOverProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameOverVariants> {
  payout: number;
  value: number;
  score: number;
  newGameId: number;
  newGameCount: number;
  onSpecate: () => void;
  onPlayAgain: () => void;
  onPurchase: () => void;
}

const gameOverVariants = cva(
  "select-none relative flex flex-col items-center p-6 gap-6 md:gap-16 h-full w-full justify-center",
  {
    variants: {
      variant: {
        default:
          "rounded-3xl bg-black-300 border-2 border-black-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[4px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const GameOver = ({
  payout,
  value,
  score,
  newGameId,
  newGameCount,
  onSpecate,
  onPlayAgain,
  onPurchase,
  variant,
  className,
  ...props
}: GameOverProps) => {
  const filterId = useId();
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    const updateDimensions = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <div className={cn(gameOverVariants({ variant, className }))} {...props}>
      {/* Confetti */}
      {windowDimensions.width > 0 && windowDimensions.height > 0 && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      {/* Filters */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="2"
              dy="2"
              stdDeviation="0"
              floodColor="rgba(0, 0, 0, 0.24)"
            />
          </filter>
        </defs>
      </svg>

      {/* Title */}
      <Header
        filterId={filterId}
        className="absolute top-0 left-1/2 -translate-x-1/2"
      />

      {/* Payout and Score */}
      <div className="w-full grow md:grow-0 flex flex-col justify-center items-center gap-10 md:gap-6">
        <Payout payout={payout} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-6">
          <Value value={value} className="flex md:hidden" />
          <Score score={score} />
          <Value value={value} className="hidden md:flex px-10" />
        </div>
      </div>

      {/* Home Button */}
      <div className="w-full md:w-auto flex flex-col md:flex-row gap-4 md:gap-8 items-stretch md:items-center">
        <Specate filterId={filterId} onClick={onSpecate} />
        <Replay filterId={filterId} gameId={newGameId} count={newGameCount} />
      </div>
    </div>
  );
};

const Header = ({
  filterId,
  className,
}: {
  filterId: string;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "h-12 md:h-[88px] flex items-center justify-between gap-2 md:gap-2.5 px-5 md:px-8 bg-mauve-700 rounded-b-[20px] md:rounded-b-[32px] text-mauve-100",
        className,
      )}
    >
      <strong
        className="text-[36px]/[24px] md:text-[64px]/[44px] tracking-wide uppercase translate-y-0.5 md:translate-y-1 font-thin"
        style={{ textShadow: "4px 4px 0px rgba(0, 0, 0, 0.25)" }}
      >
        Game
      </strong>
      <CrownIcon
        className="text-mauve-500"
        size="lg"
        style={{ filter: `url(#${filterId})` }}
      />
      <strong
        className="text-[36px]/[24px] md:text-[64px]/[44px] tracking-wide uppercase translate-y-0.5 md:translate-y-1 font-thin"
        style={{ textShadow: "4px 4px 0px rgba(0, 0, 0, 0.25)" }}
      >
        Over
      </strong>
    </div>
  );
};

const Payout = ({
  payout,
  className,
}: {
  payout: number;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <p
        className="text-[28px]/[19px] tracking-wide translate-y-0.5 text-yellow-400"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        Payout
      </p>
      <p
        className="text-[64px]/[44px] md:text-[136px]/[92px] text-center tracking-wide translate-y-1 md:translate-y-2 text-yellow-100 font-thin"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        <span className="hidden md:inline">{`${payout.toLocaleString()} NUMS`}</span>
        <span className="block md:hidden">{`${payout.toLocaleString()}`}</span>
        <span className="text-[36px]/[24px] text-center tracking-wide translate-y-0.5 block md:hidden">
          NUMS
        </span>
      </p>
    </div>
  );
};

const Score = ({ score, className }: { score: number; className?: string }) => {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <p
        className="text-[28px]/[19px] tracking-wide translate-y-0.5 text-mauve-400"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        Score
      </p>
      <p
        className="text-[64px]/[44px] md:text-[96px]/[65px] tracking-wide translate-y-1 md:translate-y-2 text-mauve-100 font-thin"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        {score.toLocaleString()}
      </p>
    </div>
  );
};

const Value = ({ value, className }: { value: number; className?: string }) => {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <p
        className="text-[28px]/[19px] tracking-wide translate-y-0.5 text-green-400"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        USD Value
      </p>
      <p
        className="text-[64px]/[44px] md:text-[96px]/[65px] tracking-wide translate-y-1 md:translate-y-2 text-green-100 font-thin relative before:content-['~'] before:absolute before:right-full before:mr-2 before:leading-[inherit] before:text-green-400"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        {`$${value.toFixed(2)}`}
      </p>
    </div>
  );
};

export const Specate = ({
  filterId,
  onClick,
  className,
}: {
  filterId: string;
  onClick: () => void;
  className?: string;
}) => {
  return (
    <Button
      variant="secondary"
      className={cn("h-12 gap-1", className)}
      onClick={onClick}
    >
      <EyeIcon size="lg" style={{ filter: `url(#${filterId})` }} />
      <p
        className="px-1 text-[28px]/[19px] tracking-wide translate-y-0.5"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        Specate
      </p>
    </Button>
  );
};

export const Replay = ({
  filterId,
  gameId,
  count,
  className,
}: {
  filterId: string;
  gameId: number;
  count: number;
  className?: string;
}) => {
  return (
    <Button
      variant="secondary"
      className={cn("h-12 gap-1", className)}
      disabled={count === 0}
    >
      <Link
        to={`/game?id=${gameId}`}
        className="w-full h-full flex items-center justify-center"
      >
        <RefreshIcon size="lg" style={{ filter: `url(#${filterId})` }} />
        <p
          className="px-1 text-[28px]/[19px] tracking-wide translate-y-0.5"
          style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
        >
          Play Again
        </p>
        <p className="ml-2 px-3 h-8 rounded-full bg-black-700 flex items-center justify-center">
          <span
            className="text-[28px]/[19px] tracking-wide translate-y-0.5"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            {count}
          </span>
        </p>
      </Link>
    </Button>
  );
};
