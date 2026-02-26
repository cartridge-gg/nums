import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

export interface InstructionProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof instructionVariants> {
  content: string;
}

const instructionVariants = cva(
  "select-none relative rounded-lg flex items-center justify-center transition-all duration-150",
  {
    variants: {
      variant: {
        default: "bg-black-800 text-white-100",
        destructive: "bg-black-800 text-red-100",
      },
      size: {
        md: "h-10 md:h-12 w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export const Instruction = ({
  content,
  variant,
  size,
  className,
  onClick,
  ...props
}: InstructionProps) => {
  return (
    <div
      className={cn(
        instructionVariants({ variant, size, className }),
        !!onClick && "cursor-pointer hover:bg-black-700",
      )}
      onClick={onClick}
      {...props}
    >
      <>
        <div
          className={cn(
            "absolute inset-0 rounded-lg outline outline-1 animate-pulse-border-0 pointer-events-none",
            !onClick
              ? "hidden"
              : variant != "destructive"
                ? "text-mauve-100"
                : "text-red-100",
          )}
        />
        <div
          className={cn(
            "absolute inset-0 rounded-lg outline outline-1 animate-pulse-border-1 pointer-events-none",
            !onClick
              ? "hidden"
              : variant != "destructive"
                ? "text-mauve-100"
                : "text-red-100",
          )}
        />
        <div
          className={cn(
            "absolute inset-0 rounded-lg outline outline-1 animate-pulse-border-2 pointer-events-none",
            !onClick
              ? "hidden"
              : variant != "destructive"
                ? "text-mauve-100"
                : "text-red-100",
          )}
        />
      </>
      <span className="translate-y-0.5 md:translate-y-[3px] text-[22px] md:text-[28px] tracking-wider">
        {content}
      </span>
    </div>
  );
};
