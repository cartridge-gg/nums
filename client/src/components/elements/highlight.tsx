import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

export interface HighlightProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof highlightVariants> {
  title: string;
  content: string;
}

const highlightVariants = cva(
  "flex flex-col gap-3 md:gap-4 rounded-lg p-4 md:px-6 md:py-5 bg-black-900 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.12)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
  {
    variants: {
      variant: {
        default: "",
      },
      size: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export const Highlight = ({
  title,
  content,
  variant,
  size,
  className,
  ...props
}: HighlightProps) => {
  return (
    <div
      className={cn(highlightVariants({ variant, size, className }))}
      {...props}
    >
      <span
        className="font-primary text-[22px]/[15px] md:text-[28px]/[19px] tracking-wider align-middle text-mauve-100 uppercase"
        style={{
          textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)",
        }}
      >
        {title}
      </span>
      <p
        className="font-primary text-[64px]/[44px] tracking-normal uppercase align-middle text-white-100 translate-y-1"
        style={{
          textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)",
        }}
      >
        {content}
      </p>
    </div>
  );
};
