import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { ShadowEffect, CloseIcon } from "@/components/icons";
import { Purchase, type PurchaseProps } from "@/components/containers/purchase";
import { Details, DetailsProps } from "../containers";
import { useId } from "react";

export interface PurchaseSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof purchaseSceneVariants> {
  detailsProps: DetailsProps;
  purchaseProps: PurchaseProps;
  onClose?: () => void;
  onConnect?: () => void;
  onPurchase?: () => void;
}

const purchaseSceneVariants = cva(
  "select-none flex flex-col md:flex-row gap-6 md:gap-10 p-6 rounded-xl w-full",
  {
    variants: {
      variant: {
        default:
          "bg-black-300 backdrop-blur-[8px] border-[2px] border-black-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const PurchaseScene = ({
  detailsProps,
  purchaseProps,
  onClose,
  onConnect,
  onPurchase,
  variant,
  className,
  ...props
}: PurchaseSceneProps) => {
  const filterId = useId();

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
            {onClose && (
              <div className="flex justify-end flex-shrink-0">
                <Button
                  variant="ghost"
                  className="bg-white-800 h-10 w-10 p-0 text-white-100 hover:text-white-400 hover:bg-white-900 rounded"
                  onClick={onClose}
                >
                  <CloseIcon
                    size="md"
                    style={{ filter: `url(#${filterId})` }}
                  />
                </Button>
              </div>
            )}
          </div>
        </div>
        <div
          className="grow overflow-y-auto flex flex-col gap-6"
          style={{ scrollbarWidth: "none" }}
        >
          <Purchase {...purchaseProps} />
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
        {onClose && (
          <Button
            variant="ghost"
            className="absolute z-10 top-8 right-8 bg-white-800 h-12 w-[56px] p-0 text-white-100 hover:text-white-400 hover:bg-white-900 rounded-lg"
            onClick={onClose}
          >
            <CloseIcon size="lg" style={{ filter: `url(#${filterId})` }} />
          </Button>
        )}
        <div className="h-full w-full max-w-[720px] self-center overflow-hidden flex flex-col justify-center gap-10">
          <Title />
          <div className="flex items-center justify-between gap-8">
            <Purchase {...purchaseProps} className="flex-1 h-full" />
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
