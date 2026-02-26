import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Selection, type SelectionProps } from "@/components/elements";
import { Button } from "@/components/ui/button";
import { EyeIcon } from "@/components/icons";

export interface SelectionsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof selectionsVariants> {
  selections: SelectionProps[];
  onClose?: () => void;
}

const selectionsVariants = cva(
  "h-full md:h-auto select-none flex flex-col gap-6 p-6 md:gap-12 md:p-12",
  {
    variants: {
      variant: {
        default:
          "rounded-t-2xl rounded-b-4xl md:rounded-3xl bg-black-300 border-2 border-black-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[16px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const Selections = ({
  selections,
  onClose,
  variant,
  className,
  ...props
}: SelectionsProps) => {
  return (
    <div
      className={cn(selectionsVariants({ variant, className }), "relative")}
      {...props}
    >
      <div className="flex gap-6 justify-between md:items-center">
        {/* Title */}
        <h2
          className="font-primary text-[48px]/[35px] tracking-wider uppercase translate-y-1"
          style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
        >
          Take power up
        </h2>
        {onClose && (
          <Button
            variant="muted"
            className="w-auto h-12 bg-mauve-800 hover:bg-mauve-700 px-3 md:px-4 py-2 flex items-center justify-center gap-1"
            onClick={onClose}
          >
            <EyeIcon size="lg" />
            <span className="text-[28px]/[19px] hidden md:inline px-1 translate-y-0.5">
              Hide
            </span>
          </Button>
        )}
      </div>

      {/* Selections */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-10">
        {selections.map((selection, index) => (
          <Selection
            key={index}
            {...selection}
            className={cn("flex-1", selection.className)}
          />
        ))}
      </div>
    </div>
  );
};
