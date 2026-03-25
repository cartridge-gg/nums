import { useId } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ShadowEffect } from "@/components/icons";
import { Selection, type SelectionProps, Close } from "@/components/elements";

export interface UsesProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof usesVariants> {
  use: SelectionProps;
  onClose?: () => void;
}

const usesVariants = cva(
  "h-auto w-full select-none flex flex-col gap-6 p-6 md:gap-12 md:p-12 relative",
  {
    variants: {
      variant: {
        default:
          "rounded-2xl md:rounded-3xl bg-black-200 border-2 border-black-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[16px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const Uses = ({
  use,
  onClose,
  variant,
  className,
  ...props
}: UsesProps) => {
  const filterId = useId();

  return (
    <div className={cn(usesVariants({ variant, className }))} {...props}>
      <ShadowEffect filterId={filterId} />

      {/* Close button */}
      <Close
        size="lg"
        onClick={onClose}
        className="absolute z-10 top-6 right-6 hidden md:flex"
      />

      {/* Title */}
      <div className="flex items-center justify-between">
        <h2
          className="font-primary text-[36px]/[24px] md:text-[48px]/[33px] tracking-wider uppercase translate-y-1 places-title"
          style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
        >
          Power up
        </h2>
        <Close size="md" className="md:hidden" onClick={onClose} />
      </div>

      {/* Use */}
      <Selection
        {...use}
        content="Use"
        buttonId="tutorial-use"
        className={cn("w-full", use.className)}
      />
    </div>
  );
};
