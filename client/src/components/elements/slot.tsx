import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { BrandIcon, LockerIcon } from "@/components/icons";
import type { Trap } from "@/types/trap";
import { useMemo, useEffect, useRef } from "react";
import SlotCounter from "react-slot-counter";

export interface SlotProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof slotVariants> {
  label?: number;
  value?: number;
  invalid?: boolean;
  loading?: boolean;
  inactive?: boolean;
  disabled?: boolean;
  trap?: Trap;
  onSlotClick?: () => void;
}

const slotVariants = cva(
  "select-none relative rounded-lg flex items-center justify-between border",
  {
    variants: {
      variant: {
        default: "bg-black-800 border border-black-700",
        placeholder: "border-black-800 justify-center text-mauve-100",
        locked: "border-black-700 bg-black-900 text-mauve-100",
      },
      size: {
        md: "h-10 w-[100px] md:w-[120px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export const Slot = ({
  label,
  value = 0,
  invalid = false,
  loading = false,
  inactive = false,
  disabled = false,
  trap,
  variant,
  size,
  className,
  onSlotClick,
  ...props
}: SlotProps) => {
  const isDisabled = useMemo(
    () => (!value && invalid) || !!value || disabled,
    [value, invalid, disabled],
  );

  const TrapIcon = useMemo(
    () => trap?.icon(inactive ? "used" : undefined),
    [inactive, trap],
  );

  const slotCounterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // [Info] Hack on the e char which is not centered in the font
    if (slotCounterRef.current) {
      const spans = slotCounterRef.current.querySelectorAll("span");
      spans.forEach((span) => {
        if (span.textContent === "e") {
          span.classList.add("ml-px");
        } else {
          span.classList.remove("ml-px");
        }
      });
    }
  }, [value]);

  if (variant === "placeholder") {
    return (
      <div
        className={cn(slotVariants({ variant, size, className }))}
        {...props}
      >
        <BrandIcon />
      </div>
    );
  }

  if (variant === "locked") {
    return (
      <div
        className={cn(slotVariants({ variant, size, className }))}
        {...props}
      >
        <div className="w-1/3 flex items-center justify-center">
          <LockerIcon />
        </div>
        <div className="h-6 w-2/3 border-l border-black-800 flex items-center justify-center">
          <p
            className="text-[22px] text-mauve-100 font-secondary tracking-wide font-bold text-center translate-y-px"
            style={{
              textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)",
            }}
          >
            {label}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(slotVariants({ variant, size, className }))} {...props}>
      {(!isDisabled || (invalid && !!value)) && (
        <>
          <div
            className={cn(
              "absolute inset-0 rounded-lg outline outline-1 animate-pulse-border-0 pointer-events-none",
              inactive || !trap ? "text-mauve-100" : trap.color(),
              invalid && "text-red-100",
            )}
          />
          <div
            className={cn(
              "absolute inset-0 rounded-lg outline outline-1 animate-pulse-border-1 pointer-events-none",
              inactive || !trap ? "text-mauve-100" : trap.color(),
              invalid && "text-red-100",
            )}
          />
          <div
            className={cn(
              "absolute inset-0 rounded-lg outline outline-1 animate-pulse-border-2 pointer-events-none",
              inactive || !trap ? "text-mauve-100" : trap.color(),
              invalid && "text-red-100",
            )}
          />
        </>
      )}
      <div className="w-1/3">
        {!TrapIcon ? (
          <p className="text-[22px] text-mauve-100 font-secondary tracking-wide font-bold text-center translate-y-px">
            {label}
          </p>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {TrapIcon && <TrapIcon className="text-mauve-100" />}
          </div>
        )}
      </div>
      <Button
        variant="muted"
        loading={loading}
        className={cn(
          "h-full w-2/3 rounded-lg relative bg-mauve-500 hover:bg-mauve-400 disabled:opacity-100 disabled:bg-white-900 disabled:text-white-500 disabled:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.04)_inset,1px_1px_0px_0px_rgba(0,0,0,0.04)]",
          !!value && isDisabled && "disabled:text-white-300",
          invalid && !!value && "bg-red-800 disabled:opacity-100",
          (!!value || invalid) && "pointer-events-none cursor-default",
          !!trap && !invalid && !inactive && trap.bgColor(),
        )}
        disabled={isDisabled || loading}
        onClick={onSlotClick}
      >
        <div
          ref={slotCounterRef}
          className={cn(
            "text-2xl font-secondary tracking-wide font-bold",
            invalid && !!value && "text-red-100",
          )}
          style={{
            textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)",
            transform: "translateY(2px)",
          }}
        >
          <SlotCounter
            value={value ? value.toString() : "Set"}
            startValueOnce={false}
            duration={0.6}
            dummyCharacters={"0123456789Set".split("")}
            animateOnVisible={false}
            useMonospaceWidth={true}
          />
        </div>
      </Button>
    </div>
  );
};
