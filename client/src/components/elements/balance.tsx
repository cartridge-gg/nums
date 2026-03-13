import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { useId, useMemo } from "react";
import { ShadowEffect, TokenIcon } from "@/components/icons";

export interface BalanceProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof balanceVariants> {
  balance: number;
}

const balanceVariants = cva(
  "select-none relative rounded-lg flex items-center justify-center gap-2",
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

const formatMobileBalance = (num: number): string => {
  if (Number.isNaN(num) || num < 0) {
    return "0";
  }

  if (num >= 1000000000) {
    // Billions - try to keep 3 characters
    const billions = num / 1000000000;
    if (billions >= 100) {
      return `${Math.floor(billions)}B`;
    }
    if (billions >= 10) {
      return `${billions.toFixed(1).replace(/\.0$/, "")}B`;
    }
    return `${billions.toFixed(1)}B`;
  }

  if (num >= 1000000) {
    // Millions - try to keep 3 characters
    const millions = num / 1000000;
    if (millions >= 100) {
      return `${Math.floor(millions)}M`;
    }
    if (millions >= 10) {
      return `${millions.toFixed(1).replace(/\.0$/, "")}M`;
    }
    return `${millions.toFixed(1)}M`;
  }

  if (num >= 1000) {
    // Thousands - try to keep 3 characters
    const thousands = num / 1000;
    if (thousands >= 100) {
      return `${Math.floor(thousands)}K`;
    }
    if (thousands >= 10) {
      return `${thousands.toFixed(1).replace(/\.0$/, "")}K`;
    }
    return `${thousands.toFixed(1)}K`;
  }

  // For numbers < 1000, return as integer (max 3 digits)
  return Math.floor(num).toString();
};

export const Balance = ({
  balance,
  variant,
  size,
  className,
  ...props
}: BalanceProps) => {
  const formattedDesktop = useMemo(() => {
    if (Number.isNaN(balance)) return "0";
    return balance.toLocaleString("en-US", {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });
  }, [balance]);

  const formattedMobile = useMemo(() => {
    return formatMobileBalance(balance);
  }, [balance]);

  const filterId = useId();

  return (
    <Button
      variant="muted"
      className={cn(balanceVariants({ variant, size, className }))}
      {...props}
    >
      <ShadowEffect filterId={filterId} opacity={1} />
      <TokenIcon
        size="sm"
        className="block md:hidden"
        style={{ filter: `url(#${filterId})` }}
      />
      <TokenIcon
        size="md"
        className="hidden md:block"
        style={{ filter: `url(#${filterId})` }}
      />
      <div
        className="translate-y-0.5 tracking-wider overflow-clip px-0.5"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 1)" }}
      >
        <span className="block md:hidden px-1">{formattedMobile}</span>
        <span className="hidden md:inline">{formattedDesktop}</span>
      </div>
    </Button>
  );
};
