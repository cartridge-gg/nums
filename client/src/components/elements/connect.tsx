import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";

export interface ConnectProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof connectVariants> {}

const connectVariants = cva(
  "select-none relative rounded-lg flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "bg-black-700 hover:bg-black-900 text-yellow-100",
      },
      size: {
        md: "h-10 md:h-12 px-3 md:px-4 py-2 tracking-wider text-[22px] md:text-[28px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export const Connect = ({
  variant,
  size,
  className,
  ...props
}: ConnectProps) => {
  return (
    <Button
      variant="default"
      className={cn(connectVariants({ variant, size, className }))}
      {...props}
    >
      <p
        className={cn("translate-y-0.5 tracking-wide")}
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 1)" }}
      >
        Connect
      </p>
    </Button>
  );
};
