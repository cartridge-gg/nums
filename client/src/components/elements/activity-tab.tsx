import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "../ui/button";

export interface ActivityTabProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof activityTabVariants> {
  active?: boolean;
}

const activityTabVariants = cva(
  "flex justify-center items-center whitespace-nowrap select-none cursor-pointer data-[active=true]:cursor-default rounded-full p-2 transition-colors",
  {
    variants: {
      variant: {
        default:
          "text-white-400 bg-black-800 hover:text-white-300 hover:bg-black-700 data-[active=true]:text-white-100 data-[active=true]:hover:text-white-100 data-[active=true]:bg-primary-700 data-[active=true]:hover:bg-primary-700 data-[active=true]:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.12)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
      },
      size: {
        md: "h-8 min-w-20",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export const ActivityTab = ({
  variant,
  size,
  className,
  children,
  active = false,
  ...props
}: ActivityTabProps) => {
  return (
    <Button
      variant="ghost"
      data-active={active}
      className={cn(activityTabVariants({ variant, size, className }))}
      {...props}
    >
      <p
        className="text-[22px]/[15px] tracking-wider translate-y-0.5 uppercase px-1"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        {children}
      </p>
    </Button>
  );
};
