import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

export interface GameIconProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameIconVariants> {
  cells: (boolean | null)[];
}

const gameIconVariants = cva("rounded-full flex items-center justify-center", {
  variants: {
    variant: {
      default: "h-5 w-5 bg-black-800",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const GameIcon = ({
  cells,
  variant,
  className,
  ...props
}: GameIconProps) => {
  const filled = cells.filter((cell) => cell === true).length;
  const total = cells.filter((cell) => cell === true || cell === false).length;
  const angle = total > 0 ? (filled / total) * 360 : 0;

  return (
    <div className={cn(gameIconVariants({ variant, className }))} {...props}>
      <div
        className="h-4 w-4 rounded-full text-primary-100"
        style={{
          background: `conic-gradient(currentColor ${angle}deg, transparent ${angle}deg)`,
        }}
      />
    </div>
  );
};
