import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { GovernanceResult } from "@/components/elements/governance-result";

export interface GovernanceResultsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof governanceResultsVariants> {
  forCount: number;
  againstCount: number;
  abstainCount: number;
}

const governanceResultsVariants = cva(
  "select-none flex flex-col p-6 gap-4 rounded-xl shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12),inset_1px_1px_0px_0px_rgba(255,255,255,0.04)]",
  {
    variants: {
      variant: {
        default: "bg-white-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const GovernanceResults = ({
  forCount,
  againstCount,
  abstainCount,
  variant,
  className,
  ...props
}: GovernanceResultsProps) => {
  const total = forCount + againstCount + abstainCount;

  return (
    <div
      className={cn(governanceResultsVariants({ variant, className }))}
      {...props}
    >
      <span className="font-sans text-sm/[18px] text-white-400">Results</span>
      <div className="flex flex-col gap-3">
        <GovernanceResult choice="for" count={forCount} total={total} />
        <GovernanceResult choice="abstain" count={abstainCount} total={total} />
        <GovernanceResult choice="against" count={againstCount} total={total} />
      </div>
    </div>
  );
};
