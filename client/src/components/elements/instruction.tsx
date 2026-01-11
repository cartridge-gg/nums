import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

export interface InstructionProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof instructionVariants> {
  content: string;
}

const instructionVariants = cva(
  "select-none relative rounded-lg flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "bg-black-800 text-white-100 md:text-mauve-100",
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
  ...props
}: InstructionProps) => {
  return (
    <div
      className={cn(instructionVariants({ variant, size, className }))}
      {...props}
    >
      <span
        className="translate-y-0.5 md:translate-y-[3px] text-[22px] md:text-[28px]"
        style={{ textShadow: "2px 2px 0px rgba(28, 3, 101, 0.5)" }}
      >
        {content}
      </span>
    </div>
  );
};
