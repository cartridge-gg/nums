import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Selection, type SelectionProps } from "@/components/elements";
import { Button } from "@/components/ui/button";
import { CloseIcon, ShadowEffect } from "@/components/icons";
import { useId } from "react";

export interface SelectionsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof selectionsVariants> {
  selections: SelectionProps[];
  onClose: () => void;
}

const selectionsVariants = cva(
  "h-full md:h-auto select-none flex flex-col gap-6 p-6 md:gap-12 md:p-12",
  {
    variants: {
      variant: {
        default:
          "rounded-t-2xl rounded-b-4xl md:rounded-3xl bg-black-300 border-2 border-black-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[16px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const Selections = ({
  selections,
  onClose,
  variant,
  className,
  ...props
}: SelectionsProps) => {
  const filterId = useId();
  return (
    <div
      className={cn(selectionsVariants({ variant, className }), "relative")}
      {...props}
    >
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
      <h2
        className="font-primary text-[48px]/[35px] tracking-wider uppercase translate-y-1"
        style={{
          textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)",
        }}
      >
        <span className="hidden md:inline">Take Power Up</span>
        <span className="md:hidden">
          Take
          <br />
          Power up
        </span>
      </h2>

      {/* Selections */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-10">
        {selections.map((selection, index) => (
          <Selection
            key={index}
            {...selection}
            className={cn("flex-1", selection.className)}
          />
        ))}
      </div>
    </div>
  );
};
