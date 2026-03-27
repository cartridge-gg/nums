import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { QuoteIcon } from "@/components/icons/exotics";
import { StakingWarning } from "./staking-warning";

const stakingVaultVariants = cva(
  "select-none flex flex-col gap-4 rounded-xl bg-primary-800 p-6 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.04)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
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

export interface StakingVaultProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stakingVaultVariants> {
  vaultAmount?: number;
  usdcPrice?: number;
}

export const StakingVault = ({
  vaultAmount = 0,
  usdcPrice = 1,
  variant,
  className,
  ...props
}: StakingVaultProps) => {
  const usdValue = vaultAmount * usdcPrice;

  return (
    <div
      className={cn(stakingVaultVariants({ variant, className }))}
      {...props}
    >
      <div className="flex flex-col gap-4">
        <span className="font-sans text-sm/[18px] text-white-400">Vault</span>

        <div className="flex justify-between items-center font-sans text-base/5 text-white-100 gap-4">
          <div className="flex items-center gap-2">
            <QuoteIcon size="sm" />
            <span className="text-white-100 font-primary text-[22px]/[15px] tracking-wider translate-y-px">
              USDC
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>
              {vaultAmount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-white-400">
              $
              {usdValue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>

      <StakingWarning message="30% of each entry fee is contributed to the vault. This balance is locked until the community goal is met." />
    </div>
  );
};
