import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

export interface StatProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statVariants> {
  title: string;
  content: string;
}

const statVariants = cva(
  "select-none flex flex-col gap-3 rounded-xl px-5 py-4",
  {
    variants: {
      variant: {
        default: "bg-white-900 border border-white-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const Stat = ({
  title,
  content,
  variant,
  className,
  ...props
}: StatProps) => {
  return (
    <div className={cn(statVariants({ variant, className }))} {...props}>
      {/* Title */}
      <h3 className="text-lg/3 text-mauve-100 uppercase translate-y-0.5 tracking-wider">
        {title}
      </h3>

      {/* Content */}
      <p
        className="text-[28px]/[19px] text-white-100 translate-y-0.5 tracking-wider"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        {content}
      </p>
    </div>
  );
};
