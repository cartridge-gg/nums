import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Selection, type SelectionProps, Close } from "@/components/elements";
import { ShadowEffect } from "@/components/icons";
import { useId, useState } from "react";

export interface SelectionsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof selectionsVariants> {
  selections: SelectionProps[];
  onClose: () => void;
}

const selectionsVariants = cva(
  "select-none flex flex-col gap-4 p-4 md:gap-10 md:p-12",
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

export const Selections = ({
  selections,
  variant,
  className,
  ...props
}: SelectionsProps) => {
  const filterId = useId();
  const [hidden, setHidden] = useState(false);

  const showWhilePressHandlers = {
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      setHidden(true);
    },
    onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      setHidden(false);
    },
    onPointerCancel: () => setHidden(false),
    onPointerLeave: (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) {
        setHidden(false);
      }
    },
  };

  return (
    <div
      className={cn(
        selectionsVariants({ variant, className }),
        "relative",
        hidden && "hidden",
      )}
      {...props}
    >
      <ShadowEffect filterId={filterId} />
      <Close
        variant="eye"
        size="lg"
        {...showWhilePressHandlers}
        className="absolute z-10 top-6 right-6 hidden md:flex"
      />
      <div className="flex items-center justify-between">
        <h2
          className="font-primary text-[36px]/[24px] md:text-[48px]/[33px] tracking-wider uppercase translate-y-1"
          style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
        >
          <span className="">Take Power Up</span>
        </h2>
        <Close
          variant="eye"
          size="md"
          {...showWhilePressHandlers}
          className="md:hidden"
        />
      </div>
      <div className="flex flex-col md:flex-row gap-6 md:gap-10">
        {selections.map((selection, index) => (
          <Selection
            key={index}
            {...selection}
            id={`tutorial-select-${index}`}
            className={cn("flex-1", selection.className)}
          />
        ))}
      </div>
    </div>
  );
};
