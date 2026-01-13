import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { LogoMiniIcon } from "@/components/icons/exotics";
import { useId } from "react";
import SlotCounter from "react-slot-counter";

export interface BalanceProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof balanceVariants> {
  balance: string;
}

const balanceVariants = cva(
  "select-none relative rounded-lg flex items-center justify-center gap-1",
  {
    variants: {
      variant: {
        default: "bg-mauve-700 hover:bg-mauve-500",
      },
      size: {
        md: "h-10 md:h-12 p-2 md:px-4 text-[22px] md:text-[28px] tracking-wide",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export const Balance = ({
  balance,
  variant,
  size,
  className,
  ...props
}: BalanceProps) => {
  const filterId = useId();
  return (
    <Button
      variant="muted"
      className={cn(balanceVariants({ variant, size, className }))}
      {...props}
    >
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="2"
              dy="2"
              stdDeviation="0"
              floodColor="rgba(0, 0, 0, 0.95)"
            />
          </filter>
        </defs>
      </svg>
      <div className="block md:hidden">
        <LogoMiniIcon
          className="min-w-6 min-h-6"
          style={{ filter: `url(#${filterId})` }}
        />
      </div>
      <div
        className="translate-y-0.5 tracking-wider pr-1 md:pr-0 overflow-clip"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 1)" }}
      >
        <SlotCounter
          value={balance}
          startValueOnce
          duration={1.5}
          dummyCharacters={"0123456789".split("")}
          animateOnVisible={false}
          useMonospaceWidth
        />
        <span className="hidden md:inline"> NUMS</span>
      </div>
    </Button>
  );
};
