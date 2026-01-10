import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Stage, type StageState } from "@/components/elements";

export interface StageProps
  extends React.HTMLAttributes<HTMLUListElement>,
    VariantProps<typeof stageVariants> {
  states: Array<StageState>;
}

const stageVariants = cva(
  "select-none relative rounded grid grid-cols-10 gap-2",
  {
    variants: {
      variant: {
        default: "",
      },
      size: {
        md: "h-6",
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
}: StageProps) => {
  return (
    <ul className={cn(stageVariants({ variant, size, className }))} {...props}>
      {states.map((state, index) => (
        <li key={`${index}-${JSON.stringify(state)}`}>
          <Stage state={state} className="" />
        </li>
      ))}
    </ul>
  );
};
