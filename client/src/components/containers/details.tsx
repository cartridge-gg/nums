import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Detail } from "@/components/elements/detail";

export interface DetailsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof detailsVariants> {
  entryFee: string;
  breakEven: string;
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
  entryFee,
  breakEven,
  maxPayout,
  variant,
  className,
  ...props
}: DetailsProps) => {
  return (
    <div className={cn(detailsVariants({ variant, className }))} {...props}>
      {/* Title */}
      <div className="min-h-8 flex items-center">
        <h2
          className="text-[28px]/[19px] md:text-[36px]/[24px] tracking-wider text-white-100 translate-y-0.5"
          style={{
            textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)",
          }}
        >
          Game Details
        </h2>
      </div>

      {/* Details list */}
      <div
        className="flex flex-col gap-3 grow overflow-y-auto"
        style={{ scrollbarWidth: "none" }}
      >
        <Detail title="Entry Fee" content={entryFee} />
        <Detail title="Break Even Score" content={breakEven} />
        <Detail title="Maximum reward" content={maxPayout} />
      </div>
    </div>
  );
};
