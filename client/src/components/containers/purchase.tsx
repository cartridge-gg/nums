import { useState } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Tabs, TabsList, TabsContent } from "@/components/ui/tabs";
import type * as TabsPrimitive from "@radix-ui/react-tabs";
import { Button } from "@/components/ui/button";
import { Tab } from "@/components/elements";
import { Chart, type ChartProps } from "@/components/elements/chart";

export interface PurchaseProps
  extends Omit<
      React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>,
      "value" | "onValueChange" | "defaultValue"
    >,
    VariantProps<typeof purchaseVariants> {
  chartValues: ChartProps["values"];
  chartAbscissa: ChartProps["abscissa"];
  numsPrice: number; // Price in USD (e.g., 0.003)
  playPrice: number; // Price in USD (e.g., 1.00)
  onPurchase: () => void;
}

const purchaseVariants = cva(
  "select-none p-4 md:p-6 flex flex-col gap-4 md:gap-6 w-full",
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
  playPrice,
  onPurchase,
  variant,
  className,
  ...props
}: PurchaseProps) => {
  const [activeTab, setActiveTab] = useState<string>("blitz");

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className={cn(purchaseVariants({ variant, className }))}
      {...props}
    >
      {/* Tabs */}
      <TabsList className="w-full gap-4 bg-transparent p-0 h-auto">
        <Tab
          value="free"
          label="Free"
          variant="mauve"
          className="flex-1 cursor-not-allowed"
          disabled
        />
        <Tab value="blitz" label="Blitz" variant="mauve" className="flex-1" />
      </TabsList>

      {/* Free tab content (empty for now) */}
      <TabsContent value="free" className="mt-0">
        {/* Empty content */}
      </TabsContent>

      {/* Blitz tab content */}
      <TabsContent value="blitz" className="mt-0 flex flex-col gap-4 md:gap-6">
        {/* Chart and Info box */}
        <div className="flex flex-col gap-4">
          <div className="w-full h-[240px] min-h-[240px]">
            <Chart values={chartValues} abscissa={chartAbscissa} />
          </div>
          <PurchaseInfoBox numsPrice={numsPrice} />
        </div>

        {/* Play button */}
        <Button variant="default" className="w-full" onClick={onPurchase}>
          <p
            className="text-[28px]/[15px] tracking-wide translate-y-0.5"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
          >
            Play - ${playPrice.toFixed(2)}
          </p>
        </Button>
      </TabsContent>
    </Tabs>
  );
};

const PurchaseInfoBox = ({ numsPrice }: { numsPrice: number }) => {
  return (
    <div
      className="flex flex-col gap-2 rounded-lg p-3"
      style={{
        background: "rgba(0, 0, 0, 0.04)",
        border: "1px solid rgba(255, 255, 255, 0.04)",
      }}
    >
      <p className="font-sans text-sm leading-normal text-white-100">
        Rewards are denominated in NUMS tokens
      </p>
      <p className="font-sans text-sm leading-normal text-white-100">
        1 NUMS = ${numsPrice.toFixed(5)} USD
      </p>
    </div>
  );
};
