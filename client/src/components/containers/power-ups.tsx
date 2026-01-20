import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { PowerUp, type PowerUpProps } from "@/components/elements";
import { CircleInfoIcon } from "@/components/icons";

export interface PowerUpsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof powerUpsVariants> {
  powers: PowerUpProps[];
  onInfoClick?: () => void;
}

const powerUpsVariants = cva(
  "select-none relative flex flex-col justify-between items-center gap-2",
  {
    variants: {
      variant: {
        default: "",
      },
      size: {
        md: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export const PowerUps = ({
  powers,
  variant,
  size,
  className,
  onInfoClick,
  ...props
}: PowerUpsProps) => {
  return (
    <div
      className={cn(powerUpsVariants({ variant, size, className }))}
      {...props}
    >
      <div
        className="flex justify-between items-center w-full cursor-pointer group"
        onClick={onInfoClick}
      >
        <p className="text-mauve-100 group-hover:text-mauve-200 text-lg/6 uppercase tracking-wider transition-colors duration-150">
          Power Ups
        </p>
        <CircleInfoIcon className="text-mauve-100 group-hover:text-mauve-200 transition-colors duration-150" />
      </div>
      <ul className="flex justify-center gap-3 w-full">
        {powers.map((powerProps, index) => (
          <li key={`${index}`} className="w-full md:w-auto">
            <PowerUp
              {...powerProps}
              className={cn("w-full md:w-auto", powerProps.className)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
