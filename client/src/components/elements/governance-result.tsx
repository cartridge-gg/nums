import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { CheckIcon, CrossIcon, DashIcon } from "@/components/icons";
import type { GovernanceChoice } from "./governance-vote";

export interface GovernanceResultProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof governanceResultVariants> {
  choice: GovernanceChoice;
  count: number;
  total: number;
}

const governanceResultVariants = cva(
  "select-none flex flex-col gap-2 items-stretch",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const choiceConfig: Record<
  GovernanceChoice,
  {
    icon: typeof CheckIcon;
    label: string;
    textClassName: string;
    badgeClassName: string;
    barClassName: string;
  }
> = {
  for: {
    icon: CheckIcon,
    label: "For",
    textClassName: "text-green-100",
    badgeClassName: "bg-green-100",
    barClassName: "bg-green-100",
  },
  against: {
    icon: CrossIcon,
    label: "Against",
    textClassName: "text-red-100",
    badgeClassName: "bg-red-100",
    barClassName: "bg-red-100",
  },
  abstain: {
    icon: DashIcon,
    label: "Abstain",
    textClassName: "text-white-100",
    badgeClassName: "bg-white-100",
    barClassName: "bg-white-100",
  },
};

export const GovernanceResult = ({
  choice,
  count,
  total,
  variant,
  className,
  ...props
}: GovernanceResultProps) => {
  const {
    icon: Icon,
    label,
    textClassName,
    badgeClassName,
    barClassName,
  } = choiceConfig[choice];
  const ratio = total > 0 ? count / total : 0;
  const progress = Math.min(ratio * 100, 100);

  return (
    <div
      className={cn(governanceResultVariants({ variant, className }))}
      {...props}
    >
      <div className="flex justify-between items-center gap-4">
        <div className={cn("flex items-center gap-2", textClassName)}>
          <div
            className={cn(
              "size-4 rounded-full flex items-center justify-center text-black",
              badgeClassName,
            )}
          >
            <Icon size="xs" />
          </div>
          <span className="font-sans text-base/5">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-sans text-base/5 text-white-100">
            {count.toLocaleString()}
          </span>
          <span className="font-sans text-base/5 text-white-400">
            {(ratio * 100).toFixed(2)}%
          </span>
        </div>
      </div>
      <div className="relative h-4 w-full overflow-hidden rounded-full bg-white-800 p-1">
        <div
          className={cn("h-full rounded-full transition-all", barClassName)}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
