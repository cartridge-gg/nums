import { useId } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ShareIcon, ShadowEffect } from "@/components/icons";
import { Button } from "../ui/button";

export interface ShareProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof shareVariants> {
  disabled?: boolean;
}

const shareVariants = cva(
  "select-none relative flex justify-center items-center rounded-lg p-2",
  {
    variants: {
      variant: {
        default:
          "bg-black-800 hover:bg-black-700 hover:cursor-pointer transition-colors duration-150",
      },
      size: {
        md: "h-10 w-10 md:h-12 md:w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export const Share = ({
  variant,
  size,
  className,
  disabled,
  ...props
}: ShareProps) => {
  const filterId = useId();

  return (
    <Button
      disabled={disabled}
      variant="ghost"
      className={cn(shareVariants({ variant, size, className }))}
      {...props}
    >
      <ShadowEffect filterId={filterId} />
      <ShareIcon
        className="text-mauve-100 h-6 w-6 md:h-8 md:w-8"
        style={{ filter: `url(#${filterId})` }}
      />
    </Button>
  );
};
