import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Discount } from "@/components/elements";

export interface DetailProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof detailVariants> {
  title: string;
  content: string;
  count?: number;
  discount?: string;
}

const detailVariants = cva(
  "relative px-4 py-3 gap-2 flex flex-col rounded-lg",
  {
    variants: {
      variant: {
        default:
          "bg-white-900 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.12)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const Detail = ({
  title,
  content,
  discount,
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
        <p className="font-sans text-white-100 text-base/5">{content}</p>
        <div className="flex items-center gap-1">
          {count > 0 &&
            Array.from({ length: count }).map((_, index) => (
              <span key={index}>🔥</span>
            ))}
        </div>
      </div>
      {discount && (
        <Discount label={discount} className="absolute top-[-2px] right-3" />
      )}
    </div>
  );
};
