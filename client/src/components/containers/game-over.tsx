import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import {
  AddIcon,
  CrownIcon,
  EyeIcon,
  RefreshIcon,
  ShadowEffect,
} from "@/components/icons";
import { useId, useState, useEffect, useMemo, useRef } from "react";
import { useAudio } from "@/context/audio";
import Confetti from "react-confetti";
import { Link } from "react-router-dom";
import { Stages, type StagesProps } from "@/components/containers";

export interface GameOverProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameOverVariants> {
  stages: StagesProps;
  payout: number;
  value: number;
  score: number;
  newGameId: number;
  newGameCount: number;
  onClaim?: null | (() => void);
  onSpecate: () => void;
  onPurchase: () => void;
  onPlayAgain?: () => void; // For practice mode
}

const gameOverVariants = cva(
  "select-none relative flex flex-col items-center p-6 pt-0 gap-6 h-full w-full justify-between",
  {
    variants: {
      variant: {
        default:
          "rounded-t-2xl rounded-b-4xl md:rounded-3xl bg-black-300 border-2 border-black-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[4px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const GameOver = ({
  stages,
  payout,
  value,
  score,
  newGameId,
  newGameCount,
  onClaim,
  onSpecate,
  onPurchase,
  onPlayAgain,
  variant,
  className,
  ...props
}: GameOverProps) => {
  const filterId = useId();
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  const isPractice = useMemo(() => {
    return onClaim === null;
  }, [onClaim]);

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
      <ShadowEffect filterId={filterId} />

      {/* Title */}
      <Header filterId={filterId} />

      <div className="h-full md:h-auto w-full flex flex-col gap-6 justify-between md:justify-center items-stretch md:max-w-[416px] flex-1">
        <div className="w-full flex flex-col gap-4 justify-center items-stretch flex-1 md:flex-none">
          {/* Score */}
          <Score score={score} className="rounded-xl" />

          {/* Stages */}
          <Stages className="w-full" states={stages.states} variant="over" />

          {/* Payout and Score */}
          <div
            className={cn(
              "w-full flex flex-col items-stretch gap-px",
              isPractice && "hidden",
            )}
          >
            <Payout payout={payout} className="rounded-t-xl" />
            <Value value={value} />
            <Claim onClaim={onClaim} className="rounded-b-xl" />
          </div>
          <PayoutInfo
            payout={payout}
            className={cn("rounded-xl hidden", isPractice && "flex")}
          />
          <Disclaimer
            className={cn("rounded-xl hidden", isPractice && "flex")}
          />
        </div>

        {/* Buttons */}
        <div className="w-full flex gap-4">
          <Specate filterId={filterId} onClick={onSpecate} className="flex-0" />
          {onPlayAgain ? (
            <PlayAgain
              filterId={filterId}
              onClick={onPlayAgain}
              className="flex-1"
              variant={!onClaim ? "default" : "secondary"}
            />
          ) : newGameCount > 0 ? (
            <Replay
              filterId={filterId}
              gameId={newGameId}
              count={newGameCount}
              className="flex-1"
              variant={!onClaim ? "default" : "secondary"}
            />
          ) : (
            <NewGame
              filterId={filterId}
              onClick={onPurchase}
              className="flex-1"
              variant={!onClaim ? "default" : "secondary"}
            />
          )}
        </div>
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
    <div
      className={cn(
        "px-4 py-6 flex flex-col items-center gap-3 bg-mauve-800 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.04)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
        className,
      )}
    >
      <p
        className={cn(
          "text-lg/3 tracking-wide translate-y-0.5 text-yellow-400",
        )}
      >
        Payout
      </p>
      <p
        className="text-[48px]/[33px] tracking-wide translate-y-1 text-yellow-100 font-thin"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        {`${payout.toLocaleString()} NUMS`}
      </p>
    </div>
  );
};

const Disclaimer = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "px-12 py-3 flex flex-col items-center gap-3 bg-mauve-800 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.04)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
        className,
      )}
    >
      <p className="text-sm font-sans text-center text-mauve-200">
        Play blitz mode to be eligible for real money rewards
      </p>
    </div>
  );
};

const PayoutInfo = ({
  payout,
  className,
}: {
  payout: number;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "px-4 py-3 flex flex-col items-center gap-3 bg-mauve-800 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.04)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
        className,
      )}
    >
      <p className="text-sm font-sans text-center">
        <span className="text-yellow-400">You would have earned </span>
        <span className="text-yellow-100">{payout.toLocaleString()} Nums</span>
      </p>
    </div>
  );
};

const Score = ({ score, className }: { score: number; className?: string }) => {
  return (
    <div
      className={cn(
        "px-4 py-6 flex flex-col items-center gap-3 bg-mauve-800 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.04)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
        className,
      )}
    >
      <p className="text-[22px]/[15px] tracking-wide translate-y-0.5 text-white-400">
        Score
      </p>
      <p
        className="text-[64px]/[44px] tracking-wide translate-y-1 text-white-100 font-thin"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        {score.toLocaleString()}
      </p>
    </div>
  );
};

const Value = ({ value, className }: { value: number; className?: string }) => {
  return (
    <div
      className={cn(
        "px-4 py-6 flex flex-col items-center gap-3 bg-mauve-800 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.04)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
        className,
      )}
    >
      <p
        className={cn("text-lg/3 tracking-wide translate-y-0.5 text-green-400")}
      >
        Value
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

const Claim = ({
  onClaim,
  className,
}: {
  onClaim?: null | (() => void);
  className?: string;
}) => {
  const { playPositive } = useAudio();
  const prevOnClaimRef = useRef(onClaim);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!!prevOnClaimRef.current && !onClaim) {
      playPositive();
      setLoading(false);
    }
    prevOnClaimRef.current = onClaim;
  }, [onClaim, playPositive]);

  const handleClaim = () => {
    if (loading || !onClaim) return;
    setLoading(true);
    onClaim();
  };

  return (
    <div
      className={cn(
        "p-4 flex flex-col items-center gap-3 bg-mauve-800 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.04)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
        className,
      )}
    >
      {!onClaim ? (
        <div className="w-full h-10 flex items-center justify-center bg-black-700 rounded-lg">
          <p
            className="text-[22px]/[15px] tracking-wide translate-y-0.5 text-white-100"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            Claimed
          </p>
        </div>
      ) : (
        <Button
          variant="default"
          className="w-full"
          onClick={handleClaim}
          loading={loading}
          disabled={loading}
        >
          <p
            className="px-1 text-[28px]/[19px] tracking-wide translate-y-0.5"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            Claim Reward
          </p>
        </Button>
      )}
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
      className={cn("h-12 px-2.5", className)}
      onClick={onClick}
    >
      <EyeIcon size="lg" style={{ filter: `url(#${filterId})` }} />
    </Button>
  );
};

export const Replay = ({
  filterId,
  gameId,
  count,
  variant,
  className,
}: {
  filterId: string;
  gameId: number;
  count: number;
  variant?: "default" | "secondary";
  className?: string;
}) => {
  return (
    <Button
      variant={variant}
      className={cn("h-12 gap-1", className)}
      disabled={count === 0}
    >
      <Link
        to={`/game/${gameId}`}
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

export const NewGame = ({
  filterId,
  onClick,
  variant,
  className,
}: {
  filterId: string;
  onClick: () => void;
  variant?: "default" | "secondary";
  className?: string;
}) => {
  return (
    <Button
      variant={variant}
      className={cn("h-12 gap-1", className)}
      onClick={onClick}
    >
      <AddIcon size="lg" style={{ filter: `url(#${filterId})` }} />
      <p
        className="px-1 text-[28px]/[19px] tracking-wide translate-y-0.5"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        New Game
      </p>
    </Button>
  );
};

export const PlayAgain = ({
  filterId,
  onClick,
  variant,
  className,
}: {
  filterId: string;
  onClick: () => void;
  variant?: "default" | "secondary";
  className?: string;
}) => {
  return (
    <Button
      variant={variant}
      className={cn("h-12 gap-1", className)}
      onClick={onClick}
    >
      <RefreshIcon size="lg" style={{ filter: `url(#${filterId})` }} />
      <p
        className="px-1 text-[28px]/[19px] tracking-wide translate-y-0.5"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        Play Again
      </p>
    </Button>
  );
};
