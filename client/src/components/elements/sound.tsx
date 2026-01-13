import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { SoundOffIcon, SoundOnIcon } from "@/components/icons";
import { useId } from "react";

export interface SoundProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof soundVariants> {
  isMuted: boolean;
}

const soundVariants = cva(
  "select-none relative rounded-lg flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "bg-mauve-700 hover:bg-mauve-500",
      },
      size: {
        md: "h-10 md:h-12 w-10 md:w-auto px-2 md:px-4 py-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export const Sound = ({
  isMuted,
  variant,
  size,
  className,
  ...props
}: SoundProps) => {
  const filterId = useId();
  return (
    <Button
      variant="muted"
      className={cn(soundVariants({ variant, size, className }))}
      {...props}
    >
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="2"
              dy="2"
              stdDeviation="0"
              floodColor="rgba(0, 0, 0, 0.95)"
            />
          </filter>
        </defs>
      </svg>
      {isMuted ? (
        <SoundOffIcon
          size="lg"
          variant="solid"
          className="min-w-6 min-h-6 md:min-w-8 md:min-h-8"
          style={{ filter: `url(#${filterId})` }}
        />
      ) : (
        <SoundOnIcon
          size="lg"
          variant="solid"
          className="min-w-6 min-h-6 md:min-w-8 md:min-h-8"
          style={{ filter: `url(#${filterId})` }}
        />
      )}
    </Button>
  );
};
