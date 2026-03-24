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
  const total = cells.length;
  const filled = cells.filter((cell) => cell === true).length;
  const angle = total > 0 ? (filled / total) * 360 : 0;

  return (
    <div className={cn(gameIconVariants({ variant, className }))} {...props}>
      <div
        className="h-4 w-4 rounded-full"
        style={{
          background: `conic-gradient(var(--mauve-100) ${angle}deg, transparent ${angle}deg)`,
        }}
      />
    </div>
  );
};
