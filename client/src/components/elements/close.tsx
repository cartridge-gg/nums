import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { CloseIcon, ShadowEffect } from "@/components/icons";
import { useId } from "react";
import { Button } from "../ui/button";

export interface CloseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof closeVariants> {}

const closeVariants = cva(
  "flex items-center justify-center bg-mauve-800 hover:bg-mauve-700 cursor-pointer rounded-lg text-white-100 p-0",
  {
    variants: {
      size: {
        md: "size-10",
        lg: "size-12",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export const Close = ({ size, className, ...props }: CloseProps) => {
  const filterId = useId();

  return (
    <Button
      variant="ghost"
      className={cn(closeVariants({ size, className }))}
      {...props}
    >
      <ShadowEffect filterId={filterId} />
      <CloseIcon size={size ?? "md"} style={{ filter: `url(#${filterId})` }} />
    </Button>
  );
};
