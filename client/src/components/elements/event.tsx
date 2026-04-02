import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Link } from "@/lib/router";

const eventVariants = cva("select-none flex gap-1", {
  variants: {
    variant: {
      default: "group cursor-pointer",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface EventProps
  extends React.HTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof eventVariants> {
  key: string;
  username: string;
  multiplier?: number;
  earning?: number;
  timestamp: number;
  id: string;
  price?: bigint;
}

const getColor = (multiplier: number) => {
  if (multiplier > 6) return "text-red-100 group-hover:text-red-200";
  if (multiplier > 1) return "text-yellow-100 group-hover:text-yellow-200";
  return "text-mauve-100 group-hover:text-mauve-200";
};

export const Event = ({
  username,
  multiplier,
  earning,
  id,
  variant,
  className,
  ...props
}: EventProps) => {
  return (
    <Link
      to={`/game/${id}`}
      className={cn(eventVariants({ variant, className }))}
      {...props}
    >
      {/* Username - similar to ToastTitle */}
      <div className="flex items-center gap-2 p-1 bg-white-900 rounded">
        <span
          className={cn(
            "text-mauve-100 text-lg/3 font-primary translate-y-px tracking-wider font-thin whitespace-nowrap",
            multiplier
              ? getColor(multiplier)
              : earning
                ? "text-green-100 group-hover:text-green-200"
                : "",
          )}
          style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
        >
          {username}
        </span>
      </div>

      {/* Description - similar to ToastDescription */}
      {multiplier !== undefined && (
        <div className="flex gap-1 items-center text-sm/5 text-white-100 group-hover:text-white-200 font-secondary font-bold tracking-wide">
          <p className="whitespace-nowrap">is playing a</p>
          <div className="mx-1 flex items-center justify-center p-1 bg-white-900 rounded">
            <strong
              className={cn(
                "text-lg/3 font-primary translate-y-px tracking-wider font-thin whitespace-nowrap",
                getColor(multiplier),
              )}
            >{`${multiplier.toFixed(2)}x`}</strong>
          </div>
          <p className="whitespace-nowrap">game</p>
        </div>
      )}

      {earning !== undefined && (
        <div className="flex gap-1 items-center text-sm/5 text-white-100 group-hover:text-white-200 font-secondary font-bold tracking-wide">
          <p className="whitespace-nowrap">earned</p>
          <div className="mx-1 flex items-center justify-center p-1 bg-white-900 rounded">
            <strong className="text-lg/3 font-primary translate-y-px text-green-100 group-hover:text-green-200 tracking-wider font-thin whitespace-nowrap">
              {earning.toLocaleString()}
            </strong>
          </div>
          <p className="whitespace-nowrap">NUMS</p>
        </div>
      )}
    </Link>
  );
};
