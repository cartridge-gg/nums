import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { ShadowEffect } from "@/components/icons";
import { Purchase } from "@/components/containers/purchase";
import { Details, Stakes, type StakesProps } from "../containers";
import { Close } from "@/components/elements";
import { useId, useMemo, useState, useEffect, useRef } from "react";
import { ChartHelper } from "@/helpers/chart";
import { Formatter } from "@/helpers/formatter";
import { DEFAULT_EXPIRATION } from "@/constants";

export interface PurchaseSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof purchaseSceneVariants> {
  slotCount: number;
  basePrice: number;
  playPrice: number;
  numsPrice: number;
  multiplier: number;
  loading?: boolean;
  expiration?: number;
  targetSupply: bigint;
  currentSupply: bigint;
  stakesProps?: StakesProps;
  onClose?: () => void;
  onConnect?: () => void;
  onPurchase?: () => void;
}

const purchaseSceneVariants = cva(
  "select-none flex flex-col md:flex-row gap-6 md:gap-10 p-6",
  {
    variants: {
      variant: {
        default:
          "rounded-t-2xl rounded-b-4xl md:rounded-3xl bg-black-300 backdrop-blur-[8px] border-[2px] border-black-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const PurchaseScene = ({
  slotCount,
  basePrice,
  playPrice,
  numsPrice,
  multiplier,
  loading,
  expiration,
  targetSupply,
  currentSupply,
  stakesProps,
  onClose,
  onConnect,
  onPurchase,
  variant,
  className,
  ...props
}: PurchaseSceneProps) => {
  const filterId = useId();
  const [currentTime, setCurrentTime] = useState(Date.now());
  const lastStableChartRef = useRef<{
    chartValues: number[];
    chartAbscissa: number;
    maxPayoutNums: number;
    maxPayout: number;
  } | null>(null);

  // Calculate chart data — only update when multiplier has loaded (no intermediate change)
  const { chartValues, chartAbscissa, maxPayoutNums, maxPayout } =
    useMemo(() => {
      if (loading && lastStableChartRef.current) {
        return lastStableChartRef.current;
      }
      const result = ChartHelper.calculate({
        slotCount,
        currentSupply,
        targetSupply,
        numsPrice,
        playPrice,
        multiplier,
      });
      if (!loading) lastStableChartRef.current = result;
      return result;
    }, [
      slotCount,
      currentSupply,
      targetSupply,
      numsPrice,
      playPrice,
      multiplier,
      loading,
    ]);

  // Calculate expiration time display
  const expirationDisplay = useMemo(() => {
    if (expiration) {
      // Dynamic timer: calculate remaining time
      const remainingMs = Math.max(0, expiration * 1000 - currentTime);
      return Formatter.countdown(remainingMs, true);
    } else {
      // Static timer based on DEFAULT_EXPIRATION
      return Formatter.countdown(DEFAULT_EXPIRATION * 1000, false);
    }
  }, [expiration, currentTime]);

  // Update timer every second if expiration is provided
  useEffect(() => {
    if (expiration) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [expiration]);

  // Calculate details props
  const detailsProps = useMemo(() => {
    return {
      basePrice: basePrice,
      entryPrice: playPrice,
      multiplier: multiplier,
      breakEven: chartAbscissa.toString(),
      expiration: expirationDisplay,
      maxPayout: `${maxPayoutNums.toFixed(0).toLocaleString()} NUMS ~ $${maxPayout.toFixed(2).toLocaleString()}`,
      loading: loading,
    };
  }, [
    basePrice,
    playPrice,
    multiplier,
    loading,
    chartAbscissa,
    expirationDisplay,
    maxPayoutNums,
    maxPayout,
  ]);

  // Calculate purchase props
  const purchaseProps = useMemo(() => {
    return {
      chartValues,
      chartAbscissa,
      numsPrice,
    };
  }, [chartValues, chartAbscissa, numsPrice]);

  return (
    <div
      className={cn(purchaseSceneVariants({ variant, className }))}
      {...props}
    >
      <ShadowEffect filterId={filterId} />

      {/* Mobile */}
      <div
        className="flex flex-col md:hidden gap-6 w-full h-full pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Mobile header with close button */}
        <div className="flex flex-col w-full items-start gap-4">
          <div className="flex items-center justify-between w-full">
            <Title />
            {onClose && (!!onPurchase || !!onConnect) ? (
              <div className="flex justify-end flex-shrink-0">
                <Close size="md" onClick={onClose} />
              </div>
            ) : (
              <Close size="md" onClick={onClose} />
            )}
          </div>
        </div>
        <div
          className="grow overflow-y-auto flex flex-col gap-6"
          style={{ scrollbarWidth: "none" }}
        >
          <Purchase {...purchaseProps} />
          {stakesProps && onPurchase && <Stakes {...stakesProps} />}
          <Details {...detailsProps} />
        </div>
        {onConnect ? (
          <Button
            variant="default"
            className="w-full min-h-12"
            onClick={onConnect}
          >
            <p
              className="text-[28px]/[15px] tracking-wide translate-y-0.5"
              style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
            >
              Connect
            </p>
          </Button>
        ) : onPurchase ? (
          <Button
            variant="default"
            className="w-full min-h-12"
            onClick={onPurchase}
            disabled={!onPurchase}
          >
            <p
              className="text-[28px]/[15px] tracking-wide translate-y-0.5"
              style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
            >
              Purchase
            </p>
          </Button>
        ) : null}
      </div>

      {/* Desktop */}
      <div className="hidden md:flex md:flex-col md:items-stretch overflow-hidden h-full w-full">
        {/* Close button */}
        {onClose && (!!onPurchase || !!onConnect) ? (
          <Close
            size="lg"
            onClick={onClose}
            className="absolute z-10 top-8 right-8"
          />
        ) : (
          <Close
            size="lg"
            onClick={onClose}
            className="absolute z-10 top-6 right-6"
          />
        )}
        <div className="h-full w-full max-w-[752px] self-center overflow-hidden flex flex-col justify-center gap-10">
          <Title />
          <div className="flex items-stretch justify-between gap-8">
            <div className="flex flex-col gap-4 md:gap-6 flex-1 pt-0.5">
              <Purchase {...purchaseProps} className="flex-1" />
              {stakesProps && onPurchase && <Stakes {...stakesProps} />}
            </div>
            <div className="flex flex-col gap-6 flex-1">
              <Details className="grow overflow-hidden" {...detailsProps} />
              {onConnect ? (
                <Button
                  variant="default"
                  className="w-full min-h-12"
                  onClick={onConnect}
                >
                  <p
                    className="text-[28px]/[15px] tracking-wide translate-y-0.5"
                    style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
                  >
                    Connect
                  </p>
                </Button>
              ) : onPurchase ? (
                <Button
                  variant="default"
                  className="w-full min-h-12"
                  onClick={onPurchase}
                  disabled={!onPurchase}
                >
                  <p
                    className="text-[28px]/[15px] tracking-wide translate-y-0.5"
                    style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
                  >
                    Purchase
                  </p>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Title = () => {
  return (
    <h2
      className="text-[36px]/6 md:text-[64px]/[44px] text-white-100 uppercase tracking-wider translate-y-0.5"
      style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
    >
      Game Details
    </h2>
  );
};
