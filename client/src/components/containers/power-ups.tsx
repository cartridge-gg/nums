import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { PowerUp, type PowerUpProps } from "@/components/elements";

export interface PowerUpsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof powerUpsVariants> {
  powers: PowerUpProps[];
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
  ...props
}: PowerUpsProps) => {
  return (
    <div
      className={cn(powerUpsVariants({ variant, size, className }))}
      {...props}
    >
      <p className="w-full text-mauve-100 text-lg/3 md:text-lg/6 uppercase tracking-wider">
        Power Ups
      </p>
      <ul className="flex justify-center gap-3 w-full">
        {powers.map((powerProps, index) => (
          <li
            id={`tutorial-power-${index}`}
            key={`${index}`}
            className="flex-1"
          >
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
