import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { PowerUp, type PowerUpProps } from "@/components/elements";

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
      <p className="w-full text-mauve-100 text-lg/6 uppercase tracking-wider">
        Power Ups
      </p>
      <ul className="flex justify-center gap-3 w-full">
        {powers.map((powerProps, index) => (
          <li key={`${index}`} className="w-full md:w-auto">
            <PowerUp
              {...powerProps}
              className={cn(
                "w-full md:w-auto",
                index === 0 && "rounded-bl-4xl md:rounded-bl-lg",
                index === powers.length - 1 &&
                  "rounded-br-4xl md:rounded-br-lg",
                powerProps.className,
              )}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
