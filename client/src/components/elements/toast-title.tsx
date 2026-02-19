import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const toastTitleVariants = cva(
  "text-mauve-100 text-[22px]/[15px] font-primary translate-y-0.5",
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

export interface ToastTitleProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof toastTitleVariants> {
  title?: string;
}

export const ToastTitle = ({
  title,
  variant,
  className,
  style,
  ...props
}: ToastTitleProps) => {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(toastTitleVariants({ variant, className }))}
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)", ...style }}
        {...props}
      >
        {title}
      </span>
    </div>
  );
};
