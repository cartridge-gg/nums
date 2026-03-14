import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Discount } from "@/components/elements";
import { SpinnerIcon } from "../icons";

export interface DetailProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof detailVariants> {
  title: string;
  previous?: string;
  content: string;
  count?: number;
  discount?: string;
  loading?: boolean;
}

const detailVariants = cva(
  "relative px-4 py-3 gap-2 flex flex-col rounded-lg",
  {
    variants: {
      variant: {
        default:
          "h-16 bg-white-900 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.12)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const Detail = ({
  title,
  previous,
  content,
  discount,
  loading,
  count = 0,
  variant,
  className,
  ...props
}: DetailProps) => {
  return (
    <div className={cn(detailVariants({ variant, className }))} {...props}>
      <h3
        className="text-mauve-100 text-[18px]/[12px] tracking-wider"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
      >
        {title}
      </h3>
      <div className="flex items-center justify-between">
        {loading ? (
          <SpinnerIcon
            size="sm"
            className="animate-spin text-white-400 shrink-0"
          />
        ) : (
          <p className="font-sans text-white-100 text-base/5">
            {previous ? <span className="text-white-400 line-through mr-2">{previous}</span> : null}
            {content}
          </p>
        )}
      </div>
      {discount && (
        <Discount label={discount} className="absolute top-[-2px] right-3" />
      )}
    </div>
  );
};
