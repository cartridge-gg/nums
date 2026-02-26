import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

export interface MultiplierProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof multiplierVariants> {
  /** Multiplier value, usually between 1 and 10 */
  multiplier: number;
}

const multiplierVariants = cva(
  "select-none relative rounded-lg px-4 py-3 md:px-3 flex flex-col md:flex-row justify-center items-center gap-1 overflow-visible",
  {
    variants: {
      variant: {
        default: "w-auto h-full md:w-[136px] bg-black-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const getColor = (multiplier: number) => {
  if (multiplier > 6) return "text-red-100";
  if (multiplier > 1) return "text-yellow-100";
  return "text-mauve-100";
};

export const Multiplier = ({
  multiplier,
  variant,
  className,
  ...props
}: MultiplierProps) => {
  const displayValue = `${Math.round(multiplier)}x`;

  // multiplier 1→10: top -50px→-100px, bg-size 100%→150%
  const clamped = Math.min(10, Math.max(1, multiplier));
  const t = (clamped - 1) / 9;
  const fireStyle = {
    "--fire-top": `${-50 - t * 50}px`,
    "--fire-bg-size": `${100 + t * 50}%`,
    "--fire-contrast": 3 + clamped * 0.3,
  } as React.CSSProperties;

  return (
    <div className={cn(multiplierVariants({ variant, className }))} {...props}>
      {/* Fire animation - covers entire div, above (in layout) the content */}
      <div
        className="multiplier-fire absolute inset-0 rounded-lg overflow-visible"
        style={fireStyle}
        aria-hidden
      />
      <p
        className={cn(
          "relative z-10 text-[28px]/[19px] tracking-wider translate-y-0.5",
          getColor(multiplier),
        )}
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        {displayValue}
      </p>
    </div>
  );
};
