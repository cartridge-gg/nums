import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type * as TabsPrimitive from "@radix-ui/react-tabs";
import { Chart, type ChartProps } from "@/components/elements/chart";
import { AsteriskIcon } from "../icons";

export interface PurchaseProps
  extends Omit<
      React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>,
      "value" | "onValueChange" | "defaultValue"
    >,
    VariantProps<typeof purchaseVariants> {
  chartValues: ChartProps["values"];
  chartAbscissa: ChartProps["abscissa"];
  numsPrice: number; // Price in USD (e.g., 0.003)
}

const purchaseVariants = cva(
  "select-none p-3 md:p-4 flex flex-col gap-4 md:gap-6 w-full",
  {
    variants: {
      variant: {
        default: "bg-white-900 border border-white-900 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const Purchase = ({
  chartValues,
  chartAbscissa,
  numsPrice,
  variant,
  className,
  ...props
}: PurchaseProps) => {
  return (
    <div className={cn(purchaseVariants({ variant, className }))} {...props}>
      <div className="w-full h-[240px] min-h-[240px] pr-2">
        <Chart values={chartValues} abscissa={chartAbscissa} />
      </div>
      <PurchaseInfoBox numsPrice={numsPrice} />
    </div>
  );
};

const PurchaseInfoBox = ({ numsPrice }: { numsPrice: number }) => {
  return (
    <div className="flex bg-white-900 rounded-lg p-3 gap-2">
      <div className="flex items-center justify-center min-w-5 h-5 bg-white-900 rounded">
        <AsteriskIcon size="2xs" />
      </div>
      <div className="flex flex-col gap-2 ">
        <p className="font-sans text-sm leading-normal text-white-100">
          Rewards are denominated in NUMS tokens
        </p>
        <p className="font-sans text-sm leading-normal text-white-100">
          1 NUMS = ${numsPrice.toFixed(5)} USD
        </p>
      </div>
    </div>
  );
};
