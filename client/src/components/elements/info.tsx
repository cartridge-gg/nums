import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { CircleInfoIcon } from "@/components/icons";
import { useId } from "react";

export interface InfoProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof infoVariants> {}

const infoVariants = cva("h-10 w-10 p-0", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const Info = ({ variant, className, ...props }: InfoProps) => {
  const filterId = useId();
  return (
    <Button
      variant="muted"
      className={cn(infoVariants({ variant, className }))}
      {...props}
    >
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="2"
              dy="2"
              stdDeviation="0"
              floodColor="rgba(0, 0, 0, 0.25)"
            />
          </filter>
        </defs>
      </svg>
      <CircleInfoIcon size="md" style={{ filter: `url(#${filterId})` }} />
    </Button>
  );
};
