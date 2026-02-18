import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Detail } from "@/components/elements/detail";

export interface DetailsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof detailsVariants> {
  basePrice: number;
  entryPrice: number;
  multiplier?: number;
  breakEven: string;
  expiration: string;
  maxPayout: string;
}

const detailsVariants = cva("flex flex-col gap-6 grow", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const Details = ({
  basePrice,
  entryPrice,
  multiplier,
  breakEven,
  expiration,
  maxPayout,
  variant,
  className,
  ...props
}: DetailsProps) => {
  const discount = `-${(((basePrice - entryPrice) / basePrice) * 100).toFixed(0)}%`;

  return (
    <div className={cn(detailsVariants({ variant, className }))} {...props}>
      {/* Details list */}
      <div
        className="flex flex-col gap-3 grow overflow-y-auto"
        style={{ scrollbarWidth: "none" }}
      >
        <Detail
          title="Entry Fee"
          content={`$${entryPrice}`}
          discount={discount}
        />
        {multiplier && (
          <Detail
            title="Reward multiplier"
            content={`${multiplier.toFixed(0)}x`}
            count={multiplier}
          />
        )}
        <Detail title="Break Even" content={breakEven} />
        <Detail title="Expire in" content={expiration} />
        <Detail title="Maximum reward" content={maxPayout} />
      </div>
    </div>
  );
};
