import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";

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

const formatMobileBalance = (balance: string): string => {
  const num = parseFloat(balance);

  if (isNaN(num) || num < 0) {
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
    const num = parseFloat(balance);
    if (isNaN(num)) return "0";
    return num.toLocaleString();
  }, [balance]);

  const formattedMobile = useMemo(() => {
    return formatMobileBalance(balance);
  }, [balance]);

  return (
    <Button
      variant="muted"
      className={cn(balanceVariants({ variant, size, className }))}
      {...props}
    >
      <div
        className="translate-y-0.5 tracking-wider overflow-clip"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 1)" }}
      >
        <span className="block md:hidden px-1">{formattedMobile}</span>
        <span className="hidden md:inline">{formattedDesktop} NUMS</span>
      </div>
    </Button>
  );
};
