import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const toastDescriptionVariants = cva("flex gap-1 items-center", {
  variants: {
    variant: {
      default:
        "text-[24px]/5 text-white-100 font-secondary font-bold tracking-wide",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface ToastDescriptionProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastDescriptionVariants> {
  multiplier?: number;
  earning?: number;
  reward?: string;
}

export const getColor = (multiplier: number) => {
  if (multiplier > 6) return "text-red-100";
  if (multiplier > 1) return "text-yellow-100";
  return "text-mauve-100";
};

export const ToastDescription = ({
  multiplier,
  earning,
  reward,
  variant,
  className,
  ...props
}: ToastDescriptionProps) => {
  if (!!multiplier) {
    const color = getColor(multiplier);
    return (
      <div
        className={cn(toastDescriptionVariants({ variant, className }))}
        {...props}
      >
        <p>is playing a</p>
        <div className="mx-1 flex items-center justify-center px-1 py-[3px] bg-white-900 rounded -translate-y-0.5">
          <strong
            className={cn(
              "text-[22px]/[15px] font-primary translate-y-0.5",
              color,
            )}
          >{`${multiplier}x`}</strong>
        </div>
        <p>game</p>
      </div>
    );
  }
  if (!!earning) {
    return (
      <div
        className={cn(toastDescriptionVariants({ variant, className }))}
        {...props}
      >
        <p>earned</p>
        <div className="mx-1 flex items-center justify-center px-1 py-[3px] bg-white-900 rounded -translate-y-0.5">
          <strong className="text-[22px]/[15px] font-primary translate-y-0.5 text-green-100">
            {earning.toLocaleString()}
          </strong>
        </div>
        <p>NUMS</p>
      </div>
    );
  }
  if (!!reward) {
    return (
      <div
        className={cn(toastDescriptionVariants({ variant, className }))}
        {...props}
      >
        <p>{reward}</p>
      </div>
    );
  }
  return null;
};
