import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { CheckIcon, CrossIcon, DashIcon } from "@/components/icons";

export type GovernanceChoice = "for" | "against" | "abstain";

export interface GovernanceVoteProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof governanceVoteVariants> {
  username: string;
  choice: GovernanceChoice;
  power: number;
}

const governanceVoteVariants = cva(
  "flex items-center gap-4 px-4 py-3 h-11 rounded-lg shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12),inset_1px_1px_0px_0px_rgba(255,255,255,0.04)]",
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
    rowClassName: string;
    badgeClassName: string;
  }
> = {
  for: {
    icon: CheckIcon,
    label: "For",
    rowClassName: "bg-green-800 text-green-100",
    badgeClassName: "bg-green-100",
  },
  against: {
    icon: CrossIcon,
    label: "Against",
    rowClassName: "bg-red-900 text-red-100",
    badgeClassName: "bg-red-100",
  },
  abstain: {
    icon: DashIcon,
    label: "Abstain",
    rowClassName: "bg-white-900 text-white-100",
    badgeClassName: "bg-white-100",
  },
};

export const GovernanceVote = ({
  username,
  choice,
  power,
  variant,
  className,
  ...props
}: GovernanceVoteProps) => {
  const {
    icon: Icon,
    label,
    rowClassName,
    badgeClassName,
  } = choiceConfig[choice];

  return (
    <div
      className={cn(
        governanceVoteVariants({ variant }),
        rowClassName,
        className,
      )}
      {...props}
    >
      <div className="w-[120px] truncate">
        <span className="font-sans text-base/5">{username}</span>
      </div>
      <div className="w-[120px] flex items-center gap-2">
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
      <div className="flex-1 text-right">
        <span className="font-sans text-base/5">{power.toLocaleString()}</span>
      </div>
    </div>
  );
};
