import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Close } from "@/components/elements";
import {
  GovernanceProposals,
  type GovernanceProposalsProps,
} from "@/components/containers/governance-proposals";
import {
  GovernanceResults,
  type GovernanceResultsProps,
} from "@/components/containers/governance-results";
import {
  GovernanceVotes,
  type GovernanceVotesProps,
} from "@/components/containers/governance-votes";

const governanceSceneVariants = cva(
  "select-none flex flex-col md:flex-row gap-6 md:gap-10 p-6 md:py-[120px]",
  {
    variants: {
      variant: {
        default:
          "rounded-2xl md:rounded-3xl bg-black-200 backdrop-blur-[8px] border-[2px] border-black-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface GovernanceSceneProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "results">,
    VariantProps<typeof governanceSceneVariants> {
  proposals: GovernanceProposalsProps["proposals"];
  results: Pick<
    GovernanceResultsProps,
    "forCount" | "againstCount" | "abstainCount"
  >;
  votes: GovernanceVotesProps["votes"];
  onClose?: () => void;
}

export const GovernanceScene = ({
  proposals,
  results,
  votes,
  onClose,
  variant,
  className,
  ...props
}: GovernanceSceneProps) => {
  return (
    <div
      className={cn(governanceSceneVariants({ variant, className }))}
      {...props}
    >
      <div
        className="flex flex-col md:hidden gap-6 w-full h-full pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="flex items-center justify-between w-full">
          <Title />
          <Close size="md" onClick={onClose} />
        </div>

        <div
          className="flex-1 flex flex-col gap-6 overflow-hidden"
          style={{ scrollbarWidth: "none" }}
        >
          <GovernanceProposals proposals={proposals} />
          <div
            className="flex-1 flex flex-col gap-6 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          >
            <GovernanceResults {...results} />
            <GovernanceVotes votes={votes} />
          </div>
        </div>
      </div>

      <div className="hidden md:flex md:flex-col md:items-stretch overflow-hidden h-full w-full">
        <Close
          size="lg"
          onClick={onClose}
          className="absolute z-10 top-8 right-8"
        />

        <div className="h-full w-full max-w-[880px] self-center overflow-hidden flex flex-col gap-6">
          <Title />
          <div className="flex flex-row gap-8 flex-1 overflow-hidden">
            <div className="flex flex-col gap-6 w-1/2 max-w-1/2">
              <GovernanceProposals proposals={proposals} />
              <GovernanceResults {...results} />
            </div>

            <div className="flex flex-col w-1/2 max-w-1/2 overflow-hidden">
              <GovernanceVotes votes={votes} className="flex-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Title = () => (
  <h2
    className="text-[36px]/6 md:text-[64px]/[44px] text-white-100 uppercase tracking-wider translate-y-0.5"
    style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
  >
    Governance
  </h2>
);
