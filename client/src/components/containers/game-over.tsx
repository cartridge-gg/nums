import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { Stat, type StatProps } from "@/components/elements";
import { HomeIcon } from "@/components/icons";
import { useId } from "react";

export interface GameOverProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameOverVariants> {
  stats: StatProps[];
}

const gameOverVariants = cva(
  "select-none relative flex flex-col items-center gap-6 p-6 md:gap-12 md:p-12 h-full w-full md:justify-center",
  {
    variants: {
      variant: {
        default:
          "rounded-lg bg-black-300 border-2 border-black-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[4px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const GameOver = ({
  stats,
  variant,
  className,
  ...props
}: GameOverProps) => {
  const filterId = useId();
  const navigate = useNavigate();

  return (
    <div className={cn(gameOverVariants({ variant, className }))} {...props}>
      {/* Title */}
      <h2
        className="font-primary text-[64px]/[44px] md:text-[136px]/[92px] tracking-wider uppercase translate-y-1"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        Game Over!
      </h2>

      {/* Stats */}
      <div className="flex-1 md:flex-none w-full flex flex-col items-center gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <Stat key={index} {...stat} className="w-full md:max-w-[320px]" />
        ))}
      </div>

      {/* Home Button */}
      <Button
        variant="secondary"
        className="w-full md:w-auto gap-1 h-[52px]"
        onClick={() => navigate("/")}
      >
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
        <HomeIcon
          variant="solid"
          size="lg"
          style={{ filter: `url(#${filterId})` }}
        />
        <p
          className="text-[28px]/[15px] tracking-wide px-1 translate-y-0.5"
          style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
        >
          Home
        </p>
      </Button>
    </div>
  );
};
