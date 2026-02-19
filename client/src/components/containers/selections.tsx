import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Selection, type SelectionProps } from "@/components/elements";

export interface SelectionsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof selectionsVariants> {
  selections: SelectionProps[];
}

const selectionsVariants = cva(
  "h-full md:h-auto select-none flex flex-col gap-6 p-6 md:gap-12 md:p-12",
  {
    variants: {
      variant: {
        default:
          "rounded-t-lg rounded-b-2xl bg-black-300 border-2 border-black-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[16px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const Selections = ({
  selections,
  variant,
  className,
  ...props
}: SelectionsProps) => {
  return (
    <div className={cn(selectionsVariants({ variant, className }))} {...props}>
      {/* Title */}
      <h2
        className="font-primary text-[64px]/[44px] tracking-wider uppercase translate-y-1"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        Choose power up
      </h2>

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
