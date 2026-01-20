import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { PowerUp, type PowerUpProps } from "@/components/elements";
import { CircleInfoIcon } from "@/components/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    <TooltipProvider>
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
          {powers.map((powerProps, index) => {
            const power = powerProps.power;
            const hasPower = power && !power.isNone();
            return (
              <li key={`${index}`} className="w-full md:w-auto">
                {hasPower ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <PowerUp
                          {...powerProps}
                          className={cn(
                            "w-full md:w-auto",
                            powerProps.className,
                          )}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[288px] rounded-lg bg-black-300 border-[2px] border-black-300 flex flex-col gap-3 p-6 shadow-[0_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[8px]">
                      <p className="text-[22px]/[15px] tracking-wider uppercase translate-y-0.5">
                        {power.name()}
                      </p>
                      <p className="font-secondary text-[24px]/[14.5px] tracking-wider font-bold">
                        {power.description()}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <PowerUp
                    {...powerProps}
                    className={cn("w-full md:w-auto", powerProps.className)}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </TooltipProvider>
  );
};
