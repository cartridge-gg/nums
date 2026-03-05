import { useState } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { TokenIcon, VTokenIcon } from "@/components/icons/exotics";
import { SpinnerIcon } from "@/components/icons";

export interface StakingAmountProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stakingAmountVariants> {
  /** Available balance */
  balance?: number;
  /** Price per token in USD */
  numsPrice?: number;
  /** Controlled value */
  value?: number;
  /** Callback when value changes */
  onValueChange?: (value: number) => void;
  /** Shows a loading spinner in place of the input value */
  loading?: boolean;
}

const stakingAmountVariants = cva(
  "select-none flex flex-col gap-2 rounded-lg p-4 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.04)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
  {
    variants: {
      variant: {
        default: "bg-mauve-800",
      },
      action: {
        stake: "text-[#D69CF4]",
        unstake: "text-[#FFDE66]",
      },
    },
    defaultVariants: {
      variant: "default",
      action: "stake",
    },
  },
);

export const StakingAmount = ({
  balance,
  numsPrice,
  value,
  onValueChange,
  loading = false,
  action,
  variant,
  className,
  ...props
}: StakingAmountProps) => {
  const [internalValue, setInternalValue] = useState<string>("");

  const displayValue =
    value !== undefined ? (value === 0 ? "" : String(value)) : internalValue;
  const numericValue = parseFloat(displayValue) || 0;
  const usdValue = numsPrice ? numericValue * numsPrice : undefined;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      setInternalValue("");
      onValueChange?.(0);
    } else if (/^\d*\.?\d*$/.test(raw)) {
      setInternalValue(raw);
      onValueChange?.(parseFloat(raw) || 0);
    }
  };

  const handleUseMax = () => {
    if (!balance) return;
    const str = String(balance);
    setInternalValue(str);
    onValueChange?.(balance);
  };

  const Icon = action === "unstake" ? VTokenIcon : TokenIcon;

  const isDisabled = !onValueChange;

  return (
    <div
      className={cn(stakingAmountVariants({ variant, action, className }))}
      {...props}
    >
      {/* Input row */}
      <div className="flex justify-between items-center border border-mauve-100 rounded-lg px-3 py-2.5 gap-3">
        {/* Left: numeric input or spinner */}
        {loading ? (
          <SpinnerIcon
            size="sm"
            className="animate-spin text-white-400 shrink-0"
          />
        ) : (
          <input
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={handleChange}
            placeholder="0.00"
            disabled={isDisabled}
            className="font-sans bg-transparent text-left text-white-100 placeholder:text-white-400 text-base/5 outline-none w-full min-w-0 disabled:cursor-default"
          />
        )}
        {/* Right: Icon + label */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Icon size="sm" />
          <span className="font-primary text-[22px]/[15px] tracking-wider translate-y-px">
            {action === "stake" ? "NUMS" : "vNUMS"}
          </span>
        </div>
      </div>

      {/* Info row */}
      <div
        className={cn(
          "flex justify-between items-center font-sans text-base/5 text-white-100 px-2 py-px",
          balance === undefined && "hidden",
        )}
      >
        {/* Left: USD value */}
        <span>
          {usdValue !== undefined
            ? `$${usdValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : ""}
        </span>
        {/* Right: Available label + balance clickable */}
        <button
          type="button"
          onClick={handleUseMax}
          disabled={isDisabled}
          className="group flex items-center gap-2.5 disabled:cursor-default"
        >
          <span className="text-white-400 text-base/5">Available:</span>
          <span className="group-enabled:group-hover:text-white-200 transition-colors">
            {balance &&
              balance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
          </span>
        </button>
      </div>
    </div>
  );
};
