import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";

export interface PlayProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof playVariants> {}

const playVariants = cva("w-full md:w-auto", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const Play = ({ variant, className, ...props }: PlayProps) => {
  return (
    <Button
      variant="default"
      className={cn(playVariants({ variant, className }))}
      {...props}
    >
      <p
        className="text-[28px]/[15px] tracking-wide translate-y-0.5"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
      >
        Play!
      </p>
    </Button>
  );
};
