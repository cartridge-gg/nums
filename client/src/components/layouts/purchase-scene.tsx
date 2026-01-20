import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/icons/transparents";
import { Purchase, type PurchaseProps } from "@/components/containers/purchase";
import { Games, type GamesProps } from "@/components/containers/games";

export interface PurchaseSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof purchaseSceneVariants> {
  purchaseProps: PurchaseProps;
  gamesProps: GamesProps;
  onClose?: () => void;
}

const purchaseSceneVariants = cva(
  "select-none flex flex-col md:flex-row gap-6 md:gap-10 p-2 xs:p-4 md:p-6 rounded-xl",
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
  purchaseProps,
  gamesProps,
  onClose,
  variant,
  className,
  ...props
}: PurchaseSceneProps) => {
  return (
    <div
      className={cn(purchaseSceneVariants({ variant, className }))}
      {...props}
    >
      {/* Mobile: Games first, then Purchase */}
      <div
        className="flex flex-col md:hidden gap-6 w-full h-full overflow-y-auto pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Mobile header with close button */}
        {onClose && (
          <div className="flex justify-end flex-shrink-0">
            <Button
              variant="ghost"
              className="bg-white-800 h-10 w-10 p-0 text-white-100 hover:text-white-400 hover:bg-white-900 rounded-lg"
              onClick={onClose}
            >
              <CloseIcon size="md" />
            </Button>
          </div>
        )}
        <Games {...gamesProps} className="flex-shrink-0" />
        <Purchase {...purchaseProps} className="flex-shrink-0" />
      </div>

      {/* Desktop: Purchase left, Games right */}
      <div className="hidden md:flex gap-10 overflow-hidden m-auto max-h-[510px]">
        {/* Desktop close button */}
        {onClose && (
          <Button
            variant="ghost"
            className="absolute z-10 top-8 right-8 bg-white-800 h-12 w-[56px] p-0 text-white-100 hover:text-white-400 hover:bg-white-900 rounded-lg"
            onClick={onClose}
          >
            <CloseIcon size="lg" />
          </Button>
        )}
        <Purchase {...purchaseProps} className="w-[420px] self-center" />
        <Games {...gamesProps} className="w-[420px]" />
      </div>
    </div>
  );
};
