import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Stage, type StageState } from "@/components/elements";

export interface StagesProps
  extends React.HTMLAttributes<HTMLUListElement>,
    VariantProps<typeof stagesVariants> {
  states: Array<StageState>;
}

const stagesVariants = cva(
  "select-none relative rounded grid grid-cols-9 gap-1 xs:gap-2",
  {
    variants: {
      variant: {
        default: "",
        over: "",
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

export const Stages = ({
  states,
  variant,
  size,
  className,
  ...props
}: StagesProps) => {
  return (
    <ul className={cn(stagesVariants({ variant, size, className }))} {...props}>
      {states.map((state, index) => (
        <li key={`${index}-${JSON.stringify(state)}`}>
          <Stage state={state} className="" variant={variant} />
        </li>
      ))}
    </ul>
  );
};
