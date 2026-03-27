import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { BrandIcon, LockerIcon } from "@/components/icons";
import type { Trap } from "@/types/trap";
import { TrapType } from "@/types/trap";
import { useMemo, useEffect, useRef } from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import SlotCounter from "react-slot-counter";
import { useAudio } from "@/context/audio";

export interface SlotProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof slotVariants> {
  label?: number;
  value?: number;
  invalid?: boolean;
  highlight?: boolean;
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
        placeholder: "border-black-800 justify-center text-primary-100",
        locked: "border-black-700 bg-black-900 text-primary-100",
      },
      size: {
        md: "min-h-8 max-h-10 md:h-10 w-[100px] md:w-[120px]",
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
  highlight = false,
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
  const { playBomb, playReroll, playMagnet, playUfo, playWindy } = useAudio();
  const prevInactiveRef = useRef(inactive);

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
    if (trap && !prevInactiveRef.current && inactive) {
      switch (trap.value) {
        case TrapType.Bomb:
          playBomb();
          break;
        case TrapType.Lucky:
          playReroll();
          break;
        case TrapType.Magnet:
          playMagnet();
          break;
        case TrapType.UFO:
          playUfo();
          break;
        case TrapType.Windy:
          playWindy();
          break;
      }
    }
    prevInactiveRef.current = inactive;
  }, [inactive, trap, playBomb, playReroll, playMagnet, playUfo, playWindy]);

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
            className="text-[22px] text-primary-100 font-secondary tracking-wide font-bold text-center translate-y-px"
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
      {(!isDisabled || (invalid && !!value) || (highlight && !!value)) && (
        <>
          <Wave
            inactive={inactive}
            trap={trap}
            invalid={invalid}
            highlight={highlight}
            className="animate-pulse-border-0"
          />
          <Wave
            inactive={inactive}
            trap={trap}
            invalid={invalid}
            highlight={highlight}
            className="animate-pulse-border-1"
          />
          <Wave
            inactive={inactive}
            trap={trap}
            invalid={invalid}
            highlight={highlight}
            className="animate-pulse-border-2"
          />
        </>
      )}
      <div className="w-1/3">
        {!TrapIcon ? (
          <p className="text-[22px]/[15px] text-primary-100 font-secondary tracking-wide font-bold text-center translate-y-px">
            {label}
          </p>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full h-full flex items-center justify-center">
                {TrapIcon && <TrapIcon className="text-primary-100" />}
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="left"
              sideOffset={8}
              className="hidden md:flex flex-col items-center gap-6 rounded-lg p-6 bg-black-300 backdrop-blur-[16px] border-2 border-black-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] max-w-[250px]"
            >
              {trap &&
                (() => {
                  const ShadowIcon = trap.icon("shadow");
                  return ShadowIcon ? (
                    <ShadowIcon size="3xl" className={trap.color()} />
                  ) : null;
                })()}
              <div className="w-full flex flex-col gap-4">
                <h3 className="font-primary text-[36px]/6 tracking-wider text-white-100 uppercase">
                  {trap?.name()}
                </h3>
                <p className="text-2xl/[18px] font-secondary tracking-wider">
                  {trap?.description()}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <Button
        variant="muted"
        placeSound
        loading={loading}
        className={cn(
          "py-0 h-full w-2/3 rounded-lg relative bg-primary-500 hover:bg-primary-400 disabled:opacity-100 disabled:bg-white-900 disabled:text-white-500 disabled:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.04)_inset,1px_1px_0px_0px_rgba(0,0,0,0.04)]",
          !!value && isDisabled && "disabled:text-white-300",
          highlight && !!value && "disabled:bg-green-600",
          invalid && !!value && "disabled:bg-red-800 disabled:opacity-100",
          (!!value || invalid) && "pointer-events-none cursor-default",
          !!trap && !invalid && !inactive && trap.bgColor(),
        )}
        disabled={isDisabled || loading}
        onClick={onSlotClick}
      >
        <div
          ref={slotCounterRef}
          className={cn(
            "text-2xl/[18px] font-secondary tracking-wide font-bold",
            highlight && !invalid && !!value && "text-green-100",
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

const Wave = ({
  inactive,
  trap,
  invalid,
  highlight,
  className,
}: {
  inactive: boolean;
  trap?: Trap;
  invalid: boolean;
  highlight: boolean;
  className: string;
}) => {
  return (
    <div
      className={cn(
        "absolute inset-0 rounded-lg outline outline-1 pointer-events-none",
        inactive || !trap ? "text-primary-100" : trap.color(),
        highlight && "text-green-100",
        invalid && "text-red-100",
        className,
      )}
    />
  );
};
