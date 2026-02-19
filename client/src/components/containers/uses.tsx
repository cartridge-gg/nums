import { useId } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { ShadowEffect, CloseIcon } from "@/components/icons";
import { Selection, type SelectionProps } from "@/components/elements";

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
          "rounded-t-2xl rounded-b-4xl bg-black-300 border-2 border-black-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[16px]",
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
      {onClose && (
        <Button
          variant="ghost"
          className="absolute z-10 top-6 right-6 h-12 w-12 p-0 text-white-400 hover:text-white-300 rounded"
          onClick={onClose}
        >
          <CloseIcon
            size="lg"
            className="md:hidden"
            style={{ filter: `url(#${filterId})` }}
          />
          <CloseIcon
            size="lg"
            className="hidden md:block"
            style={{ filter: `url(#${filterId})` }}
          />
        </Button>
      )}

      {/* Title */}
      <h2
        className="font-primary text-[48px]/[35px] tracking-wider uppercase translate-y-1 places-title"
        style={{
          textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)",
          wordBreak: "break-all",
        }}
      >
        Power up
      </h2>

      {/* Use */}
      <Selection
        {...use}
        content="Use"
        className={cn("w-full", use.className)}
      />
    </div>
  );
};
