import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

export interface GameIconProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameIconVariants> {
  cells: (boolean | null)[];
}

const gameIconVariants = cva(
  "rounded-sm grid grid-rows-5 grid-flow-col gap-px bg-black-800 p-[3px]",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const GameIcon = ({
  cells,
  variant,
  className,
  ...props
}: GameIconProps) => {
  return (
    <div className={cn(gameIconVariants({ variant, className }))} {...props}>
      {cells.map((cell, index) => (
        <div
          key={index}
          className={cn(
            "rounded-full min-w-1 max-w-1 min-h-0.5 max-h-0.5",
            cell === null && "bg-black-800",
            cell === false && "bg-black-700",
            cell === true && "bg-mauve-100",
          )}
        />
      ))}
    </div>
  );
};
