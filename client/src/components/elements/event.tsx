import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const eventVariants = cva("select-none flex gap-1", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface EventProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof eventVariants> {
  username: string;
  multiplier?: number;
  earning?: number;
  timestamp: number;
  id: string;
}

const getColor = (multiplier: number) => {
  if (multiplier > 6) return "text-red-100";
  if (multiplier > 1) return "text-yellow-100";
  return "text-mauve-100";
};

export const Event = ({
  username,
  multiplier,
  earning,
  variant,
  className,
  ...props
}: EventProps) => {
  return (
    <div className={cn(eventVariants({ variant, className }))} {...props}>
      {/* Username - similar to ToastTitle */}
      <div className="flex items-center gap-2 p-1 bg-white-900 rounded">
        <span
          className={cn(
            "text-mauve-100 text-lg/3 font-primary translate-y-px tracking-wider font-thin whitespace-nowrap",
            multiplier ? getColor(multiplier) : earning ? "text-green-100" : "",
          )}
          style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
        >
          {username}
        </span>
      </div>

      {/* Description - similar to ToastDescription */}
      {multiplier !== undefined && (
        <div className="flex gap-1 items-center text-xl/[10px] text-white-100 font-secondary font-bold tracking-wide">
          <p className="whitespace-nowrap translate-y-px">is playing a</p>
          <div className="mx-1 flex items-center justify-center p-1 bg-white-900 rounded">
            <strong
              className={cn(
                "text-lg/3 font-primary translate-y-px tracking-wider font-thin whitespace-nowrap",
                getColor(multiplier),
              )}
            >{`${multiplier}x`}</strong>
          </div>
          <p className="whitespace-nowrap translate-y-px">game</p>
        </div>
      )}

      {earning !== undefined && (
        <div className="flex gap-1 items-center text-xl/[10px] text-white-100 font-secondary font-bold tracking-wide">
          <p className="whitespace-nowrap translate-y-px">earned</p>
          <div className="mx-1 flex items-center justify-center p-1 bg-white-900 rounded">
            <strong className="text-lg/3 font-primary translate-y-px text-green-100 tracking-wider font-thin whitespace-nowrap">
              {earning.toLocaleString()}
            </strong>
          </div>
          <p className="whitespace-nowrap translate-y-0.5">NUMS</p>
        </div>
      )}
    </div>
  );
};
