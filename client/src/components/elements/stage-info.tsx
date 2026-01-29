import { useId } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { CircleInfoIcon } from "@/components/icons";

export interface StageInfoProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stageInfoVariants> {}

const stageInfoVariants = cva(
  "select-none relative flex justify-center items-center rounded-lg p-3",
  {
    variants: {
      variant: {
        default:
          "bg-black-800 hover:bg-black-700 hover:cursor-pointer transition-colors duration-150",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const StageInfo = ({ variant, className, ...props }: StageInfoProps) => {
  const filterId = useId();

  return (
    <div className={cn(stageInfoVariants({ variant, className }))} {...props}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="2"
              dy="2"
              stdDeviation="0"
              floodColor="rgba(0, 0, 0, 0.25)"
            />
          </filter>
        </defs>
      </svg>
      <CircleInfoIcon
        className="text-mauve-100 h-6 w-6 md:h-8 md:w-8"
        style={{ filter: `url(#${filterId})` }}
      />
    </div>
  );
};
