import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  GovernanceVote,
  type GovernanceVoteProps,
} from "@/components/elements/governance-vote";

export interface GovernanceVotesProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof governanceVotesVariants> {
  votes: GovernanceVoteProps[];
}

const governanceVotesVariants = cva(
  "select-none w-full flex flex-col rounded-xl p-4 pb-0 gap-3 md:overflow-y-auto",
  {
    variants: {
      variant: {
        default: "bg-black-900 border-2 border-white-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const GovernanceVotes = ({
  votes,
  variant,
  className,
  ...props
}: GovernanceVotesProps) => {
  return (
    <div
      className={cn(governanceVotesVariants({ variant, className }))}
      style={{ scrollbarWidth: "none" }}
      {...props}
    >
      <div
        className="flex items-start px-4 gap-4"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        <span className="w-[120px] text-[18px]/[12px] tracking-wider text-white-400">
          Voter
        </span>
        <span className="w-[120px] text-[18px]/[12px] tracking-wider text-white-400">
          Choice
        </span>
        <span className="flex-1 text-[18px]/[12px] tracking-wider text-white-400 text-right">
          Power
        </span>
      </div>
      {votes.length === 0 ? (
        <div className="h-full flex items-center justify-center py-8 mb-4">
          <p className="text-primary-100 text-[22px]/[20px] tracking-wider translate-y-0.5 text-center">
            No votes yet
          </p>
        </div>
      ) : (
        votes.map((vote, index) => <GovernanceVote key={index} {...vote} />)
      )}
    </div>
  );
};
